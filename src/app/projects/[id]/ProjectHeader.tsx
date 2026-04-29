'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import Link from 'next/link'
import { updateProject, deleteProject } from '@/actions/projects'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/ui/Modal'

interface Client {
  id: string
  name: string
}

interface Project {
  id: string
  name: string
  description: string | null
  notes: string | null
  status: string
  priority: string
  dueDate: Date | null
  budget: number | null
  client: Client
}

interface ProjectHeaderProps {
  project: Project
  clients: { id: string; name: string }[]
  completedTasks: number
  totalTasks: number
  totalHours: number
  userRole?: 'owner' | 'manager' | 'editor' | 'viewer'
}

const statusLabels: Record<string, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  on_hold: 'On Hold',
  completed: 'Completed',
}

const statusOrder = ['not_started', 'in_progress', 'on_hold', 'completed'] as const
const priorityOrder = ['low', 'medium', 'high'] as const

const statusColors: Record<string, string> = {
  not_started: 'border border-muted-foreground/40 text-muted-foreground bg-muted-foreground/5',
  in_progress: 'border border-primary/50 text-primary bg-primary/5',
  on_hold: 'border border-warning/50 text-warning bg-warning/5',
  completed: 'border border-success/50 text-success bg-success/5',
}

const priorityColors: Record<string, string> = {
  low: 'border border-success/50 text-success bg-success/5',
  medium: 'border border-warning/50 text-warning bg-warning/5',
  high: 'border border-destructive/50 text-destructive bg-destructive/5',
}

function buildFormData(project: Project, overrides: Partial<Project>): FormData {
  const merged = { ...project, ...overrides }
  const fd = new FormData()
  fd.set('name', merged.name)
  fd.set('description', merged.description || '')
  fd.set('notes', merged.notes || '')
  fd.set('status', merged.status)
  fd.set('priority', merged.priority)
  fd.set('clientId', merged.client.id)
  if (merged.dueDate) {
    fd.set('dueDate', new Date(merged.dueDate).toISOString().split('T')[0])
  }
  if (merged.budget != null) {
    fd.set('budget', merged.budget.toString())
  }
  return fd
}

