'use server'

import { prisma } from '@/lib/prisma'
import { requireUserId, isAdminUser } from '@/lib/auth'

export async function getSlackSettings() {
  const userId = await requireUserId()
  const admin = isAdminUser(userId)

  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    select: { plan: true, slackTeamId: true },
  })

  if (!subscription) {
    return {
      userId,
      plan: (admin ? 'pro' : 'free') as 'pro' | 'free' | 'team',
      linked: false,
    }
  }

  return {
    userId,
    plan: (admin && subscription.plan === 'free' ? 'pro' : subscription.plan) as 'free' | 'pro' | 'team',
    linked: !!subscription.slackTeamId,
  }
}

export async function unlinkSlack() {
  const userId = await requireUserId()

  const subscription = await prisma.subscription.findUnique({ where: { userId } })
  if (!subscription) return { error: 'No subscription found.' }

  await prisma.subscription.update({
    where: { userId },
    data: {
      slackTeamId: null,
      slackUserId: null,
      slackBotToken: null,
      slackInstalledAt: null,
    },
  })

  return { success: true }
}
