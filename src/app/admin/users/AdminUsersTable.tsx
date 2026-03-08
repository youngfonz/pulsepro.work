'use client'

import { useState, useTransition } from 'react'
import { updateUserPlan, suspendUser, unsuspendUser, wipeUserData, deleteUser } from '@/actions/admin'
import { Badge } from '@/components/ui/Badge'

interface AdminUser {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  imageUrl: string
  createdAt: number
  plan: string
  status: string
  suspendedAt: Date | null
  projectCount: number
  taskCount: number
  clientCount: number
}

interface Props {
  users: AdminUser[]
  currentAdminId: string
  adminUserIds: string[]
}

export function AdminUsersTable({ users, currentAdminId, adminUserIds }: Props) {
  const [isPending, startTransition] = useTransition()
  const [pendingUserId, setPendingUserId] = useState<string | null>(null)
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  function handlePlanChange(userId: string, newPlan: string, currentPlan: string) {
    if (!confirm(`Change this user's plan from ${currentPlan} to ${newPlan}? This takes effect immediately.`)) return
    setPendingUserId(userId)
    startTransition(async () => {
      try {
        await updateUserPlan(userId, newPlan)
        alert(`Plan updated to ${newPlan}`)
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to update plan')
      } finally {
        setPendingUserId(null)
      }
    })
  }

  function handleSuspend(user: AdminUser) {
    const name = displayName(user)
    if (!confirm(`Suspend ${name}?\n\nThey will be locked out of the platform but their data will be preserved.`)) return
    setPendingUserId(user.id)
    setOpenMenu(null)
    startTransition(async () => {
      try {
        await suspendUser(user.id)
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to suspend user')
      } finally {
        setPendingUserId(null)
      }
    })
  }

  function handleUnsuspend(user: AdminUser) {
    setPendingUserId(user.id)
    setOpenMenu(null)
    startTransition(async () => {
      try {
        await unsuspendUser(user.id)
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to unsuspend user')
      } finally {
        setPendingUserId(null)
      }
    })
  }

  function handleWipe(user: AdminUser) {
    const name = displayName(user)
    if (!confirm(
      `Wipe all data for ${name}?\n\n` +
      `This will permanently delete:\n` +
      `• ${user.projectCount} projects\n` +
      `• ${user.taskCount} tasks\n` +
      `• ${user.clientCount} clients\n` +
      `• All invoices, time entries, and files\n\n` +
      `Their account and subscription will remain.\n` +
      `This cannot be undone.`
    )) return
    setPendingUserId(user.id)
    setOpenMenu(null)
    startTransition(async () => {
      try {
        await wipeUserData(user.id)
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to wipe data')
      } finally {
        setPendingUserId(null)
      }
    })
  }

  function handleDelete(user: AdminUser) {
    const name = displayName(user)
    if (!confirm(
      `DELETE ${name} permanently?\n\n` +
      `This will destroy:\n` +
      `• ${user.projectCount} projects\n` +
      `• ${user.taskCount} tasks\n` +
      `• ${user.clientCount} clients\n` +
      `• All invoices, time entries, files, and their account\n\n` +
      `THIS CANNOT BE UNDONE.`
    )) return
    setPendingUserId(user.id)
    setOpenMenu(null)
    startTransition(async () => {
      try {
        await deleteUser(user.id)
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to delete user')
      } finally {
        setPendingUserId(null)
      }
    })
  }

  function displayName(user: AdminUser) {
    return [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email
  }

  const isSelf = (id: string) => id === currentAdminId
  const isAdmin = (id: string) => adminUserIds.includes(id)
  const isLoading = (id: string) => isPending && pendingUserId === id

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">User</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Plan</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Projects</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Tasks</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Clients</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Joined</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => (
              <tr
                key={user.id}
                className={`transition-colors ${isLoading(user.id) ? 'opacity-50 pointer-events-none' : 'hover:bg-muted/30'}`}
              >
                {/* User */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {user.imageUrl ? (
                      <img src={user.imageUrl} alt="User avatar" className="w-8 h-8 rounded-full flex-shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 text-xs font-medium text-muted-foreground">
                        {(user.firstName?.[0] || user.email[0] || '?').toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate flex items-center gap-2">
                        {displayName(user)}
                        {isSelf(user.id) && <Badge variant="info">You</Badge>}
                        {isAdmin(user.id) && !isSelf(user.id) && <Badge variant="warning">Admin</Badge>}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                </td>

                {/* Plan */}
                <td className="px-4 py-3">
                  {isSelf(user.id) || isAdmin(user.id) ? (
                    <Badge className="bg-violet-500/10 text-violet-500 border-violet-500/30">Team</Badge>
                  ) : (
                    <select
                      value={user.plan}
                      onChange={(e) => handlePlanChange(user.id, e.target.value, user.plan)}
                      className="text-xs rounded-md border border-border bg-background px-2 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="free">Free</option>
                      <option value="pro">Pro</option>
                      <option value="team">Team</option>
                    </select>
                  )}
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                  {user.suspendedAt ? (
                    <Badge variant="danger">Suspended</Badge>
                  ) : (
                    <Badge variant="success">Active</Badge>
                  )}
                </td>

                {/* Counts */}
                <td className="px-4 py-3 text-right text-foreground">{user.projectCount}</td>
                <td className="px-4 py-3 text-right text-foreground">{user.taskCount}</td>
                <td className="px-4 py-3 text-right text-foreground">{user.clientCount}</td>

                {/* Joined */}
                <td className="px-4 py-3 text-right text-muted-foreground text-xs">
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </td>

                {/* Actions */}
                <td className="px-4 py-3 text-right">
                  {!isSelf(user.id) && !isAdmin(user.id) && (
                    <div className="relative inline-block">
                      <button
                        onClick={() => setOpenMenu(openMenu === user.id ? null : user.id)}
                        className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                        </svg>
                      </button>

                      {openMenu === user.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
                          <div className="absolute right-0 top-8 z-20 w-40 rounded-lg border border-border bg-popover shadow-lg py-1">
                            {user.suspendedAt ? (
                              <button
                                onClick={() => handleUnsuspend(user)}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors text-foreground"
                              >
                                Unsuspend
                              </button>
                            ) : (
                              <button
                                onClick={() => handleSuspend(user)}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors text-amber-500"
                              >
                                Suspend
                              </button>
                            )}
                            <button
                              onClick={() => handleWipe(user)}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors text-orange-500"
                            >
                              Wipe Data
                            </button>
                            <div className="border-t border-border my-1" />
                            <button
                              onClick={() => handleDelete(user)}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors text-rose-500"
                            >
                              Delete User
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
