// Validation rules for Task create/update — shared between the
// Server Action (src/actions/tasks.ts) and the REST endpoints
// (src/app/api/v1/tasks/*) so they can't drift.

export const VALID_PRIORITIES = ['high', 'medium', 'low']
export const MAX_TITLE_LENGTH = 500
export const MAX_TEXT_LENGTH = 10000
