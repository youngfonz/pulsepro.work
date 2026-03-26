'use server'

import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { requireUserId } from '@/lib/auth'
import { requireAdmin } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

function generateCode(): string {
  // Format: PP-XXXX-XXXX (readable, easy to share)
  const bytes = crypto.randomBytes(4)
  const hex = bytes.toString('hex').toUpperCase()
  return `PP-${hex.slice(0, 4)}-${hex.slice(4, 8)}`
}

// ── Admin actions ──

export async function createPromoCode(plan: string, maxUses: number, expiresInDays?: number) {
  await requireAdmin()

  if (!['pro', 'team'].includes(plan)) {
    throw new Error('Plan must be "pro" or "team"')
  }
  if (maxUses < 1 || maxUses > 1000) {
    throw new Error('Max uses must be between 1 and 1000')
  }

  const code = generateCode()
  const expiresAt = expiresInDays
    ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
    : null

  const promo = await prisma.promoCode.create({
    data: { code, plan, maxUses, expiresAt },
  })

  revalidatePath('/admin')
  return { code: promo.code, plan: promo.plan, maxUses: promo.maxUses, expiresAt: promo.expiresAt }
}

export async function getPromoCodes() {
  await requireAdmin()

  return prisma.promoCode.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { redemptions: true } } },
  })
}

export async function deactivatePromoCode(id: string) {
  await requireAdmin()

  await prisma.promoCode.update({
    where: { id },
    data: { active: false },
  })

  revalidatePath('/admin')
}

// ── User action ──

export async function redeemPromoCode(code: string) {
  const userId = await requireUserId()
  const trimmed = code.trim().toUpperCase()

  if (!trimmed) {
    return { success: false, error: 'Please enter a promo code.' }
  }

  const promo = await prisma.promoCode.findUnique({ where: { code: trimmed } })

  if (!promo || !promo.active) {
    return { success: false, error: 'Invalid or expired promo code.' }
  }

  if (promo.expiresAt && promo.expiresAt < new Date()) {
    return { success: false, error: 'This promo code has expired.' }
  }

  if (promo.usedCount >= promo.maxUses) {
    return { success: false, error: 'This promo code has reached its usage limit.' }
  }

  // All checks + writes in an interactive transaction to prevent TOCTOU races
  const result = await prisma.$transaction(async (tx) => {
    // Re-check inside transaction for atomicity
    const existing = await tx.promoRedemption.findUnique({
      where: { promoCodeId_userId: { promoCodeId: promo.id, userId } },
    })
    if (existing) {
      return { success: false as const, error: 'You have already redeemed this code.' }
    }

    // Conditional update: only increment if usedCount is still under maxUses
    const updated = await tx.promoCode.updateMany({
      where: { id: promo.id, usedCount: { lt: promo.maxUses }, active: true },
      data: { usedCount: { increment: 1 } },
    })
    if (updated.count === 0) {
      return { success: false as const, error: 'This promo code has reached its usage limit.' }
    }

    await tx.subscription.upsert({
      where: { userId },
      create: { userId, plan: promo.plan, status: 'active' },
      update: { plan: promo.plan, status: 'active' },
    })
    await tx.promoRedemption.create({
      data: { promoCodeId: promo.id, userId },
    })

    return { success: true as const, plan: promo.plan }
  })

  if (!result.success) {
    return result
  }

  revalidatePath('/settings')
  revalidatePath('/dashboard')
  return { success: true, plan: result.plan }
}
