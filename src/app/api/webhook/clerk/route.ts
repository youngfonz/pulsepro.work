import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { sendWelcomeEmail } from '@/lib/email'

interface ClerkUserEvent {
  data: {
    id: string
    first_name: string | null
    last_name: string | null
    email_addresses: Array<{
      id: string
      email_address: string
    }>
  }
  type: string
}

export async function POST(request: NextRequest) {
  const secret = process.env.CLERK_WEBHOOK_SECRET
  if (!secret) {
    console.error('CLERK_WEBHOOK_SECRET not configured')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 })
  }

  const svixId = request.headers.get('svix-id')
  const svixTimestamp = request.headers.get('svix-timestamp')
  const svixSignature = request.headers.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 })
  }

  const body = await request.text()

  let event: ClerkUserEvent
  try {
    const wh = new Webhook(secret)
    event = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as ClerkUserEvent
  } catch (err) {
    console.error('Clerk webhook verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  if (event.type === 'user.created') {
    const { first_name, email_addresses } = event.data
    const primaryEmail = email_addresses?.[0]?.email_address

    if (primaryEmail) {
      try {
        await sendWelcomeEmail(first_name, primaryEmail)
        // Welcome email sent successfully
      } catch (err) {
        console.error('Failed to send welcome email:', err)
        // Don't fail the webhook — email is best-effort
      }
    }
  }

  return NextResponse.json({ received: true })
}
