'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { VoiceInput } from '@/components/ui/VoiceInput'
import { DatePicker } from '@/components/ui/DatePicker'
import { UpgradePrompt, isLimitError } from '@/components/ui/UpgradePrompt'
import { createTask } from '@/actions/tasks'
import { parseTaskFromVoice } from '@/lib/voice'

export function AddTaskForm({ projectId, onSuccess }: { projectId: string; onSuccess?: () => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [limitMessage, setLimitMessage] = useState<string | null>(null)

  // Controlled form state for voice input
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState('medium')
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')

  const handleVoiceInput = (transcript: string) => {
    const parsed = parseTaskFromVoice(transcript)

    // Auto-populate form fields
    if (parsed.title) setTitle(parsed.title)
    if (parsed.priority) setPriority(parsed.priority)
    if (parsed.dueDate) setDueDate(parsed.dueDate)
    if (parsed.description) setNotes(parsed.description)
  }

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      try {
        await createTask(projectId, formData)
        setIsOpen(false)
        setLimitMessage(null)
        setTitle('')
        setPriority('medium')
        setDueDate('')
        setNotes('')
        if (onSuccess) {
          onSuccess()
        }
      } catch (error) {
        const msg = isLimitError(error)
        if (msg) {
          setLimitMessage(msg)
        }
      }
    })
  }

  if (!isOpen) {
    return (
      <>
        {limitMessage && (
          <UpgradePrompt message={limitMessage} onDismiss={() => setLimitMessage(null)} />
        )}
        <Button onClick={() => setIsOpen(true)}>
          + Add Task
        </Button>
      </>
    )
  }

  return (
    <form action={handleSubmit} className="space-y-3  border border-border bg-muted/50 p-4">
      {limitMessage && (
        <UpgradePrompt message={limitMessage} onDismiss={() => setLimitMessage(null)} />
      )}
      <div className="flex items-start gap-2">
        <Input
          id="title"
          name="title"
          placeholder="Task title..."
          required
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1"
        />
        <VoiceInput
          onTranscript={handleVoiceInput}
          placeholder="Speak to create task"
        />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Select
          id="priority"
          name="priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          options={[
            { value: 'low', label: 'Low Priority' },
            { value: 'medium', label: 'Medium Priority' },
            { value: 'high', label: 'High Priority' },
          ]}
          className="w-full sm:flex-1"
        />
      </div>
      <DatePicker
        id="dueDate"
        name="dueDate"
        label="Due Date"
        value={dueDate}
        onChange={setDueDate}
      />
      <Textarea
        id="notes"
        name="notes"
        placeholder="Add notes (optional)..."
        rows={2}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? 'Adding...' : 'Add Task'}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setIsOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
