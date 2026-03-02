/**
 * Safe wrapper for `prisma db push`.
 *
 * Blocks execution if DATABASE_URL points to the production database.
 * Use `npm run db:push` instead of `npx prisma db push` directly.
 */

import { execSync } from 'child_process'
import { config } from 'dotenv'

config({ path: '.env.local' })
config() // fallback to .env

const PRODUCTION_ENDPOINT = 'ep-delicate-queen-aiajl1lv'
const dbUrl = process.env.DATABASE_URL || ''

if (dbUrl.includes(PRODUCTION_ENDPOINT)) {
  console.error('')
  console.error('  ┌──────────────────────────────────────────────────┐')
  console.error('  │  BLOCKED: Cannot db push to production           │')
  console.error('  └──────────────────────────────────────────────────┘')
  console.error('')
  console.error('  Your DATABASE_URL points to production.')
  console.error('  `prisma db push` can DROP TABLES and DESTROY DATA.')
  console.error('')
  console.error('  To push schema changes locally, use a Neon dev branch:')
  console.error('  1. Go to https://console.neon.tech → Branches')
  console.error('  2. Create a branch from "main"')
  console.error('  3. Copy the new connection string')
  console.error('  4. Update DATABASE_URL in .env.local')
  console.error('')
  console.error('  For production, schema changes go through migrations:')
  console.error('    npx prisma migrate dev --name describe_your_change')
  console.error('    git add prisma/migrations && git commit && git push')
  console.error('')
  process.exit(1)
}

if (process.env.VERCEL) {
  console.error('BLOCKED: db push cannot run during Vercel builds.')
  process.exit(1)
}

console.log('[safe-push] DATABASE_URL is not production — proceeding...')
execSync('npx prisma db push', { stdio: 'inherit' })
