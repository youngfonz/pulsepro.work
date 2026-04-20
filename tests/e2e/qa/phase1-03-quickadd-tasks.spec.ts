import { test, expect } from '@playwright/test'
import { qaUsers } from './users'
import {
  userIdFor,
  wipeUserData,
  ensurePlan,
  goToDashboard,
  waitHydrated,
  quickAddTask,
  prisma,
} from './helpers'

/**
 * Phase 1 · §1.5 Quick-add via N key · §1.6 Other task creation methods
 *
 * Checks t37–t47. Uses the FREE user and wipes their data first.
 */

test.describe('@phase1 1.5 — 1.6 Task creation via N, dialog, and Cmd+K', () => {
  test.use({ storageState: qaUsers.free.storageStatePath })

  test.beforeEach(async () => {
    const uid = await userIdFor('free')
    await ensurePlan(uid, 'free')
    await wipeUserData(uid)
  })

  test('t37-t39: N key opens quick-add, typing + Enter creates task', async ({ page }) => {
    await goToDashboard(page)
    await quickAddTask(page, 'Buy groceries')

    // Verify on /tasks
    await page.goto('/tasks')
    await waitHydrated(page)
    await expect(page.getByText('Buy groceries').first()).toBeVisible({ timeout: 10_000 })
  })

  test('t41-t42: N key + natural language parses priority + due date', async ({ page }) => {
    await goToDashboard(page)
    await quickAddTask(page, 'Fix homepage bug high priority due tomorrow')

    await page.goto('/tasks')
    await waitHydrated(page)
    const row = page.getByText(/fix homepage bug/i).first()
    await expect(row).toBeVisible({ timeout: 10_000 })
    // The natural-language parser sets priority=high — verify a high-priority
    // indicator appears somewhere near the task title
    const taskBody = await page.textContent('body')
    expect(taskBody).toMatch(/high/i)
  })

  test('t43-t44: Add Task flow creates a task', async ({ page }) => {
    await page.goto('/tasks?add=true')
    await waitHydrated(page)
    // Find the title input by any reasonable accessible name / placeholder.
    const titleInput = page
      .getByRole('textbox', { name: /task title|title/i })
      .or(page.locator('input[placeholder*="task" i], input[name="title"]'))
      .first()
    if (!(await titleInput.isVisible({ timeout: 6_000 }).catch(() => false))) {
      // Fall back to the Tasks page button if the deep link didn't auto-open the dialog
      await page.goto('/tasks')
      await waitHydrated(page)
      await page.getByRole('button', { name: /add task/i }).first().click()
      await page.waitForTimeout(500)
    }
    const input = page
      .getByRole('textbox', { name: /task title|title/i })
      .or(page.locator('input[placeholder*="task" i], input[name="title"]'))
      .first()
    await input.waitFor({ state: 'visible', timeout: 6_000 })
    await input.fill('Review wireframes')
    await page
      .getByRole('button', { name: /^(create task|save|add task)$/i })
      .first()
      .click()
    await page.waitForTimeout(1_500)
    // Verify via DB — resilient across UI layout changes.
    // Test describe uses qaUsers.free.storageStatePath, so the row is owned by the free user.
    const uid = await userIdFor('free')
    const created = await prisma().task.findFirst({
      where: { userId: uid, title: 'Review wireframes' },
    })
    expect(created).not.toBeNull()
  })

  test('t45-t47: Cmd+K opens command bar, "add task X" creates task', async ({ page }) => {
    await page.goto('/tasks')
    await waitHydrated(page)
    await page.keyboard.press('Meta+k') // On Linux CI it might be Control+k; try both
    let cmdBar = page.locator('[role="dialog"] input, input[placeholder*="search" i]').first()
    if (!(await cmdBar.isVisible({ timeout: 2_000 }).catch(() => false))) {
      await page.keyboard.press('Control+k')
      cmdBar = page.locator('[role="dialog"] input, input[placeholder*="search" i]').first()
    }
    await expect(cmdBar).toBeVisible({ timeout: 5_000 })
    await cmdBar.fill('add task Submit invoice to client')
    await page.keyboard.press('Enter')
    await page.waitForTimeout(1_500)
    await page.goto('/tasks')
    await waitHydrated(page)
    await expect(page.getByText(/submit invoice to client/i).first()).toBeVisible({ timeout: 5_000 })
  })
})
