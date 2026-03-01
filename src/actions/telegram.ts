'use server'

import { prisma } from '@/lib/prisma'
import { requireUserId, isAdminUser } from '@/lib/auth'
import crypto from 'crypto'

export async function generateTelegramLink() {
  const userId = await requireUserId()

  // Check Pro plan
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  })

  if (!subscription || (subscription.plan !== 'pro' && subscription.plan !== 'team' && !isAdminUser(userId))) {
    return { error: 'Telegram integration is a Pro feature.' }
  }

  // Generate a short, human-readable code (e.g. LINK-A3X7F2B1)
  const hex = crypto.randomBytes(4).toString('hex').toUpperCase()
  const code = `LINK-${hex}`
  const expires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

  await prisma.subscription.update({
    where: { userId },
    data: {
      telegramVerifyCode: code,
      telegramVerifyExpires: expires,
    },
  })

  const botUsername = process.env.TELEGRAM_BOT_USERNAME || ''

  return { code, botUsername }
}

export async function unlinkTelegram() {
  const userId = await requireUserId()

  const subscription = await prisma.subscription.findUnique({ where: { userId } })
  if (!subscription) return { error: 'No subscription found.' }

  await prisma.subscription.update({
    where: { userId },
    data: {
      telegramChatId: null,
      telegramVerifyCode: null,
      telegramVerifyExpires: null,
      telegramRemindersEnabled: false,
    },
  })

  return { success: true }
}

export async function toggleTelegramReminders(enabled: boolean) {
  const userId = await requireUserId()

  const subscription = await prisma.subscription.findUnique({ where: { userId } })
  if (!subscription) return { error: 'No subscription found.' }

  await prisma.subscription.update({
    where: { userId },
    data: { telegramRemindersEnabled: enabled },
  })

  return { success: true }
}

export async function getTelegramSettings() {
  const userId = await requireUserId()
  const admin = isAdminUser(userId)

  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  })

  if (!subscription) {
    return {
      plan: (admin ? 'pro' : 'free') as 'pro' | 'free' | 'team',
      linked: false,
      remindersEnabled: false,
    }
  }

  return {
    plan: (admin && subscription.plan === 'free' ? 'pro' : subscription.plan) as 'free' | 'pro' | 'team',
    linked: !!subscription.telegramChatId,
    remindersEnabled: subscription.telegramRemindersEnabled,
  }
}
