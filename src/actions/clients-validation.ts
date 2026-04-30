// Validation rules for Client create/update — shared between the
// Server Action (src/actions/clients.ts) and the REST endpoints
// (src/app/api/v1/clients/*) so they can't drift.

export const VALID_CLIENT_STATUSES = ['active', 'inactive']
export const MAX_NAME_LENGTH = 200
export const MAX_TEXT_LENGTH = 5000
