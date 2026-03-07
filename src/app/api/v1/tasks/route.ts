import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseTaskFromVoice } from '@/lib/voice'
import { authenticateRequest, apiError, handleCors } from '@/lib/api-auth'

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

export async function OPTIONS() { return handleCors() }

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if ('error' in auth) return apiError(auth.error, auth.status)
    const { userId } = auth

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
          userId,
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
        userId,
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

    // Reopen completed projects when a new task is added
    if (projectId) {
      await prisma.project.updateMany({
        where: { id: projectId, status: 'completed' },
        data: { status: 'in_progress' },
      })
    }

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
    const auth = await authenticateRequest(request)
    if ('error' in auth) return apiError(auth.error, auth.status)
    const { userId } = auth

    const url = new URL(request.url)
    const status = url.searchParams.get('status') // todo, in_progress, done
    const priority = url.searchParams.get('priority')
    const projectId = url.searchParams.get('projectId')
    const sort = url.searchParams.get('sort')
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 200)

    // Build ownership filter (owned + shared)
    const sharedAccess = await prisma.projectAccess.findMany({
      where: { userId },
      select: { projectId: true },
    })
    const sharedIds = sharedAccess.map(r => r.projectId)
    const ownerFilter = sharedIds.length > 0
      ? { OR: [{ userId }, { projectId: { in: sharedIds } }] }
      : { userId }

    const where: Record<string, unknown> = { url: null, AND: [ownerFilter] }
    if (status) where.status = status === 'pending' ? { not: 'done' } : status === 'completed' ? 'done' : status
    if (priority && priority !== 'all') where.priority = priority
    if (projectId === 'none') where.projectId = null
    else if (projectId && projectId !== 'all') where.projectId = projectId

    type OrderBy = Record<string, 'asc' | 'desc' | Record<string, 'asc' | 'desc'>>
    let orderBy: OrderBy | OrderBy[] = [{ status: 'desc' }, { dueDate: 'asc' }, { priority: 'desc' }]
    switch (sort) {
      case 'newest': orderBy = [{ status: 'desc' }, { createdAt: 'desc' }]; break
      case 'oldest': orderBy = [{ status: 'desc' }, { createdAt: 'asc' }]; break
      case 'due_date': orderBy = [{ status: 'desc' }, { dueDate: 'asc' }]; break
      case 'priority_high': orderBy = [{ status: 'desc' }, { priority: 'desc' }]; break
      case 'priority_low': orderBy = [{ status: 'desc' }, { priority: 'asc' }]; break
      case 'name': orderBy = [{ status: 'desc' }, { title: 'asc' }]; break
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            client: { select: { id: true, name: true } },
          },
        },
      },
      orderBy,
      take: limit,
    })

    return NextResponse.json({ tasks })
  } catch (error) {
    console.error('API v1/tasks GET error:', error)
    return apiError('Internal error', 500)
  }
}
