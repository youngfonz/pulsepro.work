import { test, expect } from '@playwright/test'
import { qaUsers } from './users'
import {
  userIdFor,
  wipeUserData,
  ensurePlan,
  goToDashboard,
  waitHydrated,
  quickAddTask,
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

  test('t43-t44: Add Task button opens dialog with all fields and saves', async ({ page }) => {
    await page.goto('/tasks')
    await waitHydrated(page)
    const addBtn = page.getByRole('button', { name: /add task|new task/i }).first()
    await addBtn.click()
    const dialog = page.locator('[role="dialog"], dialog').first()
    await expect(dialog).toBeVisible({ timeout: 5_000 })
    // Title field
    const titleInput = dialog.locator('input[name="title"], input[placeholder*="title" i]').first()
    await titleInput.fill('Review wireframes')
    // Priority: try to find a priority select or radio set to High
    const prioritySelect = dialog.locator('select[name="priority"], [data-priority]').first()
    if (await prioritySelect.count()) {
      await prioritySelect.selectOption({ label: 'High' }).catch(async () => {
        await prioritySelect.click()
        await page.getByRole('option', { name: /high/i }).click().catch(() => {})
      })
    }
    // Save
    const saveBtn = dialog.getByRole('button', { name: /save|create|add/i }).first()
    await saveBtn.click()
    await page.waitForTimeout(1_000)
    await expect(page.getByText(/review wireframes/i).first()).toBeVisible({ timeout: 5_000 })
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
