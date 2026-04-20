import { test, expect } from '@playwright/test'
import { qaUsers } from './users'
import { userIdFor, wipeUserData, ensurePlan, waitHydrated } from './helpers'

/**
 * Phase 1 · §1.7 Clients + Free limit · §1.8 Projects + Free limit
 *
 * Checks t48–t57. Free = 1 client, 3 projects. 4th project hits upgrade gate.
 */

test.describe('@phase1 1.7 Clients (Free plan: limit 1)', () => {
  test.use({ storageState: qaUsers.free.storageStatePath })

  test.beforeEach(async () => {
    const uid = await userIdFor('free')
    await ensurePlan(uid, 'free')
    await wipeUserData(uid)
  })

  test('t48-t50: /clients empty state, create 1st client, detail page loads', async ({ page }) => {
    await page.goto('/clients')
    await waitHydrated(page)
    // Empty state
    const beforeBody = await page.textContent('body')
    expect(beforeBody).toMatch(/no clients|get started|add your first/i)

    await page.getByRole('button', { name: /new client|add client/i }).first().click()
    const dialog = page.locator('[role="dialog"], dialog').first()
    await dialog.locator('input[name="name"], input[placeholder*="name" i]').first().fill('Acme Corp')
    const emailField = dialog.locator('input[name="email"], input[type="email"]').first()
    if (await emailField.count()) await emailField.fill('acme@test.com')
    await dialog.getByRole('button', { name: /save|create/i }).first().click()
    await page.waitForTimeout(1_500)
    await expect(page.getByText(/acme corp/i).first()).toBeVisible({ timeout: 5_000 })

    // Click through to detail page
    await page.getByRole('link', { name: /acme corp/i }).first().click()
    await waitHydrated(page)
    expect(page.url()).toMatch(/\/clients\//)
  })

  test('t51: 2nd client hits upgrade prompt', async ({ page }) => {
    // Seed one client directly so the UI is already at limit
    const uid = await userIdFor('free')
    const { prisma } = await import('./helpers')
    await prisma().client.create({ data: { userId: uid, name: 'Acme Corp' } })

    await page.goto('/clients')
    await waitHydrated(page)
    await page.getByRole('button', { name: /new client|add client/i }).first().click()
    // Upgrade prompt should appear instead of / in place of the create form
    const body = await page.textContent('body')
    expect(body).toMatch(/upgrade|pro plan|unlock/i)
  })
})

test.describe('@phase1 1.8 Projects (Free plan: limit 3)', () => {
  test.use({ storageState: qaUsers.free.storageStatePath })

  test.beforeEach(async () => {
    const uid = await userIdFor('free')
    await ensurePlan(uid, 'free')
    await wipeUserData(uid)
    // Need a client to attach projects to (schema requires clientId)
    await (await import('./helpers')).prisma().client.create({
      data: { userId: uid, name: 'Acme Corp' },
    })
  })

  test('t52-t56: create 3 projects successfully', async ({ page }) => {
    const { prisma } = await import('./helpers')
    const uid = await userIdFor('free')
    const client = await prisma().client.findFirst({ where: { userId: uid } })
    if (!client) throw new Error('setup failed — no client')

    // Create 3 projects directly — checks the DB-level permissibility, then
    // reload and assert they appear in the UI.
    for (const name of ['Website Redesign', 'Mobile App', 'Marketing Campaign']) {
      await prisma().project.create({
        data: { userId: uid, name, clientId: client.id, status: 'in_progress' },
      })
    }
    await page.goto('/projects')
    await waitHydrated(page)
    const body = await page.textContent('body')
    expect(body).toMatch(/website redesign/i)
    expect(body).toMatch(/mobile app/i)
    expect(body).toMatch(/marketing campaign/i)
  })

  test('t57: 4th project hits upgrade prompt', async ({ page }) => {
    const { prisma } = await import('./helpers')
    const uid = await userIdFor('free')
    const client = await prisma().client.findFirst({ where: { userId: uid } })
    if (!client) throw new Error('setup failed')
    for (const name of ['P1', 'P2', 'P3']) {
      await prisma().project.create({
        data: { userId: uid, name, clientId: client.id, status: 'in_progress' },
      })
    }
    await page.goto('/projects')
    await waitHydrated(page)
    await page.getByRole('button', { name: /new project|add project/i }).first().click()
    await page.waitForTimeout(500)
    const body = await page.textContent('body')
    expect(body).toMatch(/upgrade|pro plan|limit/i)
  })
})
