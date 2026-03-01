import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { resend } from '@/lib/email'
import { sendTelegramMessage } from '@/lib/telegram'

const OWNER_USER_ID = process.env.REMINDER_USER_ID

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!resend) {
    return NextResponse.json({ error: 'Email not configured' }, { status: 503 })
  }

  const reminderEmail = process.env.REMINDER_EMAIL
  if (!reminderEmail || !OWNER_USER_ID) {
    return NextResponse.json({ error: 'REMINDER_EMAIL or REMINDER_USER_ID not set' }, { status: 503 })
  }

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const todayEnd = new Date(todayStart)
  todayEnd.setDate(todayEnd.getDate() + 1)

  const [overdueTasks, dueTodayTasks] = await Promise.all([
    prisma.task.findMany({
      where: {
        userId: OWNER_USER_ID,
        status: { not: 'done' },
        url: null,
        dueDate: { lt: todayStart },
      },
      include: { project: { select: { id: true, name: true } } },
      orderBy: { dueDate: 'asc' },
    }),
    prisma.task.findMany({
      where: {
        userId: OWNER_USER_ID,
        status: { not: 'done' },
        url: null,
        dueDate: { gte: todayStart, lt: todayEnd },
      },
      include: { project: { select: { id: true, name: true } } },
      orderBy: { priority: 'desc' },
    }),
  ])

  if (overdueTasks.length === 0 && dueTodayTasks.length === 0) {
    return NextResponse.json({ status: 'skipped', reason: 'No tasks due' })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pulsepro.work'
  const totalTasks = overdueTasks.length + dueTodayTasks.length
  const dateStr = todayStart.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  const html = buildEmailHtml({ overdueTasks, dueTodayTasks, appUrl, dateStr })

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'Pulse Pro <onboarding@resend.dev>',
    to: reminderEmail,
    subject: `${totalTasks} task${totalTasks === 1 ? '' : 's'} need${totalTasks === 1 ? 's' : ''} attention — ${dateStr}`,
    html,
  })

  // Send Telegram reminders to opted-in users
  let telegramSent = 0
  const telegramSubs = await prisma.subscription.findMany({
    where: {
      telegramRemindersEnabled: true,
      telegramChatId: { not: null },
    },
  })

  for (const sub of telegramSubs) {
    const [userOverdue, userDueToday] = await Promise.all([
      prisma.task.count({
        where: { userId: sub.userId, status: { not: 'done' }, url: null, dueDate: { lt: todayStart } },
      }),
      prisma.task.count({
        where: { userId: sub.userId, status: { not: 'done' }, url: null, dueDate: { gte: todayStart, lt: todayEnd } },
      }),
    ])

    if (userOverdue === 0 && userDueToday === 0) continue

    const lines = [`<b>Daily Summary</b> — ${dateStr}`]
    if (userOverdue > 0) lines.push(`${userOverdue} overdue task${userOverdue === 1 ? '' : 's'}`)
    if (userDueToday > 0) lines.push(`${userDueToday} task${userDueToday === 1 ? '' : 's'} due today`)
    lines.push('', 'Send <b>tasks</b> to see your list.')

    await sendTelegramMessage(sub.telegramChatId!, lines.join('\n'))
    telegramSent++
  }

  return NextResponse.json({
    status: 'sent',
    overdue: overdueTasks.length,
    dueToday: dueTodayTasks.length,
    telegramSent,
  })
}

interface TaskWithProject {
  id: string
  title: string
  priority: string
  dueDate: Date | null
  project: { id: string; name: string } | null
}

function daysOverdue(dueDate: Date | null): number {
  if (!dueDate) return 0
  const now = new Date()
  const due = new Date(dueDate)
  const diff = Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(0, diff)
}

function priorityColor(priority: string): string {
  switch (priority) {
    case 'high': return '#dc2626'
    case 'medium': return '#d97706'
    case 'low': return '#6b7280'
    default: return '#6b7280'
  }
}

function priorityLabel(priority: string): string {
  switch (priority) {
    case 'high': return 'High'
    case 'medium': return 'Med'
    case 'low': return 'Low'
    default: return priority
  }
}

function buildEmailHtml({
  overdueTasks,
  dueTodayTasks,
  appUrl,
  dateStr,
}: {
  overdueTasks: TaskWithProject[]
  dueTodayTasks: TaskWithProject[]
  appUrl: string
  dateStr: string
}): string {
  const taskRow = (task: TaskWithProject, showOverdue = false) => {
    const days = daysOverdue(task.dueDate)
    return `
      <tr>
        <td style="padding: 12px 16px; border-bottom: 1px solid #e5e5e5;">
          <a href="${appUrl}/tasks/${task.id}" style="color: #0a0a0a; text-decoration: none; font-weight: 500; font-size: 14px;">
            ${task.title}
          </a>
          <div style="margin-top: 4px; font-size: 12px; color: #737373;">
            ${task.project?.name ?? 'Quick task'}${showOverdue && days > 0 ? ` &middot; <span style="color: #dc2626;">${days} day${days === 1 ? '' : 's'} overdue</span>` : ''}
          </div>
        </td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #e5e5e5; text-align: right; vertical-align: top;">
          <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; color: ${priorityColor(task.priority)}; background-color: ${priorityColor(task.priority)}15;">
            ${priorityLabel(task.priority)}
          </span>
        </td>
      </tr>
    `
  }

  const section = (title: string, tasks: TaskWithProject[], color: string, showOverdue = false) => {
    if (tasks.length === 0) return ''
    return `
      <div style="margin-bottom: 32px;">
        <div style="padding: 0 16px; margin-bottom: 12px;">
          <span style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: ${color};">
            ${title} (${tasks.length})
          </span>
        </div>
        <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e5e5; border-radius: 8px; border-collapse: separate; overflow: hidden;">
          ${tasks.map(t => taskRow(t, showOverdue)).join('')}
        </table>
      </div>
    `
  }

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
    <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width: 560px; margin: 0 auto; padding: 40px 20px;">
        <div style="background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e5e5; overflow: hidden;">

          <!-- Header -->
          <div style="padding: 32px 24px 24px;">
            <div style="font-size: 18px; font-weight: 700; color: #0a0a0a; margin-bottom: 4px;">Pulse Pro</div>
            <div style="font-size: 13px; color: #737373;">${dateStr}</div>
          </div>

          <!-- Content -->
          <div style="padding: 0 24px 32px;">
            ${section('Overdue', overdueTasks, '#dc2626', true)}
            ${section('Due Today', dueTodayTasks, '#2563eb', false)}

            <div style="text-align: center; padding-top: 8px;">
              <a href="${appUrl}/tasks" style="display: inline-block; padding: 10px 24px; background-color: #171717; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: 500;">
                View all tasks
              </a>
            </div>
          </div>
        </div>

        <div style="text-align: center; padding: 16px; font-size: 11px; color: #a3a3a3;">
          Sent by Pulse Pro &middot; Daily task reminder
        </div>
      </div>
    </body>
    </html>
  `
}
