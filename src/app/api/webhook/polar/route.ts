import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function getPlanFromProductId(productId?: string): 'pro' | 'team' {
  const teamProductId = process.env.POLAR_TEAM_PRODUCT_ID
  if (teamProductId && productId === teamProductId) return 'team'
  return 'pro'
}

export async function POST(req: NextRequest) {
  if (!process.env.POLAR_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Webhooks not configured' }, { status: 503 })
  }

  const { Webhooks } = await import('@polar-sh/nextjs')

  const handler = Webhooks({
    webhookSecret: process.env.POLAR_WEBHOOK_SECRET,

    onSubscriptionActive: async (payload) => {
      const { customerId, id: subscriptionId } = payload.data
      const userId = payload.data.metadata?.userId as string | undefined

      if (!userId) {
        console.error('Polar webhook: missing userId in subscription metadata')
        return
      }

      const plan = getPlanFromProductId(payload.data.productId)

      await prisma.subscription.upsert({
        where: { userId },
        create: {
          userId,
          polarCustomerId: customerId,
          polarSubscriptionId: subscriptionId,
          plan,
          status: 'active',
          currentPeriodEnd: payload.data.currentPeriodEnd
            ? new Date(payload.data.currentPeriodEnd)
            : null,
        },
        update: {
          polarCustomerId: customerId,
          polarSubscriptionId: subscriptionId,
          plan,
          status: 'active',
          currentPeriodEnd: payload.data.currentPeriodEnd
            ? new Date(payload.data.currentPeriodEnd)
            : null,
          cancelAtPeriodEnd: false,
        },
      })
    },

    onSubscriptionCanceled: async (payload) => {
      const userId = payload.data.metadata?.userId as string | undefined
      if (!userId) return

      await prisma.subscription.updateMany({
        where: { userId },
        data: {
          cancelAtPeriodEnd: true,
        },
      })
    },

    onSubscriptionRevoked: async (payload) => {
      const userId = payload.data.metadata?.userId as string | undefined
      if (!userId) return

      await prisma.subscription.updateMany({
        where: { userId },
        data: {
          plan: 'free',
          status: 'canceled',
          cancelAtPeriodEnd: false,
        },
      })
    },

    onSubscriptionUpdated: async (payload) => {
      const userId = payload.data.metadata?.userId as string | undefined
      if (!userId) return

      const plan = getPlanFromProductId(payload.data.productId)

      await prisma.subscription.upsert({
        where: { userId },
        create: {
          userId,
          polarCustomerId: payload.data.customerId,
          polarSubscriptionId: payload.data.id,
          plan,
          status: payload.data.status,
          currentPeriodEnd: payload.data.currentPeriodEnd
            ? new Date(payload.data.currentPeriodEnd)
            : null,
        },
        update: {
          plan,
          status: payload.data.status,
          currentPeriodEnd: payload.data.currentPeriodEnd
            ? new Date(payload.data.currentPeriodEnd)
            : null,
        },
      })
    },
  })

  return handler(req)
}
