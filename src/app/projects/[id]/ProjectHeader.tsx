'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { updateProject, deleteProject } from '@/actions/projects'
import { useRouter } from 'next/navigation'

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

const statusColors: Record<string, string> = {
  not_started: 'border border-zinc-400/50 text-zinc-500 dark:text-zinc-400 bg-zinc-500/5',
  in_progress: 'border border-primary/50 text-primary bg-primary/5',
  on_hold: 'border border-amber-500/50 text-amber-600 dark:text-amber-400 bg-amber-500/5',
  completed: 'border border-emerald-500/50 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5',
}

const priorityColors: Record<string, string> = {
  low: 'border border-zinc-400/50 text-zinc-600 dark:text-zinc-300 bg-zinc-500/5',
  medium: 'border border-primary/50 text-primary bg-primary/5',
  high: 'border border-rose-500/50 text-rose-600 dark:text-rose-400 bg-rose-500/5',
}

export function ProjectHeader({ project, clients, completedTasks, totalTasks, totalHours, userRole = 'owner' }: ProjectHeaderProps) {
  const [isEditingName, setIsEditingName] = useState(false)
  const [name, setName] = useState(project.name)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  const canEdit = userRole === 'owner' || userRole === 'manager'
  const canDelete = userRole === 'owner' || userRole === 'manager'

  const handleNameSave = () => {
    if (name.trim() && name !== project.name) {
      const formData = new FormData()
      formData.set('name', name)
      formData.set('description', project.description || '')
      formData.set('notes', project.notes || '')
      formData.set('status', project.status)
      formData.set('priority', project.priority)
      formData.set('clientId', project.client.id)
      if (project.dueDate) {
        formData.set('dueDate', new Date(project.dueDate).toISOString().split('T')[0])
      }
      if (project.budget) {
        formData.set('budget', project.budget.toString())
      }
      startTransition(async () => {
        await updateProject(project.id, formData)
      })
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
            <div className={`text-xs px-2 py-0.5 rounded font-medium ${statusColors[project.status]}`}>
              {statusLabels[project.status] || project.status}
            </div>
            <div className={`text-xs px-2 py-0.5 rounded font-medium ${priorityColors[project.priority]}`}>
              {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}
            </div>
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

        {canDelete && (
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="p-2 -m-2 text-xs text-muted-foreground hover:text-destructive transition-colors mt-2"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  )
}
