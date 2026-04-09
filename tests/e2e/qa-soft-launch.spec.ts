import { test, expect } from '@playwright/test'

/**
 * Soft Launch QA — Full Checklist
 *
 * Step 1: Log in manually and save auth state:
 *   PLAYWRIGHT_BASE_URL=https://www.pulsepro.work npx playwright test qa-soft-launch --headed --project=chrome -g "save auth"
 *   (This opens YOUR real Chrome. Log in, then close the browser.)
 *
 * Step 2: Run all tests using the saved auth:
 *   PLAYWRIGHT_BASE_URL=https://www.pulsepro.work npx playwright test qa-soft-launch --project=chrome -g "^(?!.*save auth)"
 */

const BASE = process.env.PLAYWRIGHT_BASE_URL || 'https://www.pulsepro.work'

// ─── Step 1: Auth Setup (run this first, once) ──────────────────────────────

test('save auth — log in with your real Chrome', async ({ browser }) => {
  const context = await browser.newContext()
  const page = await context.newPage()
  await page.goto(`${BASE}/sign-in`)
  // ⏸ Log in manually, then press "Resume" in the Playwright inspector
  await page.pause()
  // Verify we're authenticated
  await page.goto(`${BASE}/dashboard`)
  await page.waitForTimeout(5000)
  expect(page.url()).toContain('/dashboard')
  // Save cookies + localStorage for all other tests
  await context.storageState({ path: 'tests/e2e/.auth-state.json' })
  await context.close()
})

// ─── All remaining tests use saved auth ─────────────────────────────────────

const authed = { storageState: 'tests/e2e/.auth-state.json' }

// ─── Public Pages (no auth needed) ──────────────────────────────────────────

test.describe('Marketing & Public Pages', () => {
  test('landing page loads with pricing', async ({ page }) => {
    await page.goto(BASE)
    await page.waitForLoadState('networkidle')
    const body = await page.textContent('body')
    expect(body).toMatch(/\$12/)
    expect(body).toMatch(/\$29/)
    expect(body).toMatch(/free/i)
  })

  test('about page loads', async ({ page }) => {
    const res = await page.goto(`${BASE}/about`)
    expect(res?.status()).toBeLessThan(400)
  })

  test('contact page loads', async ({ page }) => {
    const res = await page.goto(`${BASE}/contact`)
    expect(res?.status()).toBeLessThan(400)
  })

  test('privacy page loads', async ({ page }) => {
    const res = await page.goto(`${BASE}/privacy`)
    expect(res?.status()).toBeLessThan(400)
  })

  test('terms page loads', async ({ page }) => {
    const res = await page.goto(`${BASE}/terms`)
    expect(res?.status()).toBeLessThan(400)
  })

  test('knowledge base loads', async ({ page }) => {
    await page.goto(`${BASE}/kb`)
    await page.waitForLoadState('networkidle')
    const body = await page.textContent('body')
    expect(body).toMatch(/knowledge base|getting started/i)
  })

  test('unauthenticated /dashboard redirects to sign-in', async ({ page }) => {
    await page.goto(`${BASE}/dashboard`)
    await page.waitForTimeout(3000)
    expect(page.url()).toMatch(/sign-in|clerk/)
  })

  test('API returns 401 without token', async ({ request }) => {
    const res = await request.get(`${BASE}/api/v1/tasks`)
    expect(res.status()).toBe(401)
  })
})

// ─── Dashboard ──────────────────────────────────────────────────────────────

test.describe('Dashboard', () => {
  test.use(authed)

  test('dashboard loads', async ({ page }) => {
    await page.goto(`${BASE}/dashboard`)
    await page.waitForTimeout(4000)
    expect(page.url()).toContain('/dashboard')
    const body = await page.textContent('body')
    expect(body?.length).toBeGreaterThan(100)
  })

  test('activity rings render (SVG circles)', async ({ page }) => {
    await page.goto(`${BASE}/dashboard`)
    await page.waitForTimeout(4000)
    const circles = page.locator('svg circle')
    expect(await circles.count()).toBeGreaterThanOrEqual(3)
  })

  test('dashboard has key sections', async ({ page }) => {
    await page.goto(`${BASE}/dashboard`)
    await page.waitForTimeout(4000)
    const body = await page.textContent('body')
    expect(body).toMatch(/project|upcoming|health/i)
  })
})

// ─── Projects ───────────────────────────────────────────────────────────────

