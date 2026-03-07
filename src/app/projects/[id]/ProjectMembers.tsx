'use client'

import { useState, useTransition } from 'react'
import { grantProjectAccess, grantProjectAccessByEmail, revokeProjectAccess } from '@/actions/access'
import { Badge } from '@/components/ui/Badge'

interface MemberUser {
  id: string
  name: string
  email: string
  imageUrl: string
}

interface Member {
  userId: string
  role: string
  user: MemberUser
}

interface OrgMember {
  userId: string
  name: string
  email: string
  imageUrl: string
}

interface ProjectMembersProps {
  projectId: string
  isOwnerOrManager: boolean
  hasOrg: boolean
  owner: MemberUser | null
  members: Member[]
  orgMembers: OrgMember[]
}

export function ProjectMembers({
  projectId,
  isOwnerOrManager,
  hasOrg,
  owner,
  members,
  orgMembers,
}: ProjectMembersProps) {
  const [isPending, startTransition] = useTransition()
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [selectedRole, setSelectedRole] = useState<'viewer' | 'editor' | 'manager'>('viewer')
  const [inviteEmail, setInviteEmail] = useState('')
  const [emailRole, setEmailRole] = useState<'viewer' | 'editor' | 'manager'>('editor')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Filter out users who already have access
  const existingIds = new Set([owner?.id, ...members.map(m => m.userId)].filter(Boolean))
  const availableMembers = orgMembers.filter(m => !existingIds.has(m.userId))

  const handleGrant = () => {
    if (!selectedUserId) return
    setError(null)
    startTransition(async () => {
      try {
        await grantProjectAccess(projectId, selectedUserId, selectedRole)
        setShowAddForm(false)
        setSelectedUserId('')
        setSelectedRole('viewer')
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to add team member.'
        setError(msg)
      }
    })
  }

  const handleRevoke = (targetUserId: string, targetName: string) => {
    if (!window.confirm(`Remove ${targetName} from this project? They will lose all access immediately.`)) return
    setError(null)
    startTransition(async () => {
      try {
        await revokeProjectAccess(projectId, targetUserId)
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to remove team member.'
        setError(msg)
      }
    })
  }

  const handleEmailInvite = () => {
    if (!inviteEmail.trim()) return
    setError(null)
    setSuccessMessage(null)
    startTransition(async () => {
      try {
        const result = await grantProjectAccessByEmail(projectId, inviteEmail, emailRole)
        setShowEmailForm(false)
        setInviteEmail('')
        setEmailRole('editor')
        setSuccessMessage(`${result.name} added as ${emailRole}`)
        setTimeout(() => setSuccessMessage(null), 4000)
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to add team member.'
        setError(msg)
      }
    })
  }

  const roleLabels: Record<string, string> = {
    viewer: 'Viewer',
    editor: 'Editor',
    manager: 'Manager',
  }

  const roleBadgeColors: Record<string, string> = {
    viewer: 'bg-muted text-muted-foreground',
    editor: 'bg-blue-500/10 text-blue-500',
    manager: 'bg-amber-500/10 text-amber-500',
  }

  return (
    <div className="space-y-4">
      {/* Error banner */}
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
          <svg className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-destructive">{error}</p>
            {error.toLowerCase().includes('upgrade') && (
              <a href="/settings" className="text-sm font-medium text-primary hover:text-primary/80 mt-1 inline-block">
                Manage plan &rarr;
              </a>
            )}
          </div>
          <button onClick={() => setError(null)} className="text-muted-foreground hover:text-foreground p-0.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Owner */}
      {owner && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border">
          {owner.imageUrl ? (
            <img src={owner.imageUrl} alt="" className="w-8 h-8 rounded-full flex-shrink-0" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 text-xs font-medium text-muted-foreground">
              {(owner.name[0] || '?').toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{owner.name}</p>
            <p className="text-xs text-muted-foreground truncate">{owner.email}</p>
          </div>
          <Badge className="bg-primary/10 text-primary">Owner</Badge>
        </div>
      )}

      {/* Members */}
      {members.length > 0 && (
        <div className="space-y-2">
          {members.map((member) => (
            <div key={member.userId} className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border">
              {member.user.imageUrl ? (
                <img src={member.user.imageUrl} alt="" className="w-8 h-8 rounded-full flex-shrink-0" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 text-xs font-medium text-muted-foreground">
                  {(member.user.name[0] || '?').toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{member.user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{member.user.email}</p>
              </div>
              <Badge className={roleBadgeColors[member.role] || 'bg-muted text-muted-foreground'}>
                {roleLabels[member.role] || member.role}
              </Badge>
              {isOwnerOrManager && (
                <button
                  onClick={() => handleRevoke(member.userId, member.user.name)}
                  disabled={isPending}
                  className="text-muted-foreground hover:text-destructive transition-colors p-1"
                  title="Remove access"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Success message */}
      {successMessage && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-4 py-3">
          <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-emerald-500">{successMessage}</p>
        </div>
      )}

      {/* Empty state */}
      {members.length === 0 && !isOwnerOrManager && (
        <div className="py-4 text-center">
          <p className="text-sm text-muted-foreground">No team members have access to this project yet.</p>
        </div>
      )}

      {/* Add member by email — always available for owners/managers */}
      {isOwnerOrManager && (
        <div className="space-y-3">
          {/* Org member picker (if org exists and has available members) */}
          {hasOrg && availableMembers.length > 0 && (
            <>
              {!showAddForm ? (
                <button
                  onClick={() => { setShowAddForm(true); setShowEmailForm(false); setError(null) }}
                  className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Add from organization
                </button>
              ) : (
                <div className="space-y-3 rounded-lg border border-border p-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Team Member</label>
                    <select
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Select a member...</option>
                      {availableMembers.map((m) => (
                        <option key={m.userId} value={m.userId}>
                          {m.name} ({m.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Role</label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value as 'viewer' | 'editor' | 'manager')}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="viewer">Viewer — can view tasks and files, cannot edit</option>
                      <option value="editor">Editor — can create, edit, and delete tasks</option>
                      <option value="manager">Manager — full access plus manage team members</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleGrant}
                      disabled={!selectedUserId || isPending}
                      className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {isPending ? 'Adding...' : 'Add'}
                    </button>
                    <button
                      onClick={() => { setShowAddForm(false); setSelectedUserId(''); setError(null) }}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Email invite — always available */}
          {!showEmailForm ? (
            <button
              onClick={() => { setShowEmailForm(true); setShowAddForm(false); setError(null) }}
              className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
              Add team member by email
            </button>
          ) : (
            <div className="space-y-3 rounded-lg border border-border p-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Email Address</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="teammate@example.com"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground"
                  onKeyDown={(e) => e.key === 'Enter' && handleEmailInvite()}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Role</label>
                <select
                  value={emailRole}
                  onChange={(e) => setEmailRole(e.target.value as 'viewer' | 'editor' | 'manager')}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="viewer">Viewer — can view tasks and files, cannot edit</option>
                  <option value="editor">Editor — can create, edit, and delete tasks</option>
                  <option value="manager">Manager — full access plus manage team members</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleEmailInvite}
                  disabled={!inviteEmail.trim() || isPending}
                  className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isPending ? 'Adding...' : 'Add'}
                </button>
                <button
                  onClick={() => { setShowEmailForm(false); setInviteEmail(''); setError(null) }}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                They must have a Pulse Pro account. If they don&apos;t, ask them to sign up at pulsepro.org first.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
