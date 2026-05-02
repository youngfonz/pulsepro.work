import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifySlackSignature } from '@/lib/slack'
import { parseTaskFromVoice } from '@/lib/voice'
import { checkLimitForUser } from '@/lib/subscription'

function ephemeral(text: string) {
  return NextResponse.json({ response_type: 'ephemeral', text })
}

export async function POST(request: NextRequest) {
  const signingSecret = process.env.SLACK_SIGNING_SECRET
  if (!signingSecret) return ephemeral('Slack integration is not configured.')

  // Verify the request came from Slack
  const timestamp = request.headers.get('x-slack-request-timestamp') ?? ''
  const signature = request.headers.get('x-slack-signature') ?? ''
  const rawBody = await request.text()

  if (!verifySlackSignature(rawBody, timestamp, signature, signingSecret)) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const params = new URLSearchParams(rawBody)
  const teamId = params.get('team_id') ?? ''
  const userId = params.get('user_id') ?? ''
  const text = (params.get('text') ?? '').trim()

  // Look up Pulse Pro user by Slack workspace identity
  const subscription = await prisma.subscription.findFirst({
    where: { slackTeamId: teamId, slackUserId: userId },
    select: { userId: true },
  })

  if (!subscription) {
    return ephemeral(
      "Slack isn't linked to a Pulse Pro account. Visit pulsepro.work/settings to connect."
    )
  }

  const pulseUserId = subscription.userId

  if (!text) {
    return ephemeral('Usage: `/pulse [Project] task title` — e.g. `/pulse [Acme] Write proposal`')
  }

  // Check task limit
  const limit = await checkLimitForUser(pulseUserId, 'tasks')
  if (!limit.allowed) {
    return ephemeral(`Free plan limit: ${limit.limit} tasks. Upgrade to Pro for unlimited.`)
  }

  // Extract [Project Name] from the start of the text
  let projectName: string | undefined
  let cleanedText = text
  const projectMatch = text.match(/^\[([^\]]+)\]\s*(.+)$/)
  if (projectMatch) {
    projectName = projectMatch[1].trim()
    cleanedText = projectMatch[2].trim()
  }

  // Parse title, priority, and due date from remaining text
  const parsed = parseTaskFromVoice(cleanedText)
  const title = parsed.title || cleanedText

  // Resolve project by name (case-insensitive)
  let projectId: string | undefined
  let resolvedProjectName: string | undefined
  if (projectName) {
    const found = await prisma.project.findFirst({
      where: {
        userId: pulseUserId,
        name: { equals: projectName, mode: 'insensitive' },
      },
      select: { id: true, name: true },
    })
    if (found) {
      projectId = found.id
      resolvedProjectName = found.name
    }
  }

  const priority = parsed.priority ?? 'medium'
  const parsedDueDate: Date | null = parsed.dueDate ? new Date(parsed.dueDate) : null

  const task = await prisma.task.create({
    data: {
      userId: pulseUserId,
      title,
      priority,
      dueDate: parsedDueDate,
      projectId,
    },
    select: { id: true, title: true },
  })

  // Reopen completed project when a task is added
  if (projectId) {
    await prisma.project.updateMany({
      where: { id: projectId, status: 'completed' },
      data: { status: 'in_progress' },
    })
  }

  const parts = [`✓ Added: ${task.title}`]
  if (resolvedProjectName) parts.push(`in *${resolvedProjectName}*`)
  if (priority !== 'medium') parts.push(`(${priority} priority)`)
  if (parsedDueDate) {
    parts.push(`due ${parsedDueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`)
  }

  return ephemeral(parts.join(' '))
}
