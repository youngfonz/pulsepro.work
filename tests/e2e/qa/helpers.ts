import { expect, type Page } from '@playwright/test'
import { PrismaClient } from '@prisma/client'
import { createClerkClient } from '@clerk/backend'
import { qaUsers, type QaUserKey } from './users'

// One PrismaClient reused across helpers within a test worker.
// Playwright runs with workers:1 here so this is safe.
let _prisma: PrismaClient | null = null
export function prisma(): PrismaClient {
  if (!_prisma) _prisma = new PrismaClient()
  return _prisma
}

let _clerk: ReturnType<typeof createClerkClient> | null = null
export function clerk() {
  if (!_clerk) {
    const secretKey = process.env.CLERK_SECRET_KEY
    if (!secretKey) throw new Error('CLERK_SECRET_KEY must be set')
    _clerk = createClerkClient({ secretKey })
  }
  return _clerk
}

export async function userIdFor(key: QaUserKey): Promise<string> {
  const email = qaUsers[key].email
  const res = await clerk().users.getUserList({ emailAddress: [email], limit: 1 })
  if (!res.data[0]) throw new Error(`Clerk user missing for ${email} — run global-setup first`)
  return res.data[0].id
}

/** Wipe a user's app data so a spec can start from a known state. */
export async function wipeUserData(clerkUserId: string) {
  const p = prisma()
  await p.$transaction(async (tx) => {
    await tx.projectAccess.deleteMany({ where: { userId: clerkUserId } })
    await tx.task.deleteMany({ where: { userId: clerkUserId } })
    await tx.invoiceItem.deleteMany({ where: { invoice: { userId: clerkUserId } } })
    await tx.invoice.deleteMany({ where: { userId: clerkUserId } })
    await tx.cachedInsight.deleteMany({ where: { userId: clerkUserId } })
    // Bookmarks are stored as Tasks with a non-null `url` — already covered by task wipe above.
    await tx.client.deleteMany({ where: { userId: clerkUserId } })
    await tx.project.deleteMany({ where: { userId: clerkUserId } })
  })
}

/** Ensure a user is on the correct plan (defensive — global-setup also does this). */
export async function ensurePlan(clerkUserId: string, plan: 'free' | 'pro' | 'team') {
  await prisma().subscription.upsert({
    where: { userId: clerkUserId },
    create: { userId: clerkUserId, plan, status: 'active' },
    update: { plan, status: 'active', suspendedAt: null },
  })
}

/** Navigate to /dashboard and wait for the greeting to render. Fails fast if sign-in page shows. */
export async function goToDashboard(page: Page) {
  await page.goto('/dashboard')
  // If we're redirected to sign-in the storageState is wrong — fail loudly.
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 })
}

/** Dismiss the first-run onboarding overlay if it's showing. */
export async function dismissOnboarding(page: Page) {
  // Onboarding overlay: look for "Get started" button or close X; either dismisses.
  const getStartedBtn = page.getByRole('button', { name: /get started/i })
  if (await getStartedBtn.count()) {
    try {
      await getStartedBtn.first().click({ timeout: 2000 })
      return
    } catch {
      // fall through
    }
  }
  const closeBtn = page.locator('[aria-label="Close"], button:has-text("✕")').first()
  if (await closeBtn.count()) {
    try {
      await closeBtn.click({ timeout: 2000 })
    } catch {
      // silent
    }
  }
}

/** Open quick-add via N key and type a task, then Enter. */
export async function quickAddTask(page: Page, text: string) {
  // Wait for hydration so the QuickAdd component's document keydown listener is attached.
  await waitHydrated(page)
  // Defocus any input/button so the global N handler isn't filtered out.
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur?.())
  const input = page.locator('input[placeholder="What needs to be done?"]').first()
  // The listener attaches in a useEffect; retry the keypress a couple times.
  for (let attempt = 0; attempt < 3; attempt++) {
    await page.keyboard.press('n')
    if (await input.isVisible({ timeout: 1_500 }).catch(() => false)) break
    await page.waitForTimeout(400)
  }
  await input.waitFor({ state: 'visible', timeout: 5_000 })
  await input.fill(text)
  await page.keyboard.press('Enter')
  await page.waitForTimeout(900)
}

/** Wait for a page to hydrate — Next.js App Router marker. */
export async function waitHydrated(page: Page) {
  await page.waitForLoadState('domcontentloaded')
  await page.waitForLoadState('networkidle').catch(() => {})
}
