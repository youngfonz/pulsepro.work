'use client'

import { useState, useEffect, useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createTask } from '@/actions/tasks'
import { parseTaskFromVoice } from '@/lib/voice'

interface Project {
  id: string
  name: string
}

export function QuickAdd() {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [projectId, setProjectId] = useState('')
  const [projects, setProjects] = useState<Project[]>([])
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Global N key listener
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore when typing in inputs, textareas, or contenteditable
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        return
      }

      // Ignore with modifiers
      if (e.metaKey || e.ctrlKey || e.altKey) return

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault()
        setIsOpen(true)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Focus input and load projects when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)

      // Load smart default project from localStorage
      try {
        const lastUsed = localStorage.getItem('lastUsedProjectId')
        if (lastUsed) setProjectId(lastUsed)
      } catch {}

      // Lazy-load projects
      import('@/actions/tasks').then(({ getProjectsForTaskFilter }) => {
        getProjectsForTaskFilter().then((data) => {
          setProjects(data.map((p) => ({ id: p.id, name: p.name })))
        })
      })
    } else {
      setTitle('')
      setProjectId('')
      setSuccess(false)
      setError(null)
    }
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    // Use natural language parsing for priority/due date
    const parsed = parseTaskFromVoice(title)

    const formData = new FormData()
    formData.append('title', parsed.title || title)
    if (parsed.priority) formData.append('priority', parsed.priority)
    if (parsed.dueDate) formData.append('dueDate', parsed.dueDate)

    setError(null)
    startTransition(async () => {
      try {
        await createTask(projectId || null, formData)
        // Remember project choice
        if (projectId) {
          try { localStorage.setItem('lastUsedProjectId', projectId) } catch {}
        }
        setSuccess(true)
        router.refresh()
        // Close after brief success flash
        setTimeout(() => setIsOpen(false), 600)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create task. Please try again.')
      }
    })
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      {/* Quick-add modal */}
      <div
        className="fixed inset-0 z-[101] flex items-start justify-center pt-[20vh] px-4"
        onClick={() => setIsOpen(false)}
      >
        <div
          className="w-full max-w-md bg-background border border-border rounded-xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {success ? (
            <div className="flex items-center gap-3 px-5 py-4">
              <svg className="w-5 h-5 text-success flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm font-medium text-foreground">Task added</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="flex items-center gap-3 px-4 border-b border-border">
                <svg className="w-5 h-5 text-muted-foreground flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What needs to be done?"
                  className="flex-1 py-3.5 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      e.preventDefault()
                      setIsOpen(false)
                    }
                  }}
                />
                {isPending && (
                  <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                )}
              </div>

              {error && (
                <div className="px-4 py-2 text-xs text-destructive">{error}</div>
              )}
              <div className="px-4 py-2.5 space-y-2">
                <div className="flex items-center justify-between">
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="text-xs bg-transparent text-muted-foreground border border-border rounded-md px-2 py-1 outline-none focus:border-primary max-w-[200px]"
                  >
                    <option value="">No project</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>

                  <button
                    type="submit"
                    disabled={isPending || !title.trim()}
                    className="px-3 py-1 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
                {!title.trim() && (
                  <p className="text-[10px] text-muted-foreground">
                    Tip: Try natural language like &ldquo;Buy groceries due tomorrow high priority&rdquo;
                  </p>
                )}
              </div>
            </form>
          )}

          {/* Footer hint */}
          {!success && (
            <div className="px-4 py-1.5 border-t border-border flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-muted border border-border rounded text-[10px]">&crarr;</kbd>
                add task
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded text-[10px]">esc</kbd>
                close
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