function InlinePicker({
  current,
  options,
  className,
  disabled,
  onPick,
}: {
  current: string
  options: { value: string; label: string; chipClass: string }[]
  className: string
  disabled?: boolean
  onPick: (value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  const currentOption = options.find((o) => o.value === current)

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => !disabled && setOpen((v) => !v)}
        disabled={disabled}
        className={`text-xs px-2 py-0.5 rounded font-medium ${className} ${disabled ? 'cursor-default' : 'cursor-pointer hover:opacity-80'}`}
        title={disabled ? undefined : 'Change'}
      >
        {currentOption?.label ?? current}
      </button>
      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 min-w-[140px] rounded-md border border-border bg-card shadow-lg py-1">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                setOpen(false)
                if (opt.value !== current) onPick(opt.value)
              }}
              className={`flex w-full items-center justify-between gap-2 px-3 py-1.5 text-xs hover:bg-muted ${opt.value === current ? 'font-semibold' : ''}`}
            >
              <span className={`px-1.5 py-0.5 rounded ${opt.chipClass}`}>{opt.label}</span>
              {opt.value === current && (
                <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function EditProjectDialog({
  project,
  clients,
  isOpen,
  onClose,
  onSave,
  isSaving,
}: {
  project: Project
  clients: { id: string; name: string }[]
  isOpen: boolean
  onClose: () => void
  onSave: (overrides: Partial<Project>) => void
  isSaving: boolean
}) {
  const [description, setDescription] = useState(project.description || '')
  const [notes, setNotes] = useState(project.notes || '')
  const [status, setStatus] = useState(project.status)
  const [priority, setPriority] = useState(project.priority)
  const [clientId, setClientId] = useState(project.client.id)
  const [dueDate, setDueDate] = useState(
    project.dueDate ? new Date(project.dueDate).toISOString().split('T')[0] : ''
  )
  const [budget, setBudget] = useState(project.budget != null ? String(project.budget) : '')

  useEffect(() => {
    if (!isOpen) return
    setDescription(project.description || '')
    setNotes(project.notes || '')
    setStatus(project.status)
    setPriority(project.priority)
    setClientId(project.client.id)
    setDueDate(project.dueDate ? new Date(project.dueDate).toISOString().split('T')[0] : '')
    setBudget(project.budget != null ? String(project.budget) : '')
  }, [isOpen, project])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      description: description || null,
      notes: notes || null,
      status,
      priority,
      client: { id: clientId, name: clients.find((c) => c.id === clientId)?.name ?? project.client.name },
      dueDate: dueDate ? new Date(dueDate) : null,
      budget: budget ? parseFloat(budget) : null,
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit project">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {statusOrder.map((s) => (
                <option key={s} value={s}>{statusLabels[s]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {priorityOrder.map((p) => (
                <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Client</label>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Due date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Budget ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-muted-foreground hover:text-foreground px-3 py-1.5"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export function ProjectHeader({ project, clients, completedTasks, totalTasks, totalHours, userRole = 'owner' }: ProjectHeaderProps) {
  const [isEditingName, setIsEditingName] = useState(false)
  const [name, setName] = useState(project.name)
  const [isPending, startTransition] = useTransition()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const router = useRouter()
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  const canEdit = userRole === 'owner' || userRole === 'manager'
  const canDelete = userRole === 'owner' || userRole === 'manager'

  const persist = (overrides: Partial<Project>) => {
    startTransition(async () => {
      await updateProject(project.id, buildFormData(project, overrides))
    })
  }

  const handleNameSave = () => {
    if (name.trim() && name !== project.name) {
      persist({ name })
    }
    setIsEditingName(false)
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project? This will also delete all associated tasks.')) return
    startTransition(async () => {
      await deleteProject(project.id)
      router.push('/projects')
    })
  }

  return (
    <div className="pb-2">
      <Link
        href="/projects"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-2"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Projects
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {isEditingName && canEdit ? (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={handleNameSave}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleNameSave()
                if (e.key === 'Escape') {
                  setName(project.name)
                  setIsEditingName(false)
                }
              }}
              autoFocus
              className="text-xl sm:text-2xl font-bold border-b-2 border-primary bg-transparent focus:outline-none w-full"
            />
          ) : (
            <h1
              onClick={canEdit ? () => setIsEditingName(true) : undefined}
              className={`text-xl sm:text-2xl font-bold ${canEdit ? 'cursor-pointer hover:text-primary' : ''} transition-colors`}
            >
              {project.name}
            </h1>
          )}

          <div className="flex items-center gap-2 mt-1 flex-wrap text-sm text-muted-foreground">
            <Link
              href={`/clients/${project.client.id}`}
              className="hover:text-foreground transition-colors"
            >
              {project.client.name}
            </Link>
            <span className="text-muted-foreground/40">/</span>
            <InlinePicker
              current={project.status}
              className={statusColors[project.status]}
              disabled={!canEdit || isPending}
              onPick={(value) => persist({ status: value })}
              options={statusOrder.map((s) => ({
                value: s,
                label: statusLabels[s],
                chipClass: statusColors[s],
              }))}
            />
            <InlinePicker
              current={project.priority}
              className={priorityColors[project.priority]}
              disabled={!canEdit || isPending}
              onPick={(value) => persist({ priority: value })}
              options={priorityOrder.map((p) => ({
                value: p,
                label: p.charAt(0).toUpperCase() + p.slice(1),
                chipClass: priorityColors[p],
              }))}
            />
            <span className="text-muted-foreground/40">&middot;</span>
            <span>{progress}%</span>
            <div className="w-12 h-1 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
            </div>
            {project.dueDate && (
              <>
                <span className="text-muted-foreground/40">&middot;</span>
                <span>Due {new Date(project.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 mt-2">
          {canEdit && (
            <button
              onClick={() => setIsEditDialogOpen(true)}
              disabled={isPending}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              title="Edit project details"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
          )}
          {canDelete && (
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="px-2 py-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      <EditProjectDialog
        project={project}
        clients={clients}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSave={(overrides) => {
          persist(overrides)
          setIsEditDialogOpen(false)
        }}
        isSaving={isPending}
      />
    </div>
  )
}
