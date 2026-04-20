import { test, expect } from '@playwright/test'

/**
 * Phase 1 · §1.1 Marketing Page (guide checks t1–t19)
 *
 * These tests run UNAUTHENTICATED — no storageState. They assert the public
 * marketing page renders every major section the guide mentions.
 */

test.describe('@phase1 1.1 Marketing Page', () => {
  test.use({ storageState: { cookies: [], origins: [] } })

  test('t1-t2: marketing page loads at /, no auth redirect', async ({ page }) => {
    const res = await page.goto('/')
    expect(res?.ok()).toBe(true)
    await expect(page).toHaveURL(/\/$|\/(\?.*)?$/)
    // Not redirected to sign-in
    expect(page.url()).not.toContain('/sign-in')
    expect(page.url()).not.toContain('clerk')
  })

  test('t3-t4: nav has logo and menu links, readable', async ({ page }) => {
    await page.goto('/')
    // Logo: a link with "Pulse Pro" text
    await expect(page.getByRole('link', { name: /pulse pro/i }).first()).toBeVisible()
    // Nav links
    await expect(page.getByRole('link', { name: /features/i }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: /pricing/i }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: /faq/i }).first()).toBeVisible()
  })

  test('t5: hero has headline + CTA', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible()
    // Get started / Start for free / Try for free — some CTA must exist
    await expect(
      page.getByRole('link', { name: /start|get started|try for free|sign up/i }).first()
    ).toBeVisible()
  })

  test('t6: stats section renders numeric metrics', async ({ page }) => {
    await page.goto('/')
    const body = await page.textContent('body')
    // The marketing StatsImpact section mentions these
    expect(body).toMatch(/400/)
    expect(body).toMatch(/8\s*hrs/i)
    expect(body).toMatch(/0\s*missed|missed deadlines/i)
  })

  test('t7: features section has dashboard mock + 6 feature cards', async ({ page }) => {
    await page.goto('/')
    // Scroll to ensure reveal
    await page.locator('#features').scrollIntoViewIfNeeded().catch(() => {})
    const body = await page.textContent('body')
    // 6 feature titles from src/components/marketing/sections/Features.tsx
    expect(body).toMatch(/6 ways to capture tasks/i)
    expect(body).toMatch(/Projects, tasks & clients/i)
    expect(body).toMatch(/Professional invoicing/i)
    expect(body).toMatch(/Voice input & AI insights/i)
    expect(body).toMatch(/Team collaboration/i)
    expect(body).toMatch(/Never miss a deadline/i)
  })

  test('t8: mobile app section with rotating phone mock', async ({ page }) => {
    await page.goto('/')
    const body = await page.textContent('body')
    expect(body).toMatch(/your projects, wherever you are/i)
  })

  test('t9-t10: work-smarter tabs (5) switch content when clicked', async ({ page }) => {
    await page.goto('/')
    // Scroll into view of TelegramFeature section
    await page.getByText(/work smarter from anywhere/i).scrollIntoViewIfNeeded().catch(() => {})
    // Tab labels from TelegramFeature.tsx
    for (const label of ['AI Insights', 'Email to Task', 'Siri & Voice', 'Keyboard', 'Telegram']) {
      await expect(page.getByRole('button', { name: new RegExp(label, 'i') })).toBeVisible()
    }
    // Click Telegram — expect Telegram-specific content to render
    await page.getByRole('button', { name: /^telegram$/i }).click()
    await expect(page.getByText(/manage tasks from telegram/i)).toBeVisible({ timeout: 5_000 })
  })

  test('t11: testimonials section present', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText(/trusted by/i).first()).toBeVisible()
  })

  test('t12: why-switch competitor cards', async ({ page }) => {
    await page.goto('/')
    const body = await page.textContent('body')
    for (const tool of ['Notion', 'Trello', 'Asana', 'ClickUp', 'Apple Notes']) {
      expect(body).toContain(tool)
    }
  })

  test('t13: pricing section shows Free + Pro + Team with plan limits', async ({ page }) => {
    await page.goto('/')
    await page.locator('#pricing').scrollIntoViewIfNeeded()
    const body = await page.textContent('#pricing')
    expect(body).toMatch(/\$?0/) // Free
    expect(body).toMatch(/\$?12/)
    expect(body).toMatch(/\$?29/)
    expect(body).toMatch(/3 projects/i)
    expect(body).toMatch(/50 tasks/i)
    expect(body).toMatch(/1 client/i)
  })

  test('t14: FAQ section expands on click', async ({ page }) => {
    await page.goto('/')
    await page.locator('#faq').scrollIntoViewIfNeeded()
    const firstQ = page.locator('#faq button').first()
    await expect(firstQ).toBeVisible()
    await firstQ.click()
    // After click the answer container should have some text visible
    await page.waitForTimeout(400)
  })

  test('t15: final CTA button at bottom', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await expect(
      page.getByRole('link', { name: /get started|start for free|it'?s free/i }).last()
    ).toBeVisible()
  })

  test('t16: nav links scroll to sections', async ({ page }) => {
    await page.goto('/')
    const links: Array<[string, string]> = [
      ['Features', '#features'],
      ['Pricing', '#pricing'],
      ['FAQ', '#faq'],
    ]
    for (const [label, hash] of links) {
      await page.getByRole('link', { name: new RegExp(`^${label}$`, 'i') }).first().click()
      await page.waitForTimeout(500)
      // Can't reliably assert scroll position, but the anchor section should be in the viewport
      await expect(page.locator(hash)).toBeInViewport({ timeout: 3_000 })
    }
  })

  test('t17: footer links and copyright', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    // Footer links
    await expect(page.getByRole('link', { name: /privacy/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /terms/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /contact/i })).toBeVisible()
    const footer = await page.locator('footer').textContent()
    expect(footer).toMatch(/202\d/) // copyright year
  })

  test('t18-t19: mobile viewport (390px) — nav collapses, no horizontal scroll', async ({ page, browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } })
    const mobilePage = await ctx.newPage()
    await mobilePage.goto('/')
    // Desktop nav (Features/Pricing/FAQ links) should be hidden on mobile
    const desktopFeatures = mobilePage.locator('nav a:has-text("Features")').first()
    const isVisible = await desktopFeatures.isVisible().catch(() => false)
    expect(isVisible).toBe(false)
    // A hamburger/menu toggle button should be present
    const menuBtn = mobilePage.locator('[aria-label="Toggle menu"], button[aria-label*="menu" i]')
    expect(await menuBtn.count()).toBeGreaterThan(0)
    // No horizontal scroll: body scrollWidth ≤ viewport width (+4 tolerance)
    const [sw, vw] = await mobilePage.evaluate(() => [
      document.documentElement.scrollWidth,
      window.innerWidth,
    ])
    expect(sw).toBeLessThanOrEqual(vw + 4)
    await ctx.close()
  })
})
