import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireUserId } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const userId = await requireUserId()
  const searchParams = request.nextUrl.searchParams
  const now = new Date()
  const rawYear = parseInt(searchParams.get('year') || '')
  const rawMonth = parseInt(searchParams.get('month') || '')
  const year = isNaN(rawYear) ? now.getFullYear() : Math.max(2020, Math.min(now.getFullYear() + 5, rawYear))
  const month = isNaN(rawMonth) ? now.getMonth() : Math.max(0, Math.min(11, rawMonth))

  const startOfMonth = new Date(year, month, 1)
  const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59)

  const tasks = await prisma.task.findMany({
    where: {
      userId,
      url: null,
      OR: [
        {
          dueDate: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        {
          startDate: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      ],
    },
    include: {
      project: {
        select: {
          id: true,
          name: true,
          client: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: { dueDate: 'asc' },
  })

  return NextResponse.json(tasks)
}
