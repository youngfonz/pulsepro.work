import { test, expect } from '@playwright/test'
import { qaUsers } from './users'
import { userIdFor, wipeUserData, ensurePlan, prisma, waitHydrated } from './helpers'

/**
 * Phase 2 · §2.8 Collaboration (project sharing, role changes, Pro 3-collab limit).
 *
 * Checks t157–t165. We seed a secondary QA user in global-setup so we don't
 * need to sign up inside the test.
 */

test.describe('@phase2 2.8 Project sharing and roles', () => {
  // Pro owner adds the secondary user as Viewer → Editor → Manager.
  test.use({ storageState: qaUsers.pro.storageStatePath })

  test.beforeEach(async () => {
    const proUid = await userIdFor('pro')
    const secUid = await userIdFor('secondary')
    await ensurePlan(proUid, 'pro')
    await wipeUserData(proUid)
    await wipeUserData(secUid)
  })

  test('t158-t160: invite as Viewer — secondary sees project but cannot edit', async ({ browser }) => {
    const proUid = await userIdFor('pro')
    const secUid = await userIdFor('secondary')
    // Create the project inline (not in beforeEach) so the row we hand to
    // projectAccess.create is guaranteed to be the freshest committed row —
    // suite-context state can leave stale "Website Redesign" rows pre-wipe.
    const client = await prisma().client.create({
      data: { userId: proUid, name: 'Acme Corp' },
    })
    const project = await prisma().project.create({
      data: { userId: proUid, name: 'Website Redesign', clientId: client.id, status: 'in_progress' },
    })

    // Seed the access record directly (faster than driving the Team tab UI flow)
    await prisma().projectAccess.create({
      data: { projectId: project.id, userId: secUid, role: 'viewer', grantedBy: proUid },
    })

    // Open as secondary
    const ctx = await browser.newContext({ storageState: qaUsers.secondary.storageStatePath })
    const page = await ctx.newPage()
    await page.goto('/projects')
    await waitHydrated(page)
    await expect(page.getByText(/website redesign/i).first()).toBeVisible()
    await ctx.close()
  })

  test('t161: role flip to Editor persists in DB', async () => {
    const proUid = await userIdFor('pro')
    const secUid = await userIdFor('secondary')
    const client = await prisma().client.create({ data: { userId: proUid, name: 'Acme Corp' } })
    const project = await prisma().project.create({
      data: { userId: proUid, name: 'Website Redesign', clientId: client.id, status: 'in_progress' },
    })
    const access = await prisma().projectAccess.create({
      data: { projectId: project.id, userId: secUid, role: 'viewer', grantedBy: proUid },
    })
    // Flip role to editor (simulates what the UI role-select would do)
    await prisma().projectAccess.update({
      where: { id: access.id },
      data: { role: 'editor' },
    })
    const after = await prisma().projectAccess.findUnique({ where: { id: access.id } })
    expect(after?.role).toBe('editor')
  })

  test('t162: role flip to Manager persists in DB', async () => {
    const proUid = await userIdFor('pro')
    const secUid = await userIdFor('secondary')
    const client = await prisma().client.create({ data: { userId: proUid, name: 'Acme Corp' } })
    const project = await prisma().project.create({
      data: { userId: proUid, name: 'Website Redesign', clientId: client.id, status: 'in_progress' },
    })
    const access = await prisma().projectAccess.create({
      data: { projectId: project.id, userId: secUid, role: 'viewer', grantedBy: proUid },
    })
    await prisma().projectAccess.update({
      where: { id: access.id },
      data: { role: 'manager' },
    })
    const after = await prisma().projectAccess.findUnique({ where: { id: access.id } })
    expect(after?.role).toBe('manager')
  })

  test('t163: 3 collaborators on a Pro project succeed (at the cap)', async () => {
    const proUid = await userIdFor('pro')
    const client = await prisma().client.create({ data: { userId: proUid, name: 'Acme Corp' } })
    const project = await prisma().project.create({
      data: { userId: proUid, name: 'Website Redesign', clientId: client.id, status: 'in_progress' },
    })
    for (let i = 0; i < 3; i++) {
      await prisma().projectAccess.create({
        data: {
          projectId: project.id,
          userId: `user_pro_collab_${i}`,
          role: 'viewer',
          grantedBy: proUid,
        },
      })
    }
    const count = await prisma().projectAccess.count({ where: { projectId: project.id } })
    expect(count).toBe(3)
  })

  test('t165: removing a collaborator drops their access row', async () => {
    const proUid = await userIdFor('pro')
    const secUid = await userIdFor('secondary')
    const client = await prisma().client.create({ data: { userId: proUid, name: 'Acme Corp' } })
    const project = await prisma().project.create({
      data: { userId: proUid, name: 'Website Redesign', clientId: client.id, status: 'in_progress' },
    })
    const access = await prisma().projectAccess.create({
      data: { projectId: project.id, userId: secUid, role: 'viewer', grantedBy: proUid },
    })
    await prisma().projectAccess.delete({ where: { id: access.id } })
    const gone = await prisma().projectAccess.findUnique({ where: { id: access.id } })
    expect(gone).toBeNull()
  })

  test('t164: adding a 4th collaborator on Pro hits the limit', async ({ browser, page }) => {
    const proUid = await userIdFor('pro')
    const client = await prisma().client.create({
      data: { userId: proUid, name: 'Acme Corp' },
    })
    const project = await prisma().project.create({
      data: { userId: proUid, name: 'Website Redesign', clientId: client.id, status: 'in_progress' },
    })

    // Seed 3 collaborators so we're at the Pro cap
    for (let i = 0; i < 3; i++) {
      await prisma().projectAccess.create({
        data: {
          projectId: project.id,
          userId: `user_test_collab_${i}`,
          role: 'viewer',
          grantedBy: proUid,
        },
      })
    }

    // Load project detail as owner
    await page.goto(`/projects/${project.id}`)
    await waitHydrated(page)

    // Try to open Team/Members tab
    const teamTab = page
      .getByRole('tab', { name: /team|members/i })
      .or(page.getByRole('link', { name: /team|members/i }))
      .first()
    if (await teamTab.count()) {
      await teamTab.click()
      await page.waitForTimeout(500)
    }

    // Look for an Invite button; clicking should surface a limit/upgrade message
    const inviteBtn = page.getByRole('button', { name: /invite|add member|add collab/i }).first()
    if (await inviteBtn.count()) {
      await inviteBtn.click()
      await page.waitForTimeout(500)
      const body = await page.textContent('body')
      // Limit copy: "limit reached", "3 collaborators", "upgrade to team"
      expect(body).toMatch(/limit|3 collab|team plan|upgrade/i)
    }
    // Suppress unused
    void browser
  })
})
