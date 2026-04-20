import { chromium, type FullConfig } from '@playwright/test'
import { clerk, clerkSetup, setupClerkTestingToken } from '@clerk/testing/playwright'
import { PrismaClient } from '@prisma/client'
import { createClerkClient } from '@clerk/backend'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { QA_PASSWORD, qaUsers, type QaUserKey } from './users'

/**
 * Global setup:
 * 1. Sign up (or re-use) each QA user via Clerk's test mode. Emails use the
 *    `+clerk_test` suffix so the verification code is always 424242.
 * 2. Resolve each user's Clerk ID.
 * 3. Force the correct plan on their Subscription row via Prisma.
 * 4. Save per-user storageState JSON so each test can run as the right tier
 *    without paying the signup cost every time.
 *
 * Idempotent. Safe to re-run.
 */
export default async function globalSetup(config: FullConfig) {
  const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3001'

  const clerkSecret = process.env.CLERK_SECRET_KEY
  if (!clerkSecret) {
    throw new Error('CLERK_SECRET_KEY must be set to run the QA suite (used to look up / delete Clerk users).')
  }

  const clerkBackend = createClerkClient({ secretKey: clerkSecret })
  const prisma = new PrismaClient()

  // Loads Clerk testing publishable key from env so Clerk frontend JS recognises
  // this as a testing run (bypasses bot protection, enables testingToken flow).
  // @clerk/testing expects CLERK_PUBLISHABLE_KEY; the app uses NEXT_PUBLIC_ — pass explicitly.
  await clerkSetup({
    publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!,
    secretKey: clerkSecret,
  })

  for (const key of Object.keys(qaUsers) as QaUserKey[]) {
    const user = qaUsers[key]
    console.log(`\n[qa-setup] ${user.key} (${user.email})`)

    // 1. Find or create the Clerk user
    let clerkUserId = await findClerkUserIdByEmail(clerkBackend, user.email)
    if (!clerkUserId) {
      clerkUserId = await signupViaBrowser(BASE_URL, user.email, user.firstName, user.lastName, clerkBackend)
    } else {
      console.log(`[qa-setup]   ↳ clerk user exists: ${clerkUserId}`)
    }

    // 2. Force plan in Prisma (auto-creates Subscription if missing)
    await prisma.subscription.upsert({
      where: { userId: clerkUserId },
      create: { userId: clerkUserId, plan: user.plan, status: 'active' },
      update: { plan: user.plan, status: 'active', suspendedAt: null },
    })
    console.log(`[qa-setup]   ↳ plan forced to ${user.plan}`)

    // 3. Sign in in a fresh browser context and save storageState
    await captureStorageState(BASE_URL, clerkUserId, user.storageStatePath, clerkBackend)
    console.log(`[qa-setup]   ↳ storageState saved: ${user.storageStatePath}`)
  }

  await prisma.$disconnect()
  console.log(`\n[qa-setup] ✔ all ${Object.keys(qaUsers).length} QA users ready\n`)
}

async function findClerkUserIdByEmail(
  clerk: ReturnType<typeof createClerkClient>,
  email: string
): Promise<string | null> {
  const res = await clerk.users.getUserList({ emailAddress: [email], limit: 1 })
  return res.data[0]?.id ?? null
}

async function signupViaBrowser(
  _baseUrl: string,
  email: string,
  firstName: string,
  lastName: string,
  clerk: ReturnType<typeof createClerkClient>
): Promise<string> {
  // Create the Clerk user deterministically via the backend API instead of
  // driving the signup UI. The UI approach was too brittle — captcha, two-step
  // flows, aria-hidden submit buttons, etc. The backend call creates a fully
  // verified user immediately.
  console.log(`[qa-setup]   ↳ creating via Clerk backend API...`)
  const created = await clerk.users.createUser({
    emailAddress: [email],
    password: QA_PASSWORD,
    firstName,
    lastName,
    skipPasswordChecks: true,
    skipPasswordRequirement: false,
  })
  console.log(`[qa-setup]   ↳ created clerk user: ${created.id}`)
  return created.id
}

async function captureStorageState(
  baseUrl: string,
  userId: string,
  outPath: string,
  clerkBackend: ReturnType<typeof createClerkClient>
) {
  // Mint a one-time sign-in ticket via Clerk's backend — skips email
  // verification AND password prompts. Navigate to /sign-in?__clerk_ticket=X
  // and Clerk consumes the ticket, sets the session, redirects to dashboard.
  const ticket = await clerkBackend.signInTokens.createSignInToken({
    userId,
    expiresInSeconds: 300,
  })

  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  await setupClerkTestingToken({ page })
  await page.goto(`${baseUrl}/sign-in?__clerk_ticket=${ticket.token}`)

  // Wait for either /dashboard (happy path) or a Clerk reverification step
  // (factor-two route appears when the instance has reverification enabled —
  // see https://api.clerk.com/v1/environment auth_config.reverification).
  await page.waitForURL(
    (u) => u.pathname.startsWith('/dashboard') || u.pathname.includes('/factor-'),
    { timeout: 30_000 }
  )

  if (page.url().includes('/factor-')) {
    console.log(`[qa-setup]   ↳ hit reverification step, submitting test code 424242`)
    // +clerk_test users always accept verification code 424242. The factor-two
    // page renders an OTP input split into 6 cells; type into the focused field.
    const otpInput = page.locator('input[name^="codeInput"], input[id^="code"], input[type="text"][maxlength="1"]').first()
    await otpInput.waitFor({ state: 'visible', timeout: 10_000 })
    await page.keyboard.type('424242', { delay: 30 })
    await page.waitForURL((u) => u.pathname.startsWith('/dashboard'), { timeout: 20_000 })
  }

  await page.waitForTimeout(800)
  console.log(`[qa-setup]   ↳ signed in, URL: ${page.url()}`)

  // Mark the first-run onboarding overlay complete so tests aren't blocked
  // by it. Key is per-user: `pulse-onboarding-complete-${userId}` (see
  // src/components/OnboardingOverlay.tsx).
  await page.evaluate((uid) => {
    localStorage.setItem(`pulse-onboarding-complete-${uid}`, 'true')
  }, userId)

  mkdirSync(dirname(outPath), { recursive: true })
  await context.storageState({ path: outPath })
  await context.close()
  await browser.close()
}
