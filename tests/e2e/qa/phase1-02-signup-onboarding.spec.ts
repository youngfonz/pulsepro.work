import { test, expect } from '@playwright/test'
import { qaUsers } from './users'
import { goToDashboard, waitHydrated, userIdFor } from './helpers'

/**
 * Phase 1 · §1.2–1.4: post-signup redirect, onboarding overlay, empty dashboard.
 *
 * We already signed up all users in global-setup. These tests confirm the
 * landing-on-dashboard behavior and the empty-state dashboard render.
 */

test.describe('@phase1 1.2 Sign Up redirect', () => {
  test.use({ storageState: qaUsers.free.storageStatePath })

  test('t24: after sign-up, lands on /dashboard (verified via logged-in state)', async ({ page }) => {
    await goToDashboard(page)
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('t21: /sign-up renders the form (logged-out view)', async ({ browser }) => {
    const ctx = await browser.newContext({ storageState: { cookies: [], origins: [] } })
    const page = await ctx.newPage()
    const res = await page.goto('/sign-up')
    expect(res?.ok()).toBe(true)
    // Clerk sign-up form field
    await expect(page.locator('input[name="emailAddress"], input[type="email"]').first()).toBeVisible({ timeout: 10_000 })
    // No horizontal scrollbar
    const [sw, vw] = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth])
    expect(sw).toBeLessThanOrEqual(vw + 4)
    await ctx.close()
  })
})

test.describe('@phase1 1.3 Onboarding Overlay', () => {
  // This spec needs a FRESH session — onboarding appears on first dashboard visit.
  // Hard to guarantee "first visit" after global-setup already loaded /dashboard.
  // Covering what we can and skipping the rest with a clear reason.

  test.use({ storageState: qaUsers.free.storageStatePath })

  test('t32: onboarding does NOT re-appear on subsequent visits', async ({ page }) => {
    await goToDashboard(page)
    await page.reload()
    await waitHydrated(page)
    // The onboarding overlay (first-run) has a specific heading; ensure it's NOT showing.
    const onboardingHeading = page.getByText(/add your first task/i)
    const isShowing = await onboardingHeading.isVisible({ timeout: 2_000 }).catch(() => false)
    expect(isShowing).toBe(false)
  })

  test('t26-t31: full onboarding overlay flow — appears, advances 4 steps, dismisses', async ({ page }) => {
    const uid = await userIdFor('free')
    const storageKey = `pulse-onboarding-complete-${uid}`

    // Wipe the localStorage flag BEFORE the page loads so the overlay's
    // useEffect sees no completion record on its first read.
    await page.addInitScript((key) => {
      window.localStorage.removeItem(key)
    }, storageKey)

    await page.goto('/dashboard')
    await waitHydrated(page)

    // t26: overlay appears (modal with backdrop + centered card)
    const step1Heading = page.getByRole('heading', { name: /add your first task/i })
    await expect(step1Heading).toBeVisible({ timeout: 5_000 })

    // t27: Step 1 — title + Continue button visible
    await expect(page.getByRole('button', { name: /^continue$/i })).toBeVisible()
    await page.getByRole('button', { name: /^continue$/i }).click()

    // t28: Step 2 — "Organize when you're ready"
    await expect(page.getByRole('heading', { name: /organize when you/i })).toBeVisible({ timeout: 3_000 })
    await page.getByRole('button', { name: /^continue$/i }).click()

    // t29: Step 3 — "Shortcuts that save time"
    await expect(page.getByRole('heading', { name: /shortcuts that save time/i })).toBeVisible({ timeout: 3_000 })
    await page.getByRole('button', { name: /^continue$/i }).click()

    // t30: Step 4 — "You're all set" + button text changes to "Get started"
    await expect(page.getByRole('heading', { name: /you.{1,3}re all set/i })).toBeVisible({ timeout: 3_000 })
    const getStarted = page.getByRole('button', { name: /^get started$/i })
    await expect(getStarted).toBeVisible()

    // t31: clicking Get started dismisses the overlay
    await getStarted.click()
    await expect(step1Heading).toBeHidden({ timeout: 3_000 })
    // localStorage flag now persisted
    const flag = await page.evaluate((k) => window.localStorage.getItem(k), storageKey)
    expect(flag).toBe('true')
  })
})

test.describe('@phase1 1.4 Dashboard Empty State', () => {
  // Use a dedicated "free" user after wiping their data so counts are 0.
  test.use({ storageState: qaUsers.free.storageStatePath })

  test('t33: dashboard shows greeting', async ({ page }) => {
    await goToDashboard(page)
    await expect(page.getByText(/good (morning|afternoon|evening)/i).first()).toBeVisible()
  })

  test('t34-t36: no errors, dashboard cards render', async ({ page }) => {
    await goToDashboard(page)
    await expect(page.getByRole('heading', { name: /good (morning|afternoon|evening)/i })).toBeVisible({
      timeout: 10_000,
    })
    // Friendly error text should NOT be in the DOM (auto-retry via Playwright expect)
    await expect(page.getByText(/something went wrong/i)).toHaveCount(0)
    // Dashboard labels
    await expect(page.getByText(/active projects/i).first()).toBeVisible()
    await expect(page.getByText(/tasks done/i).first()).toBeVisible()
  })
})
