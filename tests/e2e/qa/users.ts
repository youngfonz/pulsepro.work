// Three test users, one per plan tier.
// Emails use Clerk's `+clerk_test` suffix — Clerk dev/test instances auto-accept
// the verification code 424242 for these addresses.
// Password is reused because Clerk test mode doesn't care.

export const QA_PASSWORD = 'PulseProQA!2026'

export const qaUsers = {
  free: {
    key: 'free',
    email: 'qa.free+clerk_test@pulsepro.work',
    plan: 'free' as const,
    firstName: 'QaFree',
    lastName: 'Tester',
    storageStatePath: 'tests/e2e/qa/.auth/free.json',
  },
  pro: {
    key: 'pro',
    email: 'qa.pro+clerk_test@pulsepro.work',
    plan: 'pro' as const,
    firstName: 'QaPro',
    lastName: 'Tester',
    storageStatePath: 'tests/e2e/qa/.auth/pro.json',
  },
  team: {
    key: 'team',
    email: 'qa.team+clerk_test@pulsepro.work',
    plan: 'team' as const,
    firstName: 'QaTeam',
    lastName: 'Tester',
    storageStatePath: 'tests/e2e/qa/.auth/team.json',
  },
  // Secondary account used for collaboration/invoice-share tests
  secondary: {
    key: 'secondary',
    email: 'qa.secondary+clerk_test@pulsepro.work',
    plan: 'free' as const,
    firstName: 'QaSecondary',
    lastName: 'Tester',
    storageStatePath: 'tests/e2e/qa/.auth/secondary.json',
  },
} as const

export type QaUserKey = keyof typeof qaUsers
