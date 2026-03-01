import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdminUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret if configured
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET
    if (webhookSecret) {
      const signature = request.headers.get('x-resend-signature') || request.headers.get('webhook-secret')
      if (signature !== webhookSecret) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    const body = await request.json()

    // Resend inbound parse sends: from, to, subject, text, html
    const { to, from, subject, text, html } = body

    if (!to || !subject) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Extract token from the "to" address
    // Format: {token}@in.pulsepro.work or tasks+{token}@in.pulsepro.work
    const toAddress = Array.isArray(to) ? to[0] : to
    const token = extractToken(toAddress)

    if (!token) {
      return NextResponse.json({ error: 'Invalid inbound address' }, { status: 400 })
    }

    // Look up user by email token
    const subscription = await prisma.subscription.findFirst({
      where: { inboundEmailToken: token },
    })

    if (!subscription) {
      return NextResponse.json({ error: 'Unknown token' }, { status: 404 })
    }

    if (subscription.plan !== 'pro' && subscription.plan !== 'team' && !isAdminUser(subscription.userId)) {
      return NextResponse.json({ error: 'Pro plan required' }, { status: 403 })
    }

    // Parse the email into a task
    const title = cleanSubject(subject)
    const description = buildDescription(text || html)

    // Check for [ProjectName] pattern in subject
    let projectId: string | undefined
    const projectMatch = subject.match(/\[([^\]]+)\]/)
    if (projectMatch) {
      const projectName = projectMatch[1]
      // Search projects owned by user OR shared with user
      const project = await prisma.project.findFirst({
        where: {
          name: { equals: projectName, mode: 'insensitive' },
          OR: [
            { userId: subscription.userId },
            { access: { some: { userId: subscription.userId } } },
          ],
        },
        select: { id: true },
      })
      if (project) {
        projectId = project.id
      }
    }

    // Create the task
    await prisma.task.create({
      data: {
        userId: subscription.userId,
        title,
        description,
        priority: 'medium',
        projectId: projectId ?? null,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Email webhook error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

function extractToken(toAddress: string): string | null {
  // Handle: {token}@in.pulsepro.work
  const directMatch = toAddress.match(/^([a-f0-9]{32})@/i)
  if (directMatch) return directMatch[1]

  // Handle: tasks+{token}@in.pulsepro.work
  const plusMatch = toAddress.match(/\+([a-f0-9]{32})@/i)
  if (plusMatch) return plusMatch[1]

  // Handle just the token (no domain)
  const tokenOnly = toAddress.match(/^([a-f0-9]{32})$/i)
  if (tokenOnly) return tokenOnly[1]

  return null
}

function cleanSubject(subject: string): string {
  return subject
    .replace(/^(Re|Fwd|Fw):\s*/gi, '') // Strip Re:/Fwd: prefixes
    .replace(/\[[^\]]+\]\s*/, '') // Strip [ProjectName] tags
    .trim() || 'Untitled task'
}

function buildDescription(body: string | null): string | null {
  if (!body) return null

  // Strip HTML tags if present
  const text = body.replace(/<[^>]*>/g, '').trim()

  // Truncate long emails
  const truncated = text.length > 2000 ? text.slice(0, 2000) + '...' : text

  return truncated || null
}
