'use client'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { VoiceInput } from '@/components/ui/VoiceInput'
import { DatePicker } from '@/components/ui/DatePicker'
import { UpgradePrompt, isLimitError } from '@/components/ui/UpgradePrompt'
import { createProject, updateProject } from '@/actions/projects'
import { createClient } from '@/actions/clients'
import { parseProjectFromVoice } from '@/lib/voice'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

interface Project {
  id: string
  name: string
  description: string | null
  notes: string | null
  status: string
  priority: string
  dueDate: Date | null
  budget: number | null
  hourlyRate: number | null
  clientId: string
}

interface Client {
  id: string
  name: string
}

interface ProjectFormProps {
  project?: Project
  clients: Client[]
  defaultClientId?: string
  onSuccess?: () => void
}

export function ProjectForm({ project, clients, defaultClientId, onSuccess }: ProjectFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [limitMessage, setLimitMessage] = useState<string | null>(null)

  const formatDateForInput = (date: Date | null) => {
    if (!date) return ''
    return new Date(date).toISOString().split('T')[0]
  }

  // Controlled form state for voice input
  const [name, setName] = useState(project?.name || '')
  const [description, setDescription] = useState(project?.description || '')
  const [priority, setPriority] = useState(project?.priority || 'medium')
  const [dueDate, setDueDate] = useState(formatDateForInput(project?.dueDate || null))
  const [budget, setBudget] = useState(project?.budget?.toString() || '')
  const [hourlyRate, setHourlyRate] = useState(project?.hourlyRate?.toString() || '')
  const [clientId, setClientId] = useState(project?.clientId || defaultClientId || '')
  const [isNewClient, setIsNewClient] = useState(false)
  const [newClientName, setNewClientName] = useState('')
  const [clientList, setClientList] = useState(clients)

  const handleVoiceInput = (transcript: string) => {
    const parsed = parseProjectFromVoice(transcript)

    // Auto-populate form fields
    if (parsed.name) setName(parsed.name)
    if (parsed.description) setDescription(parsed.description)
    if (parsed.priority) setPriority(parsed.priority)
    if (parsed.dueDate) setDueDate(parsed.dueDate)
    if (parsed.budget) setBudget(parsed.budget.toString())
  }

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      try {
        // Create inline client first if needed
        if (isNewClient && newClientName.trim()) {
          const clientFormData = new FormData()
          clientFormData.append('name', newClientName.trim())
          const newClient = await createClient(clientFormData)
          formData.set('clientId', newClient.id)
        }

        if (project) {
          await updateProject(project.id, formData)
        } else {
          await createProject(formData)
        }
        setLimitMessage(null)
        if (onSuccess) {
          onSuccess()
        } else {
          router.push('/projects')
        }
      } catch (error) {
        const msg = isLimitError(error)
        if (msg) {
          setLimitMessage(msg)
        }
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {limitMessage && (
        <UpgradePrompt message={limitMessage} onDismiss={() => setLimitMessage(null)} />
      )}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
          Project Name *
        </label>
        <div className="flex items-start gap-2">
          <Input
            id="name"
            name="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Project name"
            className="flex-1"
          />
          <VoiceInput
            onTranscript={handleVoiceInput}
            placeholder="Speak to create project"
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
        placeholder="Project description..."
      />
      <Textarea
        id="notes"
        name="notes"
        label="Notes"
        rows={4}
        defaultValue={project?.notes || ''}
        placeholder="Add any additional notes..."
      />
      {isNewClient ? (
        <div>
          <label htmlFor="newClientName" className="block text-sm font-medium text-foreground mb-1">
            New Client Name *
          </label>
          <div className="flex items-start gap-2">
            <Input
              id="newClientName"
              required
              value={newClientName}
              onChange={(e) => setNewClientName(e.target.value)}
              placeholder="Client name"
              className="flex-1"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsNewClient(false)
                setNewClientName('')
              }}
              className="shrink-0"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Select
          id="clientId"
          name="clientId"
          label="Client *"
          required
          value={clientId}
          onChange={(e) => {
            if (e.target.value === '__new__') {
              setIsNewClient(true)
              setClientId('')
            } else {
              setClientId(e.target.value)
            }
          }}
          options={[
            { value: '', label: 'Select a client...' },
            ...clientList.map((c) => ({ value: c.id, label: c.name })),
            { value: '__new__', label: '+ New client' },
          ]}
        />
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select
          id="status"
          name="status"
          label="Status"
          defaultValue={project?.status || 'not_started'}
          options={[
            { value: 'not_started', label: 'Not Started' },
            { value: 'in_progress', label: 'In Progress' },
            { value: 'on_hold', label: 'On Hold' },
            { value: 'completed', label: 'Completed' },
          ]}
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
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <DatePicker
          id="dueDate"
          name="dueDate"
          label="Due Date"
          value={dueDate}
          onChange={setDueDate}
        />
        <Input
          id="budget"
          name="budget"
          type="number"
          step="0.01"
          min="0"
          label="Budget ($)"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          placeholder="0.00"
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          id="hourlyRate"
          name="hourlyRate"
          type="number"
          step="0.01"
          min="0"
          label="Hourly Rate ($)"
          value={hourlyRate}
          onChange={(e) => setHourlyRate(e.target.value)}
          placeholder="0.00"
        />
      </div>
      <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row">
        <Button type="button" variant="secondary" onClick={() => router.back()} className="w-full sm:w-auto">
          Cancel
        </Button>
        <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
          {isPending ? 'Saving...' : project ? 'Update Project' : 'Create Project'}
        </Button>
      </div>
    </form>
  )
}
