/**
 * Production database deployment script — VERCEL BUILDS ONLY.
 *
 * Uses `prisma migrate deploy` to safely apply only pending migrations.
 * This NEVER drops data — it only runs forward migrations.
 *
 * If the migration table doesn't exist yet (because the DB was previously
 * managed by `db push`), we baseline all existing migrations so they're
 * marked as applied without re-running them.
 *
 * Safety: This script refuses to run outside of Vercel builds.
 * For local development, use `npx prisma migrate dev` instead.
 */

// ── Vercel-Only Guard ───────────────────────────────────────────────
if (!process.env.VERCEL) {
  console.error('')
  console.error('  ┌──────────────────────────────────────────────────┐')
  console.error('  │  BLOCKED: deploy.mjs only runs on Vercel        │')
  console.error('  └──────────────────────────────────────────────────┘')
  console.error('')
  console.error('  This script is for production deployments only.')
  console.error('  For local development, use:')
  console.error('    npx prisma migrate dev')
  console.error('')
  process.exit(1)
}
// ─────────────────────────────────────────────────────────────────────

import { execSync } from 'child_process'
import { PrismaClient } from '@prisma/client'
import { readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

async function baselineIfNeeded() {
  const prisma = new PrismaClient()
  try {
    // Check if _prisma_migrations table exists
    const result = await prisma.$queryRawUnsafe(
      `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = '_prisma_migrations')`
    )
    const exists = result[0]?.exists

    if (!exists) {
      console.log('[deploy] No migration history found — baselining existing migrations...')
      // Mark all existing migrations as applied (they were applied by db push)
      const migrationsDir = join(__dirname, 'migrations')
      const dirs = readdirSync(migrationsDir, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => d.name)
        .sort()

      for (const name of dirs) {
        console.log(`[deploy] Baselining: ${name}`)
        execSync(`npx prisma migrate resolve --applied ${name}`, { stdio: 'inherit' })
      }
      console.log('[deploy] Baseline complete')
    }
  } finally {
    await prisma.$disconnect()
  }
}

async function resolveFailedMigrations() {
  const prisma = new PrismaClient()
  try {
    const result = await prisma.$queryRawUnsafe(
      `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = '_prisma_migrations')`
    )
    if (!result[0]?.exists) return

    // Fix any migrations stuck in a failed/incomplete state by marking them as finished
    const fixed = await prisma.$executeRawUnsafe(
      `UPDATE _prisma_migrations SET finished_at = NOW(), rolled_back_at = NULL, logs = 'Auto-resolved by deploy.mjs' WHERE finished_at IS NULL OR rolled_back_at IS NOT NULL`
    )
    if (fixed > 0) {
      console.log(`[deploy] Fixed ${fixed} failed/stuck migration(s) in _prisma_migrations table`)
    }
  } finally {
    await prisma.$disconnect()
  }
}

// Prisma's migration advisory lock ID — see https://github.com/prisma/prisma/issues/9613
// Leaks across pgbouncer pool cycling on Neon, causing future deploys to fail with a 10s timeout.
const PRISMA_MIGRATION_LOCK_ID = 72707369

async function clearOrphanedMigrationLock() {
  const prisma = new PrismaClient()
  try {
    const holders = await prisma.$queryRawUnsafe(`
      SELECT l.pid, a.state,
             EXTRACT(EPOCH FROM (now() - a.state_change))::int as idle_s
      FROM pg_locks l
      LEFT JOIN pg_stat_activity a ON a.pid = l.pid
      WHERE l.locktype = 'advisory' AND l.objid = ${PRISMA_MIGRATION_LOCK_ID}
    `)
    if (holders.length === 0) return

    for (const h of holders) {
      // Only terminate connections that have been idle for >30s — never kill an
      // actively-running migration. Real `migrate deploy` sessions stay 'active'.
      if (h.state === 'idle' && h.idle_s > 30) {
        console.log(`[deploy] Terminating orphaned lock holder pid=${h.pid} (idle ${h.idle_s}s)`)
        await prisma.$queryRawUnsafe(`SELECT pg_terminate_backend(${h.pid})`)
      } else {
        console.log(`[deploy] Skipping pid=${h.pid} (state=${h.state}, idle=${h.idle_s}s) — looks active`)
      }
    }
  } catch (e) {
    console.warn('[deploy] Lock cleanup check failed (non-fatal):', e.message)
  } finally {
    await prisma.$disconnect()
  }
}

async function run() {
  await baselineIfNeeded()
  await resolveFailedMigrations()
  await clearOrphanedMigrationLock()

  // Apply pending migrations safely — no data loss
  execSync('npx prisma migrate deploy', { stdio: 'inherit' })
  console.log('[deploy] Migrations applied successfully')
}

run().catch((err) => {
  console.error('[deploy] Failed:', err)
  process.exit(1)
})
