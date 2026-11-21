import { tracker, COLUMNS, type Kind, type Status } from './config'

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function slackApi<T = any>(
  method: string,
  token: string,
  body: Record<string, unknown>,
  form = false,
): Promise<T> {
  const res = await fetch(`https://slack.com/api/${method}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': form ? 'application/x-www-form-urlencoded' : 'application/json; charset=utf-8',
    },
    body: form
      ? new URLSearchParams(Object.entries(body).map(([k, v]) => [k, String(v)])).toString()
      : JSON.stringify(body),
  })
  const json = await res.json()
  if (!json.ok) throw new Error(`Slack ${method} failed: ${json.error}`)
  return json
}

// ---------- DM reading (held in memory only, never stored) ----------

export interface ContextLine { who: string; text: string }

export async function recentContext(channel: string, ts: string, threadTs?: string): Promise<ContextLine[]> {
  const res = threadTs && threadTs !== ts
    ? await slackApi('conversations.replies', tracker.userToken, { channel, ts: threadTs, latest: ts, inclusive: false, limit: 30 }, true)
    : await slackApi('conversations.history', tracker.userToken, { channel, latest: ts, inclusive: false, limit: 25 }, true)
  const msgs: any[] = res.messages ?? []
  return msgs
    .filter((m) => m.ts !== ts && (m.text || m.files?.length))
    .sort((a, b) => Number(a.ts) - Number(b.ts))
    .slice(-25)
    .map((m) => ({
      who: m.user === tracker.requesterId ? tracker.requesterName : tracker.ownerName,
      text: [m.text ?? '', m.files?.length ? `[${m.files.length} file(s) attached]` : ''].filter(Boolean).join(' '),
    }))
}

export async function permalink(channel: string, ts: string): Promise<string> {
  const res = await slackApi('chat.getPermalink', tracker.userToken, { channel, message_ts: ts }, true)
  return res.permalink
}

export async function postAsOwner(text: string) {
  await slackApi('chat.postMessage', tracker.userToken, { channel: tracker.dmChannel, text })
}

export async function dmOwner(text: string, blocks: unknown[]) {
  await slackApi('chat.postMessage', tracker.botToken, { channel: tracker.ownerId, text, blocks })
}

// ---------- Slack List ----------

const STATUS_LABELS: Status[] = ['To do', 'Needs Fonz', 'Done']
const KIND_LABELS: Kind[] = ['Request', 'Edit']

interface Schema { kind: Record<string, string>; status: Record<string, string> }
let schemaCache: Schema | null = null

// Select cells take option IDs, not labels. Find them in the List schema.
function findChoices(node: any, colId: string): Record<string, string> | null {
  if (!node || typeof node !== 'object') return null
  if (node.id === colId || node.key === colId) {
    const raw = node.options?.choices ?? node.choices ?? node.options
    if (Array.isArray(raw)) {
      const map: Record<string, string> = {}
      for (const c of raw) {
        const label = c.label ?? c.text ?? c.name
        const value = c.value ?? c.id
        if (label && value) map[label] = value
      }
      return map
    }
  }
  for (const v of Object.values(node)) {
    const found = findChoices(v, colId)
    if (found) return found
  }
  return null
}

export async function getSchema(): Promise<Schema> {
  if (schemaCache) return schemaCache
  const res = await slackApi('slackLists.items.list', tracker.userToken, { list_id: tracker.listId, limit: 1, include_list: true })
  const kind = findChoices(res, COLUMNS.kind) ?? {}
  const status = findChoices(res, COLUMNS.status) ?? {}
  if (!KIND_LABELS.every((l) => kind[l]) || !STATUS_LABELS.every((l) => status[l])) {
    console.warn('[request-tracker] could not resolve every select option; selects will be left blank')
  }
  schemaCache = { kind, status }
  return schemaCache
}

export interface Row { id: string; todo: string; request: string; kind: string; status: string; created: number }

function cellText(f: any): string {
  if (!f) return ''
  if (typeof f.text === 'string') return f.text
  if (typeof f.value === 'string') return f.value
  return ''
}

export async function listRows(): Promise<Row[]> {
  const res = await slackApi('slackLists.items.list', tracker.userToken, { list_id: tracker.listId, limit: 500 })
  const items: any[] = res.items ?? []
  return items.map((it) => {
    const fields: any[] = it.fields ?? []
    const get = (col: string) => fields.find((f) => f.column_id === col || f.key === col)
    return {
      id: it.id,
      todo: cellText(get(COLUMNS.todo)),
      request: cellText(get(COLUMNS.request)),
      kind: get(COLUMNS.kind)?.select?.[0] ?? '',
      status: get(COLUMNS.status)?.select?.[0] ?? '',
      created: Number(it.date_created ?? it.created ?? 0),
    }
  })
}

/** Distinct request names, most recent first. */
export function requestNames(rows: Row[]): string[] {
  const names: string[] = []
  for (const r of [...rows].sort((a, b) => b.created - a.created)) {
    const n = r.request.trim()
    if (n && !names.includes(n)) names.push(n)
  }
  return names.slice(0, 40)
}

function richText(text: string, url?: string) {
  const el = url ? { type: 'link', url, text } : { type: 'text', text }
  return [{ type: 'rich_text', elements: [{ type: 'rich_text_section', elements: [el] }] }]
}

function laDate() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' })
}

export async function addRow(r: { todo: string; request: string; kind: Kind; status: Status; source: string }): Promise<string> {
  const schema = await getSchema()
  const fields: unknown[] = [
    { column_id: COLUMNS.todo, rich_text: richText(r.todo) },
    { column_id: COLUMNS.source, rich_text: richText('View message', r.source) },
    { column_id: COLUMNS.added, date: [laDate()] },
  ]
  if (r.request) fields.push({ column_id: COLUMNS.request, rich_text: richText(r.request) })
  if (schema.kind[r.kind]) fields.push({ column_id: COLUMNS.kind, select: [schema.kind[r.kind]] })
  if (schema.status[r.status]) fields.push({ column_id: COLUMNS.status, select: [schema.status[r.status]] })
  const res = await slackApi('slackLists.items.create', tracker.userToken, { list_id: tracker.listId, initial_fields: fields })
  return res.item?.id ?? ''
}

export async function updateRow(rowId: string, r: { request?: string; kind?: Kind; status?: Status }) {
  if (!rowId) return
  const schema = await getSchema()
  const cells: unknown[] = []
  if (r.request !== undefined) cells.push({ row_id: rowId, column_id: COLUMNS.request, rich_text: richText(r.request) })
  if (r.kind && schema.kind[r.kind]) cells.push({ row_id: rowId, column_id: COLUMNS.kind, select: [schema.kind[r.kind]] })
  if (r.status && schema.status[r.status]) cells.push({ row_id: rowId, column_id: COLUMNS.status, select: [schema.status[r.status]] })
  if (cells.length) await slackApi('slackLists.items.update', tracker.userToken, { list_id: tracker.listId, cells })
}
