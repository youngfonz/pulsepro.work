import { tracker } from './config'
import { triage } from './agent'
import { recentContext, permalink, listRows, requestNames, addRow, dmOwner } from './slack-api'

/* eslint-disable @typescript-eslint/no-explicit-any */

export function isRequesterMessage(ev: any): boolean {
  return (
    ev?.type === 'message' &&
    ev.channel === tracker.dmChannel &&
    ev.user === tracker.requesterId &&
    !ev.bot_id &&
    (!ev.subtype || ev.subtype === 'file_share')
  )
}

const NEW_REQUEST = '__new__'
export { NEW_REQUEST }

function trim(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + '…' : s
}

/** Message text is used in memory for this call only. Nothing from the DM is stored. */
export async function handleRequesterMessage(ev: any) {
  const files = ev.files?.length ?? 0
  const message = [ev.text ?? '', files ? `[${files} file(s) attached]` : ''].filter(Boolean).join('\n')
  if (!message.trim()) return

  const [context, rows] = await Promise.all([
    recentContext(ev.channel, ev.ts, ev.thread_ts),
    listRows(),
  ])
  const requests = requestNames(rows)
  const t = await triage({ message, context, requests })
  if (!t.isAsk) return

  const link = await permalink(ev.channel, ev.ts)
  const isNew = t.kind === 'request' && Boolean(t.request)
  const known = isNew || (t.request !== null && requests.includes(t.request))
  const needsOwner = !t.confident || !known
  const request = needsOwner ? '' : (t.request ?? '')
  const kind = t.kind === 'request' ? 'Request' : 'Edit'

  const rowId = await addRow({ todo: t.todo, request, kind, status: needsOwner ? 'Needs Fonz' : 'To do', source: link })

  const draft = t.textWork && t.draft && t.draft.length <= 2900 ? t.draft : null
  const blocks: unknown[] = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*New ${kind.toLowerCase()} from ${tracker.requesterName}:* ${t.todo}\n${request ? `Request: *${request}*` : '_Which request is this for?_'}  ·  <${link}|View message>`,
      },
    },
  ]

  if (needsOwner) {
    const options = [
      ...requests.slice(0, 99).map((r) => ({ text: { type: 'plain_text', text: trim(r, 75) }, value: trim(r, 150) })),
      { text: { type: 'plain_text', text: 'It is a new request' }, value: NEW_REQUEST },
    ]
    blocks.push({
      type: 'actions',
      block_id: `assign:${rowId}`,
      elements: [{ type: 'static_select', action_id: 'assign_request', placeholder: { type: 'plain_text', text: 'Pick the request' }, options }],
    })
  }

  if (draft) {
    blocks.push(
      { type: 'section', text: { type: 'mrkdwn', text: '*Draft for your OK:*' } },
      { type: 'section', block_id: 'draft', text: { type: 'plain_text', text: draft, emoji: true } },
      {
        type: 'actions',
        block_id: 'draft_actions',
        elements: [
          { type: 'button', style: 'primary', action_id: 'approve_send', text: { type: 'plain_text', text: `Send to ${tracker.requesterName}` }, value: rowId },
          { type: 'button', action_id: 'edit_send', text: { type: 'plain_text', text: 'Edit first' }, value: rowId },
          { type: 'button', action_id: 'dismiss', text: { type: 'plain_text', text: 'I will handle it' }, value: rowId },
        ],
      },
    )
  } else if (t.prep) {
    blocks.push({ type: 'section', text: { type: 'mrkdwn', text: `*Prep:*\n${trim(t.prep, 2900)}` } })
  }

  await dmOwner(`New ${kind.toLowerCase()} from ${tracker.requesterName}: ${t.todo}`, blocks)
}
