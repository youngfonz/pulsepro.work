import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdminUser } from '@/lib/auth'
import { sendTelegramMessage } from '@/lib/telegram'
import { parseCommand } from '@/lib/telegram-commands'
import { executeCommand } from '@/lib/telegram-executor'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  // Validate webhook secret (timing-safe)
  const secret = request.headers.get('x-telegram-bot-api-secret-token')
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET
  if (!secret || !expected ||
      secret.length !== expected.length ||
      !crypto.timingSafeEqual(Buffer.from(secret), Buffer.from(expected))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const message = body.message

  if (!message?.text || !message?.chat?.id) {
    return NextResponse.json({ ok: true })
  }

  const chatId = String(message.chat.id)
  const text = message.text.trim()

  // Handle /start (welcome message)
  if (text === '/start') {
    await sendTelegramMessage(
      chatId,
      `Welcome to Pulse Pro Bot!\n\nTo link your account, go to <b>Settings → Telegram</b> in the app, click "Link Telegram", then send the code here.`
    )
    return NextResponse.json({ ok: true })
  }

  // Handle link codes: LINK-XXXXXXXX or /start LINK-XXXXXXXX (from deep link)
  // Generator emits 4 bytes of randomness = 8 hex chars (src/actions/telegram.ts).
  const linkCodeMatch = text.match(/^(?:\/start\s+)?(LINK-[A-F0-9]{8})$/i)
  if (linkCodeMatch) {
    return handleVerification(chatId, linkCodeMatch[1].toUpperCase())
  }

  // Look up user by chatId
  const subscription = await prisma.subscription.findUnique({
    where: { telegramChatId: chatId },
  })

  if (!subscription) {
    await sendTelegramMessage(
      chatId,
      `Your Telegram isn't linked to a Pulse Pro account yet.\n\nGo to <b>Settings → Telegram</b> in the app, click "Link Telegram", and send the code here.`
    )
    return NextResponse.json({ ok: true })
  }

  // Check Pro plan
  if (subscription.plan !== 'pro' && subscription.plan !== 'team' && !isAdminUser(subscription.userId)) {
    await sendTelegramMessage(
      chatId,
      `The Telegram bot is a Pro feature. Upgrade your plan at pulsepro.work/settings to use it.`
    )
    return NextResponse.json({ ok: true })
  }

  const command = parseCommand(text)
  const reply = await executeCommand(command, subscription.userId, chatId)
  await sendTelegramMessage(chatId, reply)

  return NextResponse.json({ ok: true })
}

async function handleVerification(chatId: string, code: string) {
  const subscription = await prisma.subscription.findFirst({
    where: {
      telegramVerifyCode: code,
      telegramVerifyExpires: { gt: new Date() },
    },
  })

  if (!subscription) {
    await sendTelegramMessage(
      chatId,
      `Invalid or expired link code. Go to <b>Settings → Telegram</b> and generate a new link.`
    )
    return NextResponse.json({ ok: true })
  }

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      telegramChatId: chatId,
      telegramVerifyCode: null,
      telegramVerifyExpires: null,
    },
  })

  await sendTelegramMessage(
    chatId,
    `Account linked! Send <b>help</b> to see available commands.`
  )

  return NextResponse.json({ ok: true })
}
