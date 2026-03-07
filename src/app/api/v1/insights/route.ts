import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest, apiError, handleCors } from '@/lib/api-auth'

export async function OPTIONS() { return handleCors() }

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if ('error' in auth) return apiError(auth.error, auth.status)
    const { userId } = auth

    // Check cache for AI insights
    const cached = await prisma.cachedInsight.findUnique({ where: { userId } })

    if (cached && cached.expiresAt > new Date()) {
      return NextResponse.json({
        insights: JSON.parse(cached.insights),
      })
    }

    // No cache or expired — return rule-based insights
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const twoDaysFromNow = new Date(now.getTime() + 2 * 86400000)

    const [highPriorityDueSoon, staleProjects] = await Promise.all([
      prisma.task.findMany({
        where: {
          userId,
          status: { not: 'done' },
          url: null,
          priority: 'high',
          dueDate: { gte: now, lt: twoDaysFromNow },
        },
        select: { id: true, title: true },
      }),
      prisma.project.findMany({
        where: {
          userId,
          status: { notIn: ['completed'] },
          updatedAt: { lt: new Date(now.getTime() - 10 * 86400000) },
        },
        select: { id: true, name: true, updatedAt: true },
        take: 3,
      }),
    ])

    const insights: Array<{ id: string; color: string; message: string }> = []

    if (highPriorityDueSoon.length > 0) {
      insights.push({
        id: 'high-priority-soon',
        color: 'blue',
        message: `${highPriorityDueSoon.length} high-priority task${highPriorityDueSoon.length > 1 ? 's' : ''} due in the next 2 days — start here`,
      })
    }

    if (staleProjects.length > 0) {
      const stalest = staleProjects[0]
      const daysStale = Math.floor(
        (now.getTime() - new Date(stalest.updatedAt).getTime()) / 86400000
      )
      insights.push({
        id: 'stale-project',
        color: 'amber',
        message: `${stalest.name} hasn't been updated in ${daysStale} days`,
      })
    }

    return NextResponse.json({ insights: insights.slice(0, 3) })
  } catch (error) {
    console.error('API v1/insights error:', error)
    return apiError('Internal error', 500)
  }
}
