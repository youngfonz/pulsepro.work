import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest, apiError, handleCors } from '@/lib/api-auth'
import { checkLimitForUser } from '@/lib/subscription'
import {
  VALID_PROJECT_STATUSES,
  VALID_PRIORITIES,
  MAX_NAME_LENGTH,
  MAX_TEXT_LENGTH,
} from '@/actions/projects-validation'

export async function OPTIONS() { return handleCors() }

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if ('error' in auth) return apiError(auth.error, auth.status)
    const { userId } = auth

    const url = new URL(request.url)
    const search = url.searchParams.get('search')
    const status = url.searchParams.get('status')
    const priority = url.searchParams.get('priority')
    const clientId = url.searchParams.get('clientId')
    const sort = url.searchParams.get('sort')

    // Build ownership filter (owned + shared)
    const sharedAccess = await prisma.projectAccess.findMany({
      where: { userId },
      select: { projectId: true },
    })
    const sharedIds = sharedAccess.map(r => r.projectId)

    const ownerFilter = sharedIds.length > 0
      ? { OR: [{ userId }, { id: { in: sharedIds } }] }
      : { userId }

    const conditions: Record<string, unknown>[] = [ownerFilter]
    const where: Record<string, unknown> = {}

    if (search) {
      conditions.push({
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      })
    }

    if (status && status !== 'all') {
      conditions.push({ status })
    }

    if (priority && priority !== 'all') {
      where.priority = priority
    }

    if (clientId && clientId !== 'all') {
      where.clientId = clientId
    }

    where.AND = conditions

    type OrderBy = Record<string, 'asc' | 'desc' | Record<string, 'asc' | 'desc'>>
    let orderBy: OrderBy | OrderBy[] = { createdAt: 'desc' as const }

    switch (sort) {
      case 'oldest': orderBy = { createdAt: 'asc' }; break
      case 'name': orderBy = { name: 'asc' }; break
      case 'client': orderBy = { client: { name: 'asc' } }; break
      case 'due_date': orderBy = [{ dueDate: 'asc' }, { createdAt: 'desc' }]; break
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        client: { select: { id: true, name: true } },
        tasks: { select: { id: true, status: true, url: true } },
        _count: { select: { tasks: true } },
      },
      orderBy,
    })

    return NextResponse.json({ projects })
  } catch (error) {
    console.error('API v1/projects GET error:', error)
    return apiError('Internal error', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if ('error' in auth) return apiError(auth.error, auth.status)
    const { userId } = auth

    const body = await request.json()

    // Validate client ownership
    if (!body.clientId) return apiError('clientId is required', 400)
    const client = await prisma.client.findFirst({ where: { id: body.clientId, userId } })
    if (!client) return apiError('Client not found', 404)

    const limit = await checkLimitForUser(userId, 'projects')
    if (!limit.allowed) {
      return apiError(`Free plan limit: ${limit.limit} projects. Upgrade to Pro for unlimited.`, 403)
    }

    const name = (body.name || '').slice(0, MAX_NAME_LENGTH)
    if (!name.trim()) return apiError('Name is required', 400)

    const status = body.status || 'not_started'
    if (!VALID_PROJECT_STATUSES.includes(status)) return apiError('Invalid status', 400)

    const priority = body.priority || 'medium'
    if (!VALID_PRIORITIES.includes(priority)) return apiError('Invalid priority', 400)

    const project = await prisma.project.create({
      data: {
        userId,
        name,
        description: body.description?.slice(0, MAX_TEXT_LENGTH) || null,
        notes: body.notes?.slice(0, MAX_TEXT_LENGTH) || null,
        status,
        priority,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        budget: body.budget ? parseFloat(body.budget) : null,
        hourlyRate: body.hourlyRate ? parseFloat(body.hourlyRate) : null,
        clientId: body.clientId,
      },
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error('API v1/projects POST error:', error)
    return apiError('Internal error', 500)
  }
}
