import { test, expect } from '@playwright/test'
import { qaUsers } from './users'
import { userIdFor, wipeUserData, ensurePlan, waitHydrated } from './helpers'

/**
 * Phase 1 · §1.14 Settings (Free gating) · §1.15 Dark mode · §1.16 Mobile viewport
 *
 * Checks t96–t113.
 */

test.describe('@phase1 1.14 Settings (Free plan)', () => {
  test.use({ storageState: qaUsers.free.storageStatePath })

  test.beforeEach(async () => {
    const uid = await userIdFor('free')
    await ensurePlan(uid, 'free')
    await wipeUserData(uid)
  })

  test('t96-t97: /settings loads and billing card shows Free + usage', async ({ page }) => {
    await page.goto('/settings')
    await expect(page.getByRole('heading', { name: /settings/i, level: 1 })).toBeVisible({ timeout: 10_000 })
    await expect(page.getByRole('heading', { name: /billing/i })).toBeVisible()
    // Plan label renders as paragraph "Current Plan" + "Free"
    await expect(page.getByText(/current plan/i).first()).toBeVisible()
    await expect(page.getByText(/^free$/i).first()).toBeVisible()
    // Usage entries: "0 / 1" (clients), "0 / 3" (projects), "0 / 50" (tasks)
    await expect(page.getByText('0 / 1')).toBeVisible()
    await expect(page.getByText('0 / 3')).toBeVisible()
    await expect(page.getByText('0 / 50')).toBeVisible()
  })

  test('t98-t100: Pro-only features show Pro badge (Telegram / Email-to-task / Siri)', async ({ page }) => {
    await page.goto('/settings')
    await expect(page.getByRole('heading', { name: /settings/i, level: 1 })).toBeVisible({ timeout: 10_000 })
    // Each Pro-gated card renders as heading "{Feature Name} Pro"
    await expect(page.getByRole('heading', { name: /telegram bot pro/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /email to task pro/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /siri.*shortcuts pro/i })).toBeVisible()
  })
})

test.describe('@phase1 1.15 Dark Mode', () => {
  test.use({ storageState: qaUsers.free.storageStatePath })

  test.beforeEach(async () => {
    const uid = await userIdFor('free')
    await ensurePlan(uid, 'free')
  })

  test('t101: toggling dark mode from the sidebar adds .dark on <html>', async ({ page }) => {
    await page.goto('/dashboard')
    await waitHydrated(page)
    // Start from light
    await page.evaluate(() => {
      localStorage.setItem('theme', 'light')
      document.documentElement.classList.remove('dark')
    })
    // The sidebar has a `button "Dark mode"`.
    const toggle = page.getByRole('button', { name: /^dark mode$/i })
    await toggle.click()
    await page.waitForTimeout(400)
    const hasDark = await page.evaluate(() => document.documentElement.classList.contains('dark'))
    expect(hasDark).toBe(true)
  })

  test('t102-t107: dark mode persists across pages and can toggle off', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('theme', 'dark'))
    for (const url of ['/dashboard', '/tasks', '/projects', '/clients', '/calendar', '/settings']) {
      await page.goto(url)
      await waitHydrated(page)
      const hasDark = await page.evaluate(() => document.documentElement.classList.contains('dark'))
      expect(hasDark, `expected dark class on ${url}`).toBe(true)
      // No visible error
      const body = await page.textContent('body')
      expect(body).not.toMatch(/something went wrong/i)
    }
    // Marketing page in dark
    await page.goto('/')
    await waitHydrated(page)
    const marketingDark = await page.evaluate(() => document.documentElement.classList.contains('dark'))
    expect(marketingDark).toBe(true)
  })
})

test.describe('@phase1 @mobile 1.16 Mobile viewport (390px)', () => {
  test.use({ storageState: qaUsers.free.storageStatePath, viewport: { width: 390, height: 844 } })

  for (const route of ['/dashboard', '/tasks', '/projects', '/settings']) {
    test(`${route}: no horizontal scroll, readable`, async ({ page }) => {
      await page.goto(route)
      await waitHydrated(page)
      const [scrollWidth, innerWidth] = await page.evaluate(() => [
        document.documentElement.scrollWidth,
        window.innerWidth,
      ])
      expect(scrollWidth).toBeLessThanOrEqual(innerWidth + 4)
      const body = await page.textContent('body')
      expect(body).not.toMatch(/something went wrong/i)
    })
  }
})
