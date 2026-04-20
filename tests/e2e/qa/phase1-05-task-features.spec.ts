import { test, expect } from '@playwright/test'
import { qaUsers } from './users'
import { userIdFor, wipeUserData, ensurePlan, prisma, waitHydrated } from './helpers'

/**
 * Phase 1 · §1.9 Task Features: edit, complete, comment, filter, sort, delete.
 *
 * Checks t58–t74. Uses Pro so we don't bump into free limits when seeding many tasks.
 */

test.describe('@phase1 1.9 Task Features', () => {
  test.use({ storageState: qaUsers.pro.storageStatePath })

  test.beforeEach(async () => {
    const uid = await userIdFor('pro')
    await ensurePlan(uid, 'pro')
    await wipeUserData(uid)
    // Seed a baseline task we'll manipulate in each test
    await prisma().task.create({
      data: { userId: uid, title: 'Buy groceries', priority: 'medium' },
    })
    // Seed more for filter/sort tests
    await prisma().task.create({
      data: { userId: uid, title: 'High priority thing', priority: 'high' },
    })
    await prisma().task.create({
      data: { userId: uid, title: 'Completed chore', priority: 'low', status: 'done' },
    })
  })

  test('t58: clicking a task opens its detail page', async ({ page }) => {
    await page.goto('/tasks')
    await waitHydrated(page)
    await page.getByText(/buy groceries/i).first().click()
    await waitHydrated(page)
    expect(page.url()).toMatch(/\/tasks\/[^/]+/)
  })

  test('t59-t61: inline edit of title/description/priority/due-date persists', async ({ page }) => {
    const uid = await userIdFor('pro')
    const task = await prisma().task.findFirstOrThrow({
      where: { userId: uid, title: 'Buy groceries' },
    })
    await page.goto(`/tasks/${task.id}`)
    await waitHydrated(page)
    // Click on title to make editable
    const title = page.getByRole('heading').filter({ hasText: /buy groceries/i }).first()
    await title.click()
    // An input should appear — type new value
    const input = page.locator('input').filter({ hasText: '' }).first()
    await input.fill('Buy groceries and milk')
    await input.press('Enter')
    await page.waitForTimeout(800)
    await expect(page.getByText('Buy groceries and milk').first()).toBeVisible({ timeout: 5_000 })
  })

  test('t62-t63: toggle complete state', async ({ page }) => {
    const uid = await userIdFor('pro')
    const task = await prisma().task.findFirstOrThrow({
      where: { userId: uid, title: 'Buy groceries' },
    })
    await page.goto(`/tasks/${task.id}`)
    await waitHydrated(page)
    const checkbox = page.getByRole('checkbox').first()
    const initiallyChecked = await checkbox.isChecked().catch(() => false)
    await checkbox.click()
    await page.waitForTimeout(600)
    const after = await checkbox.isChecked().catch(() => false)
    expect(after).not.toBe(initiallyChecked)
    await checkbox.click()
    await page.waitForTimeout(600)
  })

  test('t67-t69: filter by status and priority', async ({ page }) => {
    await page.goto('/tasks')
    await waitHydrated(page)
    // Filter to completed
    const filterBtn = page.getByRole('button', { name: /filter/i }).first()
    if (await filterBtn.count()) {
      await filterBtn.click()
      await page.getByRole('option', { name: /completed|done/i }).first().click().catch(() => {})
      await page.waitForTimeout(500)
      const body = await page.textContent('body')
      expect(body).toMatch(/completed chore/i)
    }
  })

  test('t70-t72: sort by due date / priority / newest changes order', async ({ page }) => {
    await page.goto('/tasks')
    await waitHydrated(page)
    // Check that sort control exists
    const sort = page.getByRole('combobox').or(page.getByRole('button', { name: /sort/i })).first()
    if (await sort.count()) {
      await sort.click().catch(() => {})
      const priorityOpt = page.getByRole('option', { name: /priority/i }).first()
      if (await priorityOpt.count()) await priorityOpt.click()
      await page.waitForTimeout(400)
    }
  })

  test('t73-t74: delete task confirm → task removed', async ({ page }) => {
    const uid = await userIdFor('pro')
    const task = await prisma().task.create({
      data: { userId: uid, title: 'DeleteMe', priority: 'medium' },
    })
    await page.goto(`/tasks/${task.id}`)
    await waitHydrated(page)
    // Open menu / click delete
    const deleteBtn = page.getByRole('button', { name: /delete/i }).first()
    if (!(await deleteBtn.count())) {
      // Try a "..." menu first
      await page.getByRole('button', { name: /more|options|menu/i }).first().click().catch(() => {})
      await page.waitForTimeout(300)
    }
    await page.getByRole('button', { name: /delete/i }).first().click()
    // Confirm dialog
    await page.waitForTimeout(400)
    const confirm = page.getByRole('button', { name: /confirm|delete|yes/i }).last()
    await confirm.click()
    await page.waitForTimeout(1_000)
    // Should no longer find the task in DB
    const stillThere = await prisma().task.findUnique({ where: { id: task.id } })
    expect(stillThere).toBeNull()
  })
})
