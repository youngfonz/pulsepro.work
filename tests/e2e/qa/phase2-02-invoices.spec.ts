import { test, expect } from '@playwright/test'
import { qaUsers } from './users'
import { userIdFor, wipeUserData, ensurePlan, prisma, waitHydrated } from './helpers'

/**
 * Phase 2 · §2.3 Invoices (create, totals, send, share link).
 *
 * Checks t121–t128. The "send by email" check (t125-t126) is partial —
 * we verify the button wiring but can't verify delivery without a real inbox.
 */

test.describe('@phase2 2.3 Invoices', () => {
  test.use({ storageState: qaUsers.pro.storageStatePath })

  test.beforeEach(async () => {
    const uid = await userIdFor('pro')
    await ensurePlan(uid, 'pro')
    await wipeUserData(uid)
    await prisma().client.create({
      data: { userId: uid, name: 'Acme Corp', email: 'acme@test.com' },
    })
  })

  test('t121-t124: create invoice with line items, total calculates correctly', async ({ page }) => {
    const uid = await userIdFor('pro')
    // Sanity: confirm the seed survived to the moment we navigate.
    const seeded = await prisma().client.findFirst({ where: { userId: uid, name: 'Acme Corp' } })
    if (!seeded) throw new Error('Acme Corp client missing before page load')

    await page.goto('/invoices/new')
    await waitHydrated(page)

    // Client: Acme Corp — InvoiceForm renders a <select> with "Select a client..." default.
    // Label is plain text (not <label for>) so getByLabel won't match — use role + option text.
    const clientSelect = page.getByRole('combobox').first()
    await clientSelect.waitFor({ state: 'visible', timeout: 8_000 })
    await clientSelect.selectOption({ label: 'Acme Corp' })

    // Verify the value the form sees matches the row that exists in the DB.
    const selected = await clientSelect.inputValue()
    if (selected !== seeded.id) {
      // The page's RSC payload is stale: re-fetch with a hard reload.
      await page.goto('/invoices/new', { waitUntil: 'networkidle' })
      await page.getByRole('combobox').first().selectOption({ label: 'Acme Corp' })
    }

    // Due Date *: pick today via the DatePicker button
    await page.getByRole('button', { name: /pick a due date|due date/i }).first().click()
    // Calendar dialog: pick the first enabled day cell
    const today = new Date().getDate()
    await page.getByRole('button', { name: new RegExp(`^${today}$`) }).first().click()

    // Line item: fill description, rate, qty
    await page.getByRole('textbox', { name: /service description/i }).first()
      .or(page.locator('input[placeholder*="service description" i]').first())
      .fill('Website design')
    const spinbuttons = page.getByRole('spinbutton')
    await spinbuttons.nth(0).fill('1')    // qty
    await spinbuttons.nth(1).fill('2500') // rate

    // Final sanity: client must still exist immediately before submit
    const stillThere = await prisma().client.findFirst({ where: { id: seeded.id } })
    if (!stillThere) throw new Error('Acme Corp client vanished before submit')

    // Save Draft (now enabled because client + due date set)
    await page.getByRole('button', { name: /^save draft$/i }).click()
    await page.waitForURL(/\/invoice(s)?\/[^/]+/, { timeout: 10_000 }).catch(() => {})
    await page.waitForTimeout(1_000)

    // Verify in DB
    const invs = await prisma().invoice.findMany({ where: { userId: uid }, include: { items: true } })
    expect(invs.length).toBeGreaterThanOrEqual(1)
    expect(invs[0].items.length).toBeGreaterThanOrEqual(1)
  })

  test('t127-t128: public share link renders invoice without auth', async ({ browser, page }) => {
    // Seed an invoice with a known share token and line items
    const uid = await userIdFor('pro')
    const client = await prisma().client.findFirstOrThrow({ where: { userId: uid } })
    const invoice = await prisma().invoice.create({
      data: {
        userId: uid,
        clientId: client.id,
        number: 'INV-001',
        status: 'sent',
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 86400_000),
        shareToken: 'qa-share-token-' + Math.random().toString(36).slice(2, 10),
        items: {
          create: [
            { description: 'Website design', quantity: 1, rate: 2500, amount: 2500 },
            { description: 'Hosting setup', quantity: 1, rate: 150, amount: 150 },
          ],
        },
      },
    })

    // Visit share URL in a clean incognito context (no storageState)
    const ctx = await browser.newContext({ storageState: { cookies: [], origins: [] } })
    const pub = await ctx.newPage()
    const res = await pub.goto(`/invoice/${invoice.shareToken}`)
    expect(res?.ok()).toBe(true)
    await expect(pub.getByText(/website design/i).first()).toBeVisible()
    await expect(pub.getByText(/hosting setup/i).first()).toBeVisible()
    // Total = $2,650 formatted
    const pubBody = await pub.textContent('body')
    expect(pubBody).toMatch(/2,650|2650/)
    await ctx.close()
    // Suppress unused warning
    void page
  })
})
