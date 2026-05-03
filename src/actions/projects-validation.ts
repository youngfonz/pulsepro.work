// Validation rules for Project create/update — shared between the
// Server Action (src/actions/projects.ts) and the REST endpoint
// (src/app/api/v1/projects/route.ts) so they can't drift.

export const VALID_PROJECT_STATUSES = ['not_started', 'in_progress', 'on_hold', 'completed']
export const VALID_PRIORITIES = ['high', 'medium', 'low']
export const MAX_NAME_LENGTH = 200
export const MAX_TEXT_LENGTH = 10000
