import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

const clerkEnabled = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

/**
 * Returns the authenticated user's Clerk ID.
 * When Clerk is disabled (no env var), returns a stable fallback ID.
 */
export async function requireUserId(): Promise<string> {
  if (!clerkEnabled) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('CRITICAL: Clerk is not configured in production')
    }
    return 'local-dev-user'
  }

  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  return userId
}

/**
 * Checks if the given userId is in the ADMIN_USER_IDS env var.
 */
export function isAdminUser(userId: string): boolean {
  const adminIds = process.env.ADMIN_USER_IDS?.split(',').map(id => id.trim()) ?? []
  return adminIds.includes(userId)
}

/**
 * Returns the current Clerk org ID, or null if not in an org context.
 */
export async function getOrgId(): Promise<string | null> {
  if (!clerkEnabled) return null
  const { orgId } = await auth()
  return orgId || null
}

/**
 * Requires the current user to be a site admin. Redirects to /dashboard if not.
 */
export async function requireAdmin(): Promise<string> {
  const userId = await requireUserId()
  if (!isAdminUser(userId)) {
    redirect('/dashboard')
  }
  return userId
}
