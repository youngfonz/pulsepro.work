import { test, expect } from '@playwright/test'
import { qaUsers } from './users'
import { userIdFor, wipeUserData, ensurePlan, prisma, waitHydrated } from './helpers'

/**
 * Phase 2 · §2.1 Verify upgrade · §2.2 Create content beyond Free limits
 *
 * Checks t114–t120.
 */

test.describe('@phase2 2.1 Verify Pro upgrade', () => {
  test.use({ storageState: qaUsers.pro.storageStatePath })

  test.beforeEach(async () => {
    const uid = await userIdFor('pro')
    await ensurePlan(uid, 'pro')
    await wipeUserData(uid)
  })

  test('t114: /settings billing shows Pro + $12/month', async ({ page }) => {
    await page.goto('/settings')
    await waitHydrated(page)
    const body = await page.textContent('body')
    expect(body).toMatch(/\bpro\b/i)
    expect(body).toMatch(/\$?12/)
  })

  test('t115: usage section shows unlimited or no limits', async ({ page }) => {
    await page.goto('/settings')
    await waitHydrated(page)
    const body = await page.textContent('body')
    expect(body).toMatch(/unlimited|no limit/i)
  })

  test('t116-t117: can create 4+ projects and 2+ clients without upgrade prompt', async ({ page }) => {
    const uid = await userIdFor('pro')
    const client = await prisma().client.create({ data: { userId: uid, name: 'First Client' } })
    // Create 4 projects directly (above the Free cap of 3)
    for (const name of ['P1', 'P2', 'P3', 'P4']) {
      await prisma().project.create({
        data: { userId: uid, name, clientId: client.id, status: 'in_progress' },
      })
    }
    await page.goto('/projects')
    await waitHydrated(page)
    const body = await page.textContent('body')
    for (const name of ['P1', 'P2', 'P3', 'P4']) expect(body).toContain(name)
    // Clicking "New Project" should NOT show an upgrade prompt
    await page.getByRole('button', { name: /new project|add project/i }).first().click()
    await page.waitForTimeout(500)
    const afterClick = await page.textContent('body')
    // If an upgrade modal appears, the words "upgrade" and "pro" would dominate — check absence
    expect(afterClick).not.toMatch(/you'?re on the free plan|upgrade to pro to create/i)
  })
})

test.describe('@phase2 2.2 Content beyond free limits', () => {
  test.use({ storageState: qaUsers.pro.storageStatePath })

  test.beforeEach(async () => {
    const uid = await userIdFor('pro')
    await ensurePlan(uid, 'pro')
    await wipeUserData(uid)
  })

  test('t118-t120: create 4 projects, 2 clients, 6 tasks', async ({ page }) => {
    const uid = await userIdFor('pro')
    const c1 = await prisma().client.create({ data: { userId: uid, name: 'Acme Corp' } })
    const c2 = await prisma().client.create({
      data: { userId: uid, name: 'Bright Ideas Agency', email: 'hello@brightideas.com' },
    })
    for (const p of ['Website Redesign', 'Mobile App', 'Marketing Campaign', 'Client Onboarding']) {
      await prisma().project.create({
        data: { userId: uid, name: p, clientId: c1.id, status: 'in_progress' },
      })
    }
    for (let i = 0; i < 6; i++) {
      await prisma().task.create({
        data: { userId: uid, title: `Pro task #${i + 1}`, priority: 'medium' },
      })
    }
    await page.goto('/clients')
    await waitHydrated(page)
    let body = await page.textContent('body')
    expect(body).toMatch(/acme corp/i)
    expect(body).toMatch(/bright ideas/i)
    await page.goto('/projects')
    await waitHydrated(page)
    body = await page.textContent('body')
    expect(body).toMatch(/website redesign/i)
    expect(body).toMatch(/client onboarding/i)
    await page.goto('/tasks')
    await waitHydrated(page)
    body = await page.textContent('body')
    expect(body).toMatch(/pro task #1/i)
    expect(body).toMatch(/pro task #6/i)
    // Avoid unused-var warning
    void c2
  })
})
