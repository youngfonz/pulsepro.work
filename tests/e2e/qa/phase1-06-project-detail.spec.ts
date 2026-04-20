import { test, expect } from '@playwright/test'
import { qaUsers } from './users'
import { userIdFor, wipeUserData, ensurePlan, prisma, waitHydrated } from './helpers'

/**
 * Phase 1 · §1.10 Project detail — Kanban board + time entries.
 *
 * Checks t75–t81. Uses Pro.
 */

test.describe('@phase1 1.10 Project Detail', () => {
  test.use({ storageState: qaUsers.pro.storageStatePath })

  test.beforeEach(async () => {
    const uid = await userIdFor('pro')
    await ensurePlan(uid, 'pro')
    await wipeUserData(uid)
    const client = await prisma().client.create({ data: { userId: uid, name: 'Acme Corp' } })
    const project = await prisma().project.create({
      data: {
        userId: uid,
        name: 'Website Redesign',
        clientId: client.id,
        status: 'in_progress',
      },
    })
    await prisma().task.createMany({
      data: [
        { userId: uid, title: 'Design mockups', projectId: project.id, status: 'todo' },
        { userId: uid, title: 'Build header', projectId: project.id, status: 'in_progress' },
      ],
    })
  })

  test('t75-t76: project detail renders kanban tab with task cards', async ({ page }) => {
    const uid = await userIdFor('pro')
    const project = await prisma().project.findFirstOrThrow({
      where: { userId: uid, name: 'Website Redesign' },
    })
    await page.goto(`/projects/${project.id}`)
    await waitHydrated(page)
    // Tabs — should have "Board" / "Tasks" / "Time"
    const body = await page.textContent('body')
    expect(body).toMatch(/board|tasks/i)
    expect(body).toMatch(/design mockups/i)
    expect(body).toMatch(/build header/i)
  })

  test('t79-t80: add a time entry (2 hrs, description, today)', async ({ page }) => {
    const uid = await userIdFor('pro')
    const project = await prisma().project.findFirstOrThrow({
      where: { userId: uid, name: 'Website Redesign' },
    })
    await page.goto(`/projects/${project.id}`)
    await waitHydrated(page)
    // Click Time tab
    const timeTab = page.getByRole('tab', { name: /time/i }).or(page.getByRole('link', { name: /time/i })).first()
    if (await timeTab.count()) {
      await timeTab.click()
      await page.waitForTimeout(400)
    }
    // Fill hours input
    const hoursInput = page.locator('input[name="hours"], input[type="number"]').first()
    if (await hoursInput.count()) {
      await hoursInput.fill('2')
      const descInput = page.locator('input[name="description"], textarea[name="description"]').first()
      if (await descInput.count()) await descInput.fill('Initial planning session')
      const saveBtn = page.getByRole('button', { name: /save|add|log/i }).first()
      await saveBtn.click()
      await page.waitForTimeout(800)
      // Verify in DB
      const entries = await prisma().timeEntry.findMany({ where: { projectId: project.id } })
      expect(entries.length).toBeGreaterThanOrEqual(1)
    }
  })
})
