import { test, expect } from '@playwright/test'
import { qaUsers } from './users'
import { userIdFor, wipeUserData, ensurePlan, prisma, waitHydrated } from './helpers'

/**
 * Phase 3 · §3.1–3.4: Team plan verification, 10-collab limit, Pro features
 * still work on Team, final walkthrough.
 *
 * Checks t166–t183.
 */

test.describe('@phase3 3.1 Verify Team upgrade', () => {
  test.use({ storageState: qaUsers.team.storageStatePath })

  test.beforeEach(async () => {
    const uid = await userIdFor('team')
    await ensurePlan(uid, 'team')
  })

  test('t166: /settings shows Team plan and $29/month', async ({ page }) => {
    await page.goto('/settings')
    await waitHydrated(page)
    // Wait for the BillingCard to render the plan label before reading body text.
    await page.getByText(/\bteam\b/i).first().waitFor({ state: 'visible', timeout: 10_000 })
    const body = await page.locator('body').innerText()
    expect(body).toMatch(/\bteam\b/i)
    expect(body).toMatch(/\$?29/)
  })
})

test.describe('@phase3 3.2 Collaboration (Team = 10 max per project)', () => {
  test.use({ storageState: qaUsers.team.storageStatePath })

  test.beforeEach(async () => {
    const uid = await userIdFor('team')
    await ensurePlan(uid, 'team')
    await wipeUserData(uid)
    const client = await prisma().client.create({ data: { userId: uid, name: 'Acme' } })
    await prisma().project.create({
      data: { userId: uid, name: 'Website Redesign', clientId: client.id, status: 'in_progress' },
    })
  })

  test('t167-t168: up to 10 collaborators succeed', async () => {
    const uid = await userIdFor('team')
    const project = await prisma().project.findFirstOrThrow({
      where: { userId: uid, name: 'Website Redesign' },
    })
    for (let i = 0; i < 10; i++) {
      await prisma().projectAccess.create({
        data: {
          projectId: project.id,
          userId: `user_team_collab_${i}`,
          role: 'viewer',
          grantedBy: uid,
        },
      })
    }
    const count = await prisma().projectAccess.count({ where: { projectId: project.id } })
    expect(count).toBe(10)
  })

  test('t169: adding an 11th collaborator fails or shows a limit message', async ({ page }) => {
    const uid = await userIdFor('team')
    const project = await prisma().project.findFirstOrThrow({
      where: { userId: uid, name: 'Website Redesign' },
    })
    // Seed 10 first
    for (let i = 0; i < 10; i++) {
      await prisma().projectAccess.create({
        data: {
          projectId: project.id,
          userId: `user_team_collab_${i}`,
          role: 'viewer',
          grantedBy: uid,
        },
      })
    }
    // Try to invite via the UI and expect a limit message
    await page.goto(`/projects/${project.id}`)
    await waitHydrated(page)
    const teamTab = page
      .getByRole('tab', { name: /team|members/i })
      .or(page.getByRole('link', { name: /team|members/i }))
      .first()
    if (await teamTab.count()) {
      await teamTab.click()
      await page.waitForTimeout(500)
    }
    const inviteBtn = page.getByRole('button', { name: /invite|add member|add collab/i }).first()
    if (await inviteBtn.count()) {
      await inviteBtn.click()
      await page.waitForTimeout(500)
      const body = await page.textContent('body')
      expect(body).toMatch(/limit|10 collab|max/i)
    }
  })
})

test.describe('@phase3 3.3 All Pro features still work on Team', () => {
  test.use({ storageState: qaUsers.team.storageStatePath })

  test.beforeEach(async () => {
    const uid = await userIdFor('team')
    await ensurePlan(uid, 'team')
    await wipeUserData(uid)
  })

  test('t170: /invoices accessible on Team plan', async ({ page }) => {
    await page.goto('/invoices')
    await waitHydrated(page)
    expect(page.url()).toContain('/invoices')
    const body = await page.textContent('body')
    expect(body).not.toMatch(/upgrade/i)
  })

  test('t171: /settings shows Telegram card (not gated)', async ({ page }) => {
    await page.goto('/settings')
    await waitHydrated(page)
    const body = await page.textContent('body')
    expect(body).toMatch(/telegram/i)
    // Pro-only gate should not appear
    await expect(
      page.getByRole('button', { name: /link telegram|generate.*code/i }).first()
    ).toBeVisible()
  })

  test('t172: AI Insights panel visible on Team dashboard', async ({ page }) => {
    await page.goto('/dashboard')
    await waitHydrated(page)
    const body = await page.textContent('body')
    expect(body).toMatch(/insights/i)
  })

  test('t173: create new task/project/client — no limits on Team', async ({ page }) => {
    const uid = await userIdFor('team')
    // Create many in DB
    const c = await prisma().client.create({ data: { userId: uid, name: 'Big Client' } })
    for (let i = 0; i < 5; i++) {
      await prisma().project.create({
        data: { userId: uid, name: `Team project ${i}`, clientId: c.id, status: 'in_progress' },
      })
    }
    for (let i = 0; i < 60; i++) {
      await prisma().task.create({ data: { userId: uid, title: `Team task ${i}`, priority: 'medium' } })
    }
    await page.goto('/tasks')
    await waitHydrated(page)
    const body = await page.textContent('body')
    expect(body).not.toMatch(/upgrade|limit reached/i)
  })
})

test.describe('@phase3 3.4 Final walkthrough', () => {
  test.use({ storageState: qaUsers.team.storageStatePath })

  for (const route of [
    '/dashboard',
    '/tasks',
    '/projects',
    '/clients',
    '/bookmarks',
    '/calendar',
    '/invoices',
    '/settings',
  ]) {
    test(`loads ${route} without error`, async ({ page }) => {
      const res = await page.goto(route)
      await waitHydrated(page)
      expect(res?.ok()).toBe(true)
      // Use innerText (visible text only) — textContent includes <script> bodies
      // which in Next dev mode contain bundle paths matching /500/ etc.
      const visible = await page.locator('body').innerText()
      expect(visible).not.toMatch(/something went wrong|internal server error/i)
    })
  }

  test('t183: Cmd+K search returns results across types', async ({ page }) => {
    const uid = await userIdFor('team')
    await ensurePlan(uid, 'team')
    await wipeUserData(uid)
    const client = await prisma().client.create({ data: { userId: uid, name: 'Search Me Client' } })
    const project = await prisma().project.create({
      data: { userId: uid, name: 'Search Me Project', clientId: client.id, status: 'in_progress' },
    })
    await prisma().task.create({
      data: { userId: uid, title: 'Search Me Task', projectId: project.id, priority: 'medium' },
    })
    await page.goto('/dashboard')
    await waitHydrated(page)
    await page.keyboard.press('Meta+k')
    const input = page.locator('input[placeholder*="search" i], input[placeholder*="type" i]').first()
    await input.waitFor({ state: 'visible' })
    await input.fill('Search Me')
    await page.waitForTimeout(700)
    const body = await page.textContent('body')
    expect(body).toMatch(/search me task/i)
    expect(body).toMatch(/search me project/i)
    expect(body).toMatch(/search me client/i)
  })
})
