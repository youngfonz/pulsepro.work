// Request tracker: files one requester's Slack DM asks into a Slack List and
// hands them to an agent. Single-tenant for the Joel test; all IDs come from env.

export const tracker = {
  signingSecret: process.env.REQUEST_TRACKER_SIGNING_SECRET ?? '',
  userToken: process.env.REQUEST_TRACKER_USER_TOKEN ?? '', // owner's xoxp token: reads the DM, posts approved replies, writes the List
  botToken: process.env.REQUEST_TRACKER_BOT_TOKEN ?? '', // xoxb token: private DMs to the owner, modals
  dmChannel: process.env.REQUEST_TRACKER_DM_CHANNEL ?? '',
  requesterId: process.env.REQUEST_TRACKER_REQUESTER_ID ?? '',
  ownerId: process.env.REQUEST_TRACKER_OWNER_ID ?? '',
  listId: process.env.REQUEST_TRACKER_LIST_ID ?? '',
  requesterName: process.env.REQUEST_TRACKER_REQUESTER_NAME ?? 'Joel',
  ownerName: process.env.REQUEST_TRACKER_OWNER_NAME ?? 'Fonz',
}

export function trackerConfigured() {
  return Boolean(
    tracker.signingSecret && tracker.userToken && tracker.botToken &&
    tracker.dmChannel && tracker.requesterId && tracker.ownerId && tracker.listId,
  )
}

// Column keys of the "Joel requests" List (F0CLQ5PGC6L).
export const COLUMNS = {
  todo: process.env.REQUEST_TRACKER_COL_TODO ?? 'Col0CKQFJBAJH',
  request: process.env.REQUEST_TRACKER_COL_REQUEST ?? 'Col0CKZFD2VL4',
  kind: process.env.REQUEST_TRACKER_COL_KIND ?? 'Col0CKECZVDRD',
  status: process.env.REQUEST_TRACKER_COL_STATUS ?? 'Col0CKPHD27T5',
  source: process.env.REQUEST_TRACKER_COL_SOURCE ?? 'Col0CLQ5PG0GY',
  added: process.env.REQUEST_TRACKER_COL_ADDED ?? 'Col0CKVJN4F0S',
}

export type Kind = 'Request' | 'Edit'
export type Status = 'To do' | 'Needs Fonz' | 'Done'
