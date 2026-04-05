'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { VoiceInput } from '@/components/ui/VoiceInput'
import { DatePicker } from '@/components/ui/DatePicker'
import { UpgradePrompt, isLimitError } from '@/components/ui/UpgradePrompt'
import { createTask } from '@/actions/tasks'
import { parseTaskFromVoice } from '@/lib/voice'

interface Project {
  id: string
  name: string
  client: {
    name: string
  } | null
}

interface AddTaskDialogProps {
  projects: Project[]
  defaultOpen?: boolean
}

export function AddTaskDialog({ projects, defaultOpen = false }: AddTaskDialogProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [isPending, startTransition] = useTransition()

  // Sync defaultOpen prop changes (e.g. navigating to /tasks?add=true from CommandBar)
  useEffect(() => {
    if (defaultOpen) setIsOpen(true)
  }, [defaultOpen])

  // Smart project defaults: pre-select last-used project
  const [projectId, setProjectId] = useState('')
  useEffect(() => {
    if (isOpen && !projectId) {
      try {
        const lastUsed = localStorage.getItem('lastUsedProjectId')
        if (lastUsed && projects.some((p) => p.id === lastUsed)) {
          setProjectId(lastUsed)
        }
      } catch {}
    }
  }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [dueDate, setDueDate] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [limitMessage, setLimitMessage] = useState<string | null>(null)

  const handleVoiceInput = (transcript: string) => {
    const parsed = parseTaskFromVoice(transcript)

    // Auto-populate form fields
    if (parsed.title) setTitle(parsed.title)
    if (parsed.description) setDescription(parsed.description)
    if (parsed.priority) setPriority(parsed.priority)
    if (parsed.dueDate) setDueDate(parsed.dueDate)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      try {
        await createTask(projectId || null, formData)
        setIsOpen(false)
        setError(null)
        // Remember last-used project for smart defaults
        if (projectId) {
          try { localStorage.setItem('lastUsedProjectId', projectId) } catch {}
        }
        // Reset form
        setProjectId('')
        setTitle('')
        setDescription('')
        setPriority('medium')
        setDueDate('')
        router.refresh()
      } catch (err) {
        const msg = isLimitError(err)
        if (msg) {
          setLimitMessage(msg)
        } else {
          setError(err instanceof Error ? err.message : 'Failed to create task. Please try again.')
        }
      }
    })
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Task
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setIsOpen(false)}
          />

          {/* Dialog */}
          <div className="fixed inset-x-4 top-20 mx-auto max-w-lg bg-background rounded-lg border border-border shadow-lg z-50 max-h-[calc(100vh-6rem)] overflow-y-auto sm:top-1/2 sm:-translate-y-1/2 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-foreground">Add New Task</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Select
                  id="project"
                  name="project"
                  label="Project"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  options={[
                    { value: '', label: 'No project (quick task)' },
                    ...projects.map((project) => ({
                      value: project.id,
                      label: `${project.name}${project.client ? ` - ${project.client.name}` : ''}`,
                    })),
                  ]}
                />

                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-foreground mb-1">
                    Task Title *
                  </label>
                  <div className="flex items-start gap-2">
                    <Input
                      id="title"
                      name="title"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter task title"
                      className="flex-1"
                    />
                    <VoiceInput
                      onTranscript={handleVoiceInput}
                      placeholder="Speak to create task"
                    />
                  </div>
                </div>

                <Textarea
                  id="description"
                  name="description"
                  label="Description"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Task description..."
                />

                <Select
                  id="priority"
                  name="priority"
                  label="Priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  options={[
                    { value: 'low', label: 'Low' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'high', label: 'High' },
                  ]}
                />

                <DatePicker
                  id="dueDate"
                  name="dueDate"
                  label="Due Date"
                  value={dueDate}
                  onChange={setDueDate}
                />

                {limitMessage && (
                  <UpgradePrompt message={limitMessage} onDismiss={() => setLimitMessage(null)} />
                )}
                {error && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}
                <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setIsOpen(false)}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
                    {isPending ? 'Creating...' : 'Create Task'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  )
}
