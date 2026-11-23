import { tracker } from './config'
import { isRequesterMessage } from './handle-message'
import { slackApi } from './slack-api'

/* eslint-disable @typescript-eslint/no-explicit-any */

// A routine takes 30 API fires per hour, shared with manual runs. Every message waits for the
// end of its slot and only the newest one fires, so a burst costs one fire: at most 24 an hour.
export const SLOT_MS = 150_000

export function routineEnabled() {
  return Boolean(tracker.routineToken && tracker.routineId)
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** True when the requester posted again after `ts`. That message's own event does the firing. */
async function requesterPostedAfter(channel: string, ts: string): Promise<boolean> {
  const after = Number(ts)
  const newer = (m: any) => Number(m.ts) > after && isRequesterMessage({ ...m, type: 'message', channel })

  const history = await slackApi('conversations.history', tracker.userToken, { channel, limit: 100 }, true)
  const messages: any[] = history.messages ?? []
  if (messages.some(newer)) return true

  // Thread replies are not in the channel history, only on their parent.
  const threads = messages.filter((m) => Number(m.latest_reply ?? 0) > after && m.reply_users?.includes(tracker.requesterId))
  for (const parent of threads) {
    const replies = await slackApi('conversations.replies', tracker.userToken, { channel, ts: parent.ts, oldest: ts, limit: 100 }, true)
    if ((replies.messages ?? []).some(newer)) return true
  }
  return false
}

async function fireRoutine() {
  const res = await fetch(`https://api.anthropic.com/v1/claude_code/routines/${tracker.routineId}/fire`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${tracker.routineToken}`,
      'anthropic-beta': 'experimental-cc-routine-2026-04-01',
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    // No payload: the routine reads the DM itself, so no message text leaves Slack through here.
    body: '{}',
  })
  const json = await res.json().catch(() => null)
  if (!res.ok) throw new Error(`routine fire failed: HTTP ${res.status} ${json?.error?.type ?? ''}`.trim())
  console.log('[request-tracker] routine fired:', json?.claude_code_session_id ?? 'no session id')
}

/** Reads no message text. Returns whether this message was the one that fired the routine. */
export async function bridgeRequesterMessage(ev: any): Promise<boolean> {
  await sleep(SLOT_MS - (Date.now() % SLOT_MS))
  if (await requesterPostedAfter(ev.channel, ev.ts)) return false
  await fireRoutine()
  return true
}
