import { prisma } from '@/lib/prisma'
import { requireUserId, isAdminUser } from '@/lib/auth'

export type Plan = 'free' | 'pro' | 'team'

export const PLAN_LIMITS = {
  free: {
    maxProjects: 3,
    maxTasks: 50,
    maxClients: 1,
    maxCollaborators: 0,
  },
  pro: {
    maxProjects: Infinity,
    maxTasks: Infinity,
    maxClients: Infinity,
    maxCollaborators: 3,
  },
  team: {
    maxProjects: Infinity,
    maxTasks: Infinity,
    maxClients: Infinity,
    maxCollaborators: 10,
  },
} as const

export type LimitResource = 'projects' | 'tasks' | 'clients'

export interface SubscriptionInfo {
  plan: Plan
  status: string
  currentPeriodEnd: Date | null
  cancelAtPeriodEnd: boolean
  hasPortal: boolean
  suspendedAt: Date | null
}

export interface LimitCheck {
  allowed: boolean
  current: number
  limit: number
  plan: Plan
}

/**
 * Resolve the current subscription for a userId.
 * Auto-creates a `team` Subscription row for admin users (highest tier, full access).
 * Pure of Clerk session — safe to call from any auth context (Server Actions, API routes).
 */
export async function getSubscriptionForUser(userId: string): Promise<SubscriptionInfo> {
  const admin = isAdminUser(userId)

  let subscription = await prisma.subscription.findUnique({
    where: { userId },
  })

  if (admin) {
    if (!subscription) {
      subscription = await prisma.subscription.create({
        data: { userId, plan: 'team' },
      })
    } else if (subscription.plan !== 'team') {
      subscription = await prisma.subscription.update({
        where: { userId },
        data: { plan: 'team' },
      })
    }
  }

  if (!subscription) {
    return {
      plan: 'free',
      status: 'active',
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      hasPortal: false,
      suspendedAt: null,
    }
  }

  return {
    plan: subscription.plan as Plan,
    status: subscription.status,
    currentPeriodEnd: subscription.currentPeriodEnd,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    hasPortal: !!subscription.polarCustomerId,
    suspendedAt: subscription.suspendedAt,
  }
}

export async function getPlanForUser(userId: string): Promise<Plan> {
  const sub = await getSubscriptionForUser(userId)
  return sub.plan
}

export async function checkLimitForUser(
  userId: string,
  resource: LimitResource,
): Promise<LimitCheck> {
  const plan = await getPlanForUser(userId)
  const limits = PLAN_LIMITS[plan]

  let current: number

  switch (resource) {
    case 'projects':
      current = await prisma.project.count({ where: { userId } })
      return { allowed: current < limits.maxProjects, current, limit: limits.maxProjects, plan }
    case 'tasks':
      current = await prisma.task.count({ where: { userId, url: null } })
      return { allowed: current < limits.maxTasks, current, limit: limits.maxTasks, plan }
    case 'clients':
      current = await prisma.client.count({ where: { userId } })
      return { allowed: current < limits.maxClients, current, limit: limits.maxClients, plan }
  }
}

export async function checkCollaboratorLimitForUser(
  userId: string,
  projectId: string,
): Promise<LimitCheck> {
  const plan = await getPlanForUser(userId)
  const limits = PLAN_LIMITS[plan]
  const current = await prisma.projectAccess.count({ where: { projectId } })
  return {
    allowed: current < limits.maxCollaborators,
    current,
    limit: limits.maxCollaborators,
    plan,
  }
}

// ─── Clerk-session-aware wrappers ────────────────────────────────────
// Server Actions call these; they read userId from the Clerk session
// then delegate to the *ForUser primitives above.

export async function getUserSubscription(): Promise<SubscriptionInfo> {
  const userId = await requireUserId()
  return getSubscriptionForUser(userId)
}

export async function getUserPlan(): Promise<Plan> {
  const userId = await requireUserId()
  return getPlanForUser(userId)
}

export async function checkLimit(resource: LimitResource): Promise<LimitCheck> {
  const userId = await requireUserId()
  return checkLimitForUser(userId, resource)
}

export async function checkCollaboratorLimit(projectId: string): Promise<LimitCheck> {
  const userId = await requireUserId()
  return checkCollaboratorLimitForUser(userId, projectId)
}

export async function canUseTelegram(): Promise<boolean> {
  const plan = await getUserPlan()
  return plan === 'pro' || plan === 'team'
}

export async function canUseAIInsights(): Promise<boolean> {
  const plan = await getUserPlan()
  return plan === 'pro' || plan === 'team'
}
