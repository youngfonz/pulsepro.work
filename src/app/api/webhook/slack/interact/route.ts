import { NextRequest, NextResponse, after } from 'next/server'
import { verifySlackSignature } from '@/lib/slack'
import { tracker, trackerConfigured } from '@/lib/request-tracker/config'
import { NEW_REQUEST } from '@/lib/request-tracker/handle-message'
import { slackApi, postAsOwner, updateRow, listRows } from '@/lib/request-tracker/slack-api'

/* eslint-disable @typescript-eslint/no-explicit-any */

export const maxDuration = 30

// Replace the owner's private message: drop its buttons and add a status line.
async function settle(responseUrl: string, blocks: any[], note: string) {
  const kept = (blocks ?? []).filter((b) => b.type !== 'actions')
  await fetch(responseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      replace_original: true,
      text: note,
      blocks: [...kept, { type: 'context', elements: [{ type: 'mrkdwn', text: note }] }],
    }),
  })
}

function draftFrom(blocks: any[]): string {
  return blocks?.find((b) => b.block_id === 'draft')?.text?.text ?? ''
}

async function sendApproved(text: string, rowId: string, responseUrl: string, blocks: any[]) {
  await postAsOwner(text)
  await updateRow(rowId, { status: 'Done' })
  await settle(responseUrl, blocks, `Sent to ${tracker.requesterName} and marked Done.`)
}

async function handleAction(payload: any) {
  const action = payload.actions?.[0]
  if (!action) return
  const blocks = payload.message?.blocks ?? []
  const responseUrl: string = payload.response_url

  switch (action.action_id) {
    case 'approve_send': {
      const text = draftFrom(blocks)
      if (text) await sendApproved(text, action.value, responseUrl, blocks)
      return
    }
    case 'dismiss':
      await settle(responseUrl, blocks, 'Left on your list as To do.')
      return
    case 'assign_request': {
      const rowId = String(action.block_id ?? '').replace(/^assign:/, '')
      const choice: string = action.selected_option?.value ?? ''
      if (choice === NEW_REQUEST) {
        const row = (await listRows()).find((r) => r.id === rowId)
        const name = row?.todo ?? 'New request'
        await updateRow(rowId, { request: name, kind: 'Request', status: 'To do' })
        // Keep the draft buttons if there are any; only the picker goes away.
        await settleAssign(responseUrl, blocks, `Filed as a new request: *${name}*`)
      } else {
        await updateRow(rowId, { request: choice, status: 'To do' })
        await settleAssign(responseUrl, blocks, `Filed under *${choice}*`)
      }
      return
    }
  }
}

async function settleAssign(responseUrl: string, blocks: any[], note: string) {
  const kept = blocks.filter((b: any) => !String(b.block_id ?? '').startsWith('assign:'))
  await fetch(responseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      replace_original: true,
      text: note,
      blocks: [...kept, { type: 'context', elements: [{ type: 'mrkdwn', text: note }] }],
    }),
  })
}

async function openEditModal(payload: any) {
  const action = payload.actions[0]
  await slackApi('views.open', tracker.botToken, {
    trigger_id: payload.trigger_id,
    view: {
      type: 'modal',
      callback_id: 'edit_send',
      private_metadata: JSON.stringify({ rowId: action.value, responseUrl: payload.response_url }),
      title: { type: 'plain_text', text: 'Edit before sending' },
      submit: { type: 'plain_text', text: `Send to ${tracker.requesterName}` },
      close: { type: 'plain_text', text: 'Cancel' },
      blocks: [
        {
          type: 'input',
          block_id: 'text',
          label: { type: 'plain_text', text: 'Message' },
          element: {
            type: 'plain_text_input',
            action_id: 'value',
            multiline: true,
            max_length: 3000,
            initial_value: draftFrom(payload.message?.blocks ?? []),
          },
        },
      ],
    },
  })
}

export async function POST(request: NextRequest) {
  if (!trackerConfigured()) return new NextResponse('Not configured', { status: 503 })

  const rawBody = await request.text()
  const timestamp = request.headers.get('x-slack-request-timestamp') ?? ''
  const signature = request.headers.get('x-slack-signature') ?? ''
  if (!verifySlackSignature(rawBody, timestamp, signature, tracker.signingSecret)) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const payload = JSON.parse(new URLSearchParams(rawBody).get('payload') ?? '{}')
  // Only the owner can approve or file anything.
  if (payload.user?.id !== tracker.ownerId) return new NextResponse(null, { status: 200 })

  if (payload.type === 'block_actions') {
    // trigger_id expires in 3 seconds, so open the modal before acking.
    if (payload.actions?.[0]?.action_id === 'edit_send') {
      await openEditModal(payload).catch((err) =>
        console.error('[request-tracker] modal failed:', err instanceof Error ? err.message : 'unknown'),
      )
      return new NextResponse(null, { status: 200 })
    }
    after(() => handleAction(payload).catch((err) =>
      console.error('[request-tracker] action failed:', err instanceof Error ? err.message : 'unknown'),
    ))
    return new NextResponse(null, { status: 200 })
  }

  if (payload.type === 'view_submission' && payload.view?.callback_id === 'edit_send') {
    const text: string = payload.view.state?.values?.text?.value?.value ?? ''
    const { rowId, responseUrl } = JSON.parse(payload.view.private_metadata || '{}')
    if (text.trim()) {
      after(async () => {
        try {
          await postAsOwner(text)
          await updateRow(rowId, { status: 'Done' })
          if (responseUrl) {
            await fetch(responseUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ replace_original: false, text: `Edited version sent to ${tracker.requesterName} and marked Done.` }),
            })
          }
        } catch (err) {
          console.error('[request-tracker] send failed:', err instanceof Error ? err.message : 'unknown')
        }
      })
    }
    return new NextResponse(null, { status: 200 })
  }

  return new NextResponse(null, { status: 200 })
}
