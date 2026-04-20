import { defineConfig, devices } from '@playwright/test'
import dotenv from 'dotenv'
import path from 'node:path'

// Load env from .env.local (same file the Next dev server reads) so Playwright
// has access to CLERK_SECRET_KEY + DATABASE_URL without duplicating them.
dotenv.config({ path: path.resolve(__dirname, '.env.local') })
dotenv.config({ path: path.resolve(__dirname, '.env') })

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3001'

/**
 * QA config — drives the automated run of the external tester guide
 * (public/external-tester-guide.html).
 *
 * Runs a global setup that creates three Clerk users (free / pro / team)
 * and a secondary account, forces their plan in Prisma, and saves
 * storageState JSON per user so each spec can open as the right tier
 * without paying signup cost.
 *
 * Usage:
 *   npx playwright test --config playwright.qa.config.ts
 *   npx playwright test --config playwright.qa.config.ts --grep @phase1
 */
export default defineConfig({
  testDir: './tests/e2e/qa',
  testMatch: /.*\.spec\.ts$/,
  globalSetup: './tests/e2e/qa/global-setup.ts',
  fullyParallel: false, // keep per-tier state deterministic
  retries: 0,
  workers: 1,
  reporter: [
    ['html', { open: 'never', outputFolder: 'playwright-qa-report' }],
    ['list'],
    ['./tests/e2e/qa/reporter.ts', { outputFile: 'public/qa-results.json' }],
  ],
  timeout: 90_000,

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    navigationTimeout: 30_000,
    actionTimeout: 10_000,
  },

  projects: [
    {
      name: 'qa',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
