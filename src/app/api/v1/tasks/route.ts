import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdminUser } from '@/lib/auth'
import { parseTaskFromVoice } from '@/lib/voice'
import crypto from 'crypto'

/**
 * Extract project name from natural language text.
 * Handles: "for X", "to X", "in X", "under X", "add it to X", "on the X project"
 */
function extractProject(text: string): { projectName?: string; cleanedText: string } {
  const prepositions = 'for|to|in|under|on'
  const patterns = [
    // "for/to/in/under the X project"
    new RegExp(`\\s+(?:add\\s+(?:it\\s+)?)?(?:${prepositions})\\s+(?:the\\s+)?(.+?)\\s+project\\b`, 'i'),
    // "for/to/in/under X" followed by comma or priority/due keywords
    new RegExp(`\\s+(?:add\\s+(?:it\\s+)?)?(?:${prepositions})\\s+(?:the\\s+)?(.+?)(?:\\s*,|\\s+(?:high|low|medium|urgent|critical|due)\\b)`, 'i'),
    // "for/to/in/under X" at end of string
    new RegExp(`\\s+(?:add\\s+(?:it\\s+)?)?(?:${prepositions})\\s+(?:the\\s+)?(.+)$`, 'i'),
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match && match[1].trim().length > 0 && match[1].trim().length < 60) {
      return {
        projectName: match[1].trim(),
        cleanedText: text.replace(match[0], '').trim(),
      }
    }
  }

  return { cleanedText: text }
}

async function authenticateToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return { error: 'Missing or invalid Authorization header', status: 401 }
  }

  const token = authHeader.slice(7)
  if (!token) {
    return { error: 'Missing API token', status: 401 }
  }

  // Hash the incoming token and look up by hash (new tokens are stored hashed)
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
  let subscription = await prisma.subscription.findFirst({
    where: { apiToken: tokenHash },
  })

  // Fallback: try plain-text lookup for legacy tokens and auto-migrate
  if (!subscription) {
    subscription = await prisma.subscription.findFirst({
      where: { apiToken: token },
    })
    if (subscription) {
      // Auto-migrate: hash the legacy token in place
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { apiToken: tokenHash },
      })
    }
  }

  if (!subscription) {
    return { error: 'Invalid API token', status: 401 }
  }

  if (subscription.plan !== 'pro' && subscription.plan !== 'team' && !isAdminUser(subscription.userId)) {
    return { error: 'Pro plan required', status: 403 }
  }

  return { subscription }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateToken(request)
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }
    const { subscription } = auth

    const body = await request.json()
    let { title, project, priority, dueDate, description } = body
    const { text } = body

    // Natural language mode: parse "Buy groceries for Smith project, high priority, due tomorrow"
    if (text && typeof text === 'string' && text.trim()) {
      const { projectName, cleanedText } = extractProject(text)
      const parsed = parseTaskFromVoice(cleanedText)

      title = title || parsed.title
      priority = priority || parsed.priority
      dueDate = dueDate || parsed.dueDate
      description = description || parsed.description
      project = project || projectName
    }

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: 'Title is required. Send {"title": "..."} or {"text": "..."}' }, { status: 400 })
    }

    // Match project by name (case-insensitive, optional)
    let projectId: string | undefined
    let projectName: string | undefined
    if (project && typeof project === 'string') {
      const found = await prisma.project.findFirst({
        where: {
          userId: subscription.userId,
          name: { equals: project, mode: 'insensitive' },
        },
        select: { id: true, name: true },
      })
      if (found) {
        projectId = found.id
        projectName = found.name
      }
    }

    // Validate priority
    const validPriorities = ['low', 'medium', 'high']
    const taskPriority = validPriorities.includes(priority) ? priority : 'medium'

    // Parse due date
    let parsedDueDate: Date | null = null
    if (dueDate) {
      const d = new Date(dueDate)
      if (!isNaN(d.getTime())) {
        parsedDueDate = d
      }
    }

    const task = await prisma.task.create({
      data: {
        userId: subscription.userId,
        title: title.trim(),
        description: description?.trim() || null,
        priority: taskPriority,
        dueDate: parsedDueDate,
        projectId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        priority: true,
        dueDate: true,
        projectId: true,
        createdAt: true,
      },
    })

    // Build human-readable confirmation
    const parts = [task.title]
    if (projectName) parts.push(`in ${projectName}`)
    if (taskPriority !== 'medium') parts.push(`(${taskPriority} priority)`)
    if (parsedDueDate) parts.push(`due ${parsedDueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`)
    const message = parts.join(' ')

    return NextResponse.json({ task, message }, { status: 201 })
  } catch (error) {
    console.error('API v1/tasks error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateToken(request)
    if ('error' in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }
    const { subscription } = auth

    const url = new URL(request.url)
    const status = url.searchParams.get('status') // todo, in_progress, done
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100)

    const where: Record<string, unknown> = { userId: subscription.userId }
    if (status) where.status = status

    const tasks = await prisma.task.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        priority: true,
        status: true,
        dueDate: true,
        projectId: true,
        project: { select: { name: true } },
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return NextResponse.json({ tasks })
  } catch (error) {
    console.error('API v1/tasks GET error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
