import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest, apiError, handleCors } from '@/lib/api-auth'

export async function OPTIONS() { return handleCors() }

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authenticateRequest(request)
    if ('error' in auth) return apiError(auth.error, auth.status)
    const { userId } = auth
    const { id: taskId } = await params

    // Verify task access (owned or shared project)
    let task = await prisma.task.findFirst({
      where: { id: taskId, userId },
      select: { projectId: true },
    })

    if (!task) {
      // Check shared project access
      const sharedAccess = await prisma.projectAccess.findMany({
        where: { userId },
        select: { projectId: true },
      })
      const sharedIds = sharedAccess.map(r => r.projectId)

      if (sharedIds.length > 0) {
        task = await prisma.task.findFirst({
          where: { id: taskId, projectId: { in: sharedIds } },
          select: { projectId: true },
        })
      }
    }

    if (!task) return apiError('Task not found', 404)

    const comments = await prisma.taskComment.findMany({
      where: { taskId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ comments })
  } catch (error) {
    console.error('API v1/tasks/[id]/comments GET error:', error)
    return apiError('Internal error', 500)
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authenticateRequest(request)
    if ('error' in auth) return apiError(auth.error, auth.status)
    const { userId } = auth
    const { id: taskId } = await params

    const body = await request.json()
    const content = body.content?.trim()

    if (!content) return apiError('Comment content is required', 400)
    if (content.length > 5000) return apiError('Comment must be under 5000 characters', 400)

    // Verify task access with edit permission
    let task = await prisma.task.findFirst({
      where: { id: taskId, userId },
      select: { projectId: true },
    })

    if (!task) {
      // Check shared project access (need editor+ to comment)
      const taskRecord = await prisma.task.findFirst({
        where: { id: taskId },
        select: { projectId: true },
      })
      if (taskRecord?.projectId) {
        const access = await prisma.projectAccess.findUnique({
          where: { projectId_userId: { projectId: taskRecord.projectId, userId } },
          select: { role: true },
        })
        if (access && ['editor', 'manager'].includes(access.role)) {
          task = taskRecord
        }
      }
    }

    if (!task) return apiError('Task not found or insufficient permissions', 404)

    const comment = await prisma.taskComment.create({
      data: { content, taskId, userId },
    })

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error('API v1/tasks/[id]/comments POST error:', error)
    return apiError('Internal error', 500)
  }
}
