// Validation rules for kanban board task status transitions — shared
// between the Server Action (src/actions/board.ts) and the REST endpoint
// (src/app/api/v1/board/route.ts) so they can't drift.

export const VALID_TASK_STATUSES = ['todo', 'in_progress', 'done']
