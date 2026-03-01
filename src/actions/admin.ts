'use server'

import { prisma } from '@/lib/prisma'
import { requireAdmin, requireUserId, isAdminUser } from '@/lib/auth'
import { clerkClient } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'

/** Lightweight check for the Sidebar to self-correct after client-side nav */
export async function checkIsAdmin(): Promise<boolean> {
  try {
    const userId = await requireUserId()
    return isAdminUser(userId)
  } catch {
    return false
  }
}

export async function getAdminStats() {
  await requireAdmin()

  const clerk = await clerkClient()

  const [totalUsers, totalProjects, totalTasks, totalClients, proUsers] = await Promise.all([
    clerk.users.getCount(),
    prisma.project.count(),
    prisma.task.count({ where: { url: null } }),
    prisma.client.count(),
    prisma.subscription.count({ where: { plan: 'pro' } }),
  ])

  return { totalUsers, totalProjects, totalTasks, totalClients, proUsers }
}

export async function getAdminUsers(page = 1, limit = 50) {
  await requireAdmin()

  const clerk = await clerkClient()

  const users = await clerk.users.getUserList({
    limit,
    offset: (page - 1) * limit,
    orderBy: '-created_at',
  })

  const userIds = users.data.map(u => u.id)

  const [subscriptions, projectCounts, taskCounts, clientCounts] = await Promise.all([
    prisma.subscription.findMany({
      where: { userId: { in: userIds } },
    }),
    prisma.project.groupBy({
      by: ['userId'],
      where: { userId: { in: userIds } },
      _count: true,
    }),
    prisma.task.groupBy({
      by: ['userId'],
      where: { userId: { in: userIds }, url: null },
      _count: true,
    }),
    prisma.client.groupBy({
      by: ['userId'],
      where: { userId: { in: userIds } },
      _count: true,
    }),
  ])

  const subMap = new Map(subscriptions.map(s => [s.userId, s]))
  const projectMap = new Map(projectCounts.map(p => [p.userId!, p._count]))
  const taskMap = new Map(taskCounts.map(t => [t.userId!, t._count]))
  const clientMap = new Map(clientCounts.map(c => [c.userId!, c._count]))

  return {
    users: users.data.map(user => ({
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress ?? '',
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
      createdAt: user.createdAt,
      plan: (subMap.get(user.id)?.plan as string) ?? 'free',
      status: (subMap.get(user.id)?.status as string) ?? 'active',
      suspendedAt: subMap.get(user.id)?.suspendedAt ?? null,
      projectCount: projectMap.get(user.id) ?? 0,
      taskCount: taskMap.get(user.id) ?? 0,
      clientCount: clientMap.get(user.id) ?? 0,
    })),
    totalCount: users.totalCount,
  }
}

export async function updateUserPlan(userId: string, plan: string) {
  const adminId = await requireAdmin()

  if (userId === adminId) {
    throw new Error('Cannot change your own plan')
  }

  const validPlans = ['free', 'pro', 'team']
  if (!validPlans.includes(plan)) {
    throw new Error('Invalid plan')
  }

  await prisma.subscription.upsert({
    where: { userId },
    create: { userId, plan, status: 'active' },
    update: { plan },
  })

  revalidatePath('/admin/users')
}

export async function suspendUser(userId: string) {
  const adminId = await requireAdmin()

  if (userId === adminId) {
    throw new Error('Cannot suspend yourself')
  }
  if (isAdminUser(userId)) {
    throw new Error('Cannot suspend an admin')
  }

  await prisma.subscription.upsert({
    where: { userId },
    create: { userId, plan: 'free', status: 'active', suspendedAt: new Date() },
    update: { suspendedAt: new Date() },
  })

  revalidatePath('/admin/users')
}

export async function unsuspendUser(userId: string) {
  await requireAdmin()

  await prisma.subscription.upsert({
    where: { userId },
    create: { userId, plan: 'free', status: 'active', suspendedAt: null },
    update: { suspendedAt: null },
  })

  revalidatePath('/admin/users')
}

export async function wipeUserData(userId: string) {
  const adminId = await requireAdmin()

  if (userId === adminId) {
    throw new Error('Cannot wipe your own data')
  }
  if (isAdminUser(userId)) {
    throw new Error('Cannot wipe an admin')
  }

  await prisma.$transaction(async (tx) => {
    await tx.projectAccess.deleteMany({ where: { userId } })
    await tx.task.deleteMany({ where: { userId } })
    await tx.invoiceItem.deleteMany({ where: { invoice: { userId } } })
    await tx.invoice.deleteMany({ where: { userId } })
    await tx.cachedInsight.deleteMany({ where: { userId } })
    await tx.client.deleteMany({ where: { userId } })
    await tx.project.deleteMany({ where: { userId } })
  })

  revalidatePath('/admin/users')
}

export async function deleteUser(userId: string) {
  const adminId = await requireAdmin()

  if (userId === adminId) {
    throw new Error('Cannot delete yourself')
  }
  if (isAdminUser(userId)) {
    throw new Error('Cannot delete an admin')
  }

  await prisma.$transaction(async (tx) => {
    await tx.projectAccess.deleteMany({ where: { userId } })
    await tx.task.deleteMany({ where: { userId } })
    await tx.invoiceItem.deleteMany({ where: { invoice: { userId } } })
    await tx.invoice.deleteMany({ where: { userId } })
    await tx.cachedInsight.deleteMany({ where: { userId } })
    await tx.subscription.deleteMany({ where: { userId } })
    await tx.client.deleteMany({ where: { userId } })
    await tx.project.deleteMany({ where: { userId } })
  })

  try {
    const clerk = await clerkClient()
    await clerk.users.deleteUser(userId)
  } catch (err) {
    console.error('Failed to delete Clerk user:', err)
  }

  revalidatePath('/admin/users')
}

export async function getMaintenanceMode() {
  const config = await prisma.systemConfig.findUnique({
    where: { key: 'maintenance_mode' },
  })
  return config?.value === 'true'
}

export async function toggleMaintenanceMode() {
  await requireAdmin()

  const current = await getMaintenanceMode()

  await prisma.systemConfig.upsert({
    where: { key: 'maintenance_mode' },
    create: { key: 'maintenance_mode', value: current ? 'false' : 'true' },
    update: { value: current ? 'false' : 'true' },
  })

  revalidatePath('/admin')
  revalidatePath('/', 'layout')
  return !current
}
