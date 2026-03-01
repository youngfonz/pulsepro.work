import Link from 'next/link'
import { getAdminUsers } from '@/actions/admin'
import { requireAdmin } from '@/lib/auth'
import { AdminUsersTable } from './AdminUsersTable'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  const adminId = await requireAdmin()
  const { users, totalCount } = await getAdminUsers()

  const adminUserIds = (process.env.ADMIN_USER_IDS ?? '')
    .split(',')
    .map(id => id.trim())
    .filter(Boolean)

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Admin
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-foreground">Users</h1>
        <p className="text-sm text-muted-foreground mt-1">{totalCount} registered</p>
      </div>

      <AdminUsersTable
        users={users}
        currentAdminId={adminId}
        adminUserIds={adminUserIds}
      />
    </div>
  )
}
