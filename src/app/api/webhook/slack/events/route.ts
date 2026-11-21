import { NextRequest, NextResponse, after } from 'next/server'
import { verifySlackSignature } from '@/lib/slack'
import { tracker, trackerConfigured } from '@/lib/request-tracker/config'
import { isRequesterMessage, handleRequesterMessage } from '@/lib/request-tracker/handle-message'

export const maxDuration = 60

// Slack Events API: user event message.im on the owner's behalf.
export async function POST(request: NextRequest) {
  if (!trackerConfigured()) return new NextResponse('Not configured', { status: 503 })

  const rawBody = await request.text()
  const timestamp = request.headers.get('x-slack-request-timestamp') ?? ''
  const signature = request.headers.get('x-slack-signature') ?? ''
  if (!verifySlackSignature(rawBody, timestamp, signature, tracker.signingSecret)) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const body = JSON.parse(rawBody)
  if (body.type === 'url_verification') return NextResponse.json({ challenge: body.challenge })

  // Slack retries when we are slow; the first delivery is already being handled.
  if (request.headers.get('x-slack-retry-num')) return new NextResponse(null, { status: 200 })

  if (body.type === 'event_callback' && isRequesterMessage(body.event)) {
    const event = body.event
    after(async () => {
      try {
        await handleRequesterMessage(event)
      } catch (err) {
        // Never log message content.
        console.error('[request-tracker] event failed:', err instanceof Error ? err.message : 'unknown')
      }
    })
  }

  return new NextResponse(null, { status: 200 })
}
