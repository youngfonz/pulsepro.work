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

    const failed = await prisma.$queryRawUnsafe(
      `SELECT migration_name FROM _prisma_migrations WHERE rolled_back_at IS NOT NULL OR (finished_at IS NULL AND started_at IS NOT NULL AND started_at < NOW() - INTERVAL '10 minutes')`
    )
    for (const row of failed) {
      console.log(`[deploy] Resolving failed migration: ${row.migration_name}`)
      execSync(`npx prisma migrate resolve --applied ${row.migration_name}`, { stdio: 'inherit' })
    }
  } finally {
    await prisma.$disconnect()
  }
}

async function run() {
  await baselineIfNeeded()
  await resolveFailedMigrations()

  // Apply pending migrations safely — no data loss
  execSync('npx prisma migrate deploy', { stdio: 'inherit' })
  console.log('[deploy] Migrations applied successfully')
}

run().catch((err) => {
  console.error('[deploy] Failed:', err)
  process.exit(1)
})
