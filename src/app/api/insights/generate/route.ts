import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUserId } from '@/lib/auth'
import { generateAIInsights, hashInsightContext, type InsightContext } from '@/lib/ai-insights'

const CACHE_TTL_HOURS = 4
const COOLDOWN_MS = 5 * 60 * 1000 // 5 minutes between LLM calls per user
const MAX_DAILY_CALLS = 20 // Hard cap: max LLM calls per user per day

function logLLM(userId: string, reason: string, extra?: Record<string, unknown>) {
  console.info(JSON.stringify({
    type: 'llm_call',
    userId,
    reason,
    timestamp: new Date().toISOString(),
    ...extra,
  }))
}

function logLLMSkip(userId: string, reason: string) {
  console.info(JSON.stringify({
    type: 'llm_skip',
    userId,
    reason,
    timestamp: new Date().toISOString(),
  }))
}

async function gatherInsightContext(userId: string): Promise<InsightContext> {
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  const [stats, projectHealth, overdueTasks, tasksDueToday, tasksDueThisWeek] = await Promise.all([
    // Stats
    (async () => {
      const [totalProjects, activeProjects, totalTasks, pendingTasks] = await Promise.all([
        prisma.project.count({ where: { userId } }),
        prisma.project.count({ where: { userId, status: { in: ['in_progress', 'not_started'] } } }),
        prisma.task.count({ where: { userId, url: null } }),
        prisma.task.count({ where: { userId, url: null, status: { not: 'done' } } }),
      ])
      return { totalProjects, activeProjects, totalTasks, pendingTasks }
    })(),

    // Project health summary
    prisma.project.findMany({
      where: { userId, status: { notIn: ['completed'] } },
      include: {
        client: { select: { name: true } },
        tasks: { select: { status: true, dueDate: true } },
      },
      take: 10,
    }).then(projects => projects.map(p => {
      const total = p.tasks.length
      const completed = p.tasks.filter(t => t.status === 'done').length
      const overdue = p.tasks.filter(t => t.status !== 'done' && t.dueDate && new Date(t.dueDate) < now).length
      const score = total === 0 ? 80 : Math.max(0, Math.min(100, 100 - Math.round((overdue / total) * 40) + Math.round((completed / total) * 10)))
      const label = score >= 70 ? 'healthy' : score >= 40 ? 'at_risk' : 'critical'
      return {
        projectName: p.name,
        clientName: p.client.name,
        label,
        score,
        overdueTasks: overdue,
        totalTasks: total,
        completedTasks: completed,
        href: `/projects/${p.id}`,
      }
    })),

    // Overdue tasks
    prisma.task.findMany({
      where: { userId, status: { not: 'done' }, url: null, dueDate: { lt: now } },
      include: { project: { select: { name: true, id: true } } },
      orderBy: { dueDate: 'asc' },
      take: 10,
    }).then(tasks => tasks.map(t => ({
      title: t.title,
      projectName: t.project?.name ?? 'Quick task',
      dueDate: t.dueDate!.toISOString().split('T')[0],
      priority: t.priority,
    }))),

    // Tasks due today
    prisma.task.findMany({
      where: {
        userId,
        status: { not: 'done' },
        url: null,
        dueDate: { gte: now, lt: new Date(now.getTime() + 86400000) },
      },
      include: { project: { select: { name: true } } },
      take: 10,
    }).then(tasks => tasks.map(t => ({
      title: t.title,
      projectName: t.project?.name ?? 'Quick task',
      priority: t.priority,
    }))),

    // Tasks due this week count
    prisma.task.count({
      where: {
        userId,
        status: { not: 'done' },
        url: null,
        dueDate: { gte: now, lt: new Date(now.getTime() + 7 * 86400000) },
      },
    }),
  ])

  return { stats, projectHealth, overdueTasks, tasksDueToday, tasksDueThisWeek }
}

export async function POST() {
  try {
    const userId = await requireUserId()
    const today = new Date().toISOString().split('T')[0]

    // Fetch cached record
    const cached = await prisma.cachedInsight.findUnique({ where: { userId } })

    // Rate limit: cooldown check (5 minutes between calls)
    if (cached && cached.createdAt.getTime() > Date.now() - COOLDOWN_MS) {
      logLLMSkip(userId, 'cooldown_active')
      return NextResponse.json({ insights: JSON.parse(cached.insights) })
    }

    // Daily cap check
    const dailyCalls = cached?.dailyCallsDate === today ? (cached.dailyCalls ?? 0) : 0
    if (dailyCalls >= MAX_DAILY_CALLS) {
      logLLMSkip(userId, 'daily_cap_reached')
      // Return cached if available, otherwise error
      if (cached) {
        return NextResponse.json({ insights: JSON.parse(cached.insights) })
      }
      return NextResponse.json({ error: 'Daily AI insight limit reached. Try again tomorrow.' }, { status: 429 })
    }

    // Gather context and check if cache is still valid
    const ctx = await gatherInsightContext(userId)
    const contextHash = hashInsightContext(ctx)

    if (cached && cached.context === contextHash && cached.expiresAt > new Date()) {
      logLLMSkip(userId, 'cache_valid')
      return NextResponse.json({ insights: JSON.parse(cached.insights) })
    }

    // Actually call the LLM
    logLLM(userId, 'generate_insights', { dailyCallNumber: dailyCalls + 1 })
    const insights = await generateAIInsights(ctx)

    const expiresAt = new Date(Date.now() + CACHE_TTL_HOURS * 60 * 60 * 1000)
    const newDailyCalls = dailyCalls + 1

    await prisma.cachedInsight.upsert({
      where: { userId },
      create: {
        userId,
        insights: JSON.stringify(insights),
        context: contextHash,
        expiresAt,
        dailyCalls: newDailyCalls,
        dailyCallsDate: today,
      },
      update: {
        insights: JSON.stringify(insights),
        context: contextHash,
        expiresAt,
        createdAt: new Date(),
        dailyCalls: newDailyCalls,
        dailyCallsDate: today,
      },
    })

    return NextResponse.json({ insights })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(JSON.stringify({
      type: 'llm_error',
      error: message,
      timestamp: new Date().toISOString(),
    }))
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