test.describe('Projects', () => {
  test.use(authed)

  test('projects page loads under 10s', async ({ page }) => {
    const start = Date.now()
    await page.goto(`${BASE}/projects`)
    await page.waitForLoadState('networkidle')
    expect(Date.now() - start).toBeLessThan(10000)
  })

  test('projects show health labels', async ({ page }) => {
    await page.goto(`${BASE}/projects`)
    await page.waitForTimeout(4000)
    const body = await page.textContent('body')
    expect(body).toMatch(/healthy|at risk|critical|completed|no projects/i)
  })

  test('can open a project and see tabs', async ({ page }) => {
    await page.goto(`${BASE}/projects`)
    await page.waitForTimeout(4000)
    const link = page.locator('a[href*="/projects/c"]').first()
    if (await link.count() > 0) {
      await link.click()
      await page.waitForTimeout(4000)
      expect(page.url()).toMatch(/\/projects\/c/)
      const body = await page.textContent('body')
      expect(body).toMatch(/tasks|bookmarks|time|files|team/i)
    }
  })
})

// ─── Tasks ──────────────────────────────────────────────────────────────────

test.describe('Tasks', () => {
  test.use(authed)

  test('tasks page loads', async ({ page }) => {
    await page.goto(`${BASE}/tasks`)
    await page.waitForTimeout(4000)
    expect(page.url()).toContain('/tasks')
  })

  test('Quick Add opens with N key', async ({ page }) => {
    await page.goto(`${BASE}/dashboard`)
    await page.waitForTimeout(4000)
    await page.keyboard.press('n')
    await page.waitForTimeout(500)
    const input = page.locator('input[placeholder*="What needs to be done"]')
    await expect(input).toBeVisible({ timeout: 3000 })
    await page.keyboard.press('Escape')
  })

  test('Cmd+K opens command bar', async ({ page }) => {
    await page.goto(`${BASE}/dashboard`)
    await page.waitForTimeout(4000)
    await page.keyboard.press('Meta+k')
    await page.waitForTimeout(500)
    const input = page.locator('input[placeholder*="Search"]')
    await expect(input).toBeVisible({ timeout: 3000 })
    await page.keyboard.press('Escape')
  })

  test('can open a task detail with comment section', async ({ page }) => {
    await page.goto(`${BASE}/tasks`)
    await page.waitForTimeout(4000)
    const link = page.locator('a[href*="/tasks/c"]').first()
    if (await link.count() > 0) {
      await link.click()
      await page.waitForTimeout(4000)
      const body = await page.textContent('body')
      expect(body).toMatch(/comment/i)
    }
  })
})

// ─── Clients ────────────────────────────────────────────────────────────────

test.describe('Clients', () => {
  test.use(authed)

  test('clients page loads', async ({ page }) => {
    await page.goto(`${BASE}/clients`)
    await page.waitForTimeout(4000)
    expect(page.url()).toContain('/clients')
  })
})

// ─── Invoices ───────────────────────────────────────────────────────────────

test.describe('Invoices', () => {
  test.use(authed)

  test('invoices page loads', async ({ page }) => {
    await page.goto(`${BASE}/invoices`)
    await page.waitForTimeout(4000)
    expect(page.url()).toContain('/invoices')
  })
})

// ─── Calendar ───────────────────────────────────────────────────────────────

test.describe('Calendar', () => {
  test.use(authed)

  test('calendar loads with current month', async ({ page }) => {
    await page.goto(`${BASE}/calendar`)
    await page.waitForTimeout(4000)
    const month = new Date().toLocaleString('default', { month: 'long' })
    const body = await page.textContent('body')
    expect(body).toContain(month)
  })
})

// ─── Bookmarks ──────────────────────────────────────────────────────────────

test.describe('Bookmarks', () => {
  test.use(authed)

  test('bookmarks page loads', async ({ page }) => {
    await page.goto(`${BASE}/bookmarks`)
    await page.waitForTimeout(4000)
    expect(page.url()).toContain('/bookmarks')
  })
})

// ─── Settings & Billing ─────────────────────────────────────────────────────

test.describe('Settings & Billing', () => {
  test.use(authed)

  test('settings page shows plan info', async ({ page }) => {
    await page.goto(`${BASE}/settings`)
    await page.waitForTimeout(4000)
    const body = await page.textContent('body')
    expect(body).toMatch(/free|pro|team|plan|billing/i)
  })

  test('settings shows integrations', async ({ page }) => {
    await page.goto(`${BASE}/settings`)
    await page.waitForTimeout(4000)
    await expect(page.locator('text=Telegram').first()).toBeVisible()
  })
})

// ─── Sidebar Navigation ────────────────────────────────────────────────────

test.describe('Sidebar Navigation', () => {
  test.use(authed)

  const routes = [
    '/dashboard', '/projects', '/tasks', '/clients',
    '/calendar', '/bookmarks', '/invoices', '/settings',
  ]

  for (const path of routes) {
    test(`${path} loads via direct navigation`, async ({ page }) => {
      await page.goto(`${BASE}${path}`)
      await page.waitForTimeout(4000)
      expect(page.url()).toContain(path)
      // Should NOT have redirected to sign-in
      expect(page.url()).not.toMatch(/sign-in|clerk/)
    })
  }
})
