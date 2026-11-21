import { generateObject } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { z } from 'zod'
import { tracker } from './config'
import type { ContextLine } from './slack-api'

const model = anthropic('claude-sonnet-5-5')

export const TriageSchema = z.object({
  isAsk: z.boolean().describe('True only if this message asks the owner to make, change, send or fix something. Banter, thanks, reactions and status chatter are false.'),
  kind: z.enum(['request', 'edit']).describe('request = a new piece of work; edit = a change or follow-up to work already asked for'),
  request: z.string().nullable().describe('For an edit: the exact name of the existing request it belongs to, copied from the list. For a request: a short new name (3 to 6 words). Null if unknown.'),
  confident: z.boolean().describe('False if you are not sure which existing request an edit belongs to. Never guess.'),
  todo: z.string().describe('One short imperative to-do line, under 140 characters. Wording of the task only, no chatter.'),
  textWork: z.boolean().describe('True if the ask is a caption or copy change and the full current text is in the context, so you can produce the finished revised text.'),
  draft: z.string().nullable().describe('When textWork is true: the complete revised text, ready to paste, nothing else. Otherwise null.'),
  prep: z.string().nullable().describe('When textWork is false: a short checklist (2 to 5 lines starting with "- ") of exactly what to change and where. Otherwise null.'),
})

export type Triage = z.infer<typeof TriageSchema>

export async function triage(input: { message: string; context: ContextLine[]; requests: string[] }): Promise<Triage> {
  const { object } = await generateObject({
    model,
    schema: TriageSchema,
    system: `You triage Slack DMs from ${tracker.requesterName} to ${tracker.ownerName}, a designer and video editor. Most messages are banter; only real asks matter.

Rules:
- An edit belongs to an existing request only if the context makes that clear. If two requests could fit, or none, set confident to false.
- Caption and copy changes: if the current text is in the context, apply the change exactly and return the full revised text as draft. Keep the original voice, line breaks, hashtags and tags. Change nothing that was not asked for.
- Video, photo, design and file edits are never textWork. Write prep instead.
- Never use em dashes in todo, draft or prep.
- Do not summarize or repeat the conversation.`,
    prompt: `Existing requests (most recent first):
${input.requests.length ? input.requests.map((r) => `- ${r}`).join('\n') : '(none yet)'}

Recent messages for context (oldest first):
${input.context.map((l) => `${l.who}: ${l.text}`).join('\n') || '(none)'}

New message from ${tracker.requesterName}:
${input.message}`,
  })
  return object
}
