'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { ImageUpload } from '@/components/ui/ImageUpload'
import { VoiceInput } from '@/components/ui/VoiceInput'
import { UpgradePrompt, isLimitError } from '@/components/ui/UpgradePrompt'
import { createClient, updateClient } from '@/actions/clients'
import { parseClientFromVoice } from '@/lib/voice'
import { useRouter } from 'next/navigation'

interface Client {
  id: string
  name: string
  email: string | null
  phone: string | null
  company: string | null
  logo: string | null
  status: string
  notes: string | null
}

interface ClientFormProps {
  client?: Client
  onSuccess?: () => void
}

export function ClientForm({ client, onSuccess }: ClientFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [logo, setLogo] = useState<string | null>(client?.logo || null)
  const [limitMessage, setLimitMessage] = useState<string | null>(null)
  const [name, setName] = useState(client?.name || '')
  const [email, setEmail] = useState(client?.email || '')
  const [phone, setPhone] = useState(client?.phone || '')
  const [company, setCompany] = useState(client?.company || '')

  const handleVoiceInput = (transcript: string) => {
    const parsed = parseClientFromVoice(transcript)
    if (parsed.name) setName(parsed.name)
    if (parsed.email) setEmail(parsed.email)
    if (parsed.phone) setPhone(parsed.phone)
    if (parsed.company) setCompany(parsed.company)
  }

  const handleSubmit = async (formData: FormData) => {
    if (logo) {
      formData.set('logo', logo)
    } else {
      formData.delete('logo')
    }

    startTransition(async () => {
      try {
        if (client) {
          await updateClient(client.id, formData)
        } else {
          await createClient(formData)
        }
        setLimitMessage(null)
        if (onSuccess) {
          onSuccess()
        } else {
          router.push('/clients')
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
      <ImageUpload
        value={logo}
        onChange={setLogo}
        type="clients"
        label="Logo"
        aspect="square"
      />
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
          Name *
        </label>
        <div className="flex items-start gap-2">
          <Input
            id="name"
            name="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Client name"
            className="flex-1"
          />
          <VoiceInput
            onTranscript={handleVoiceInput}
            placeholder="Speak to add client"
          />
        </div>
      </div>
      <Input
        id="email"
        name="email"
        type="email"
        label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="client@example.com"
      />
      <Input
        id="phone"
        name="phone"
        label="Phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="+1 (555) 000-0000"
      />
      <Input
        id="company"
        name="company"
        label="Company"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
        placeholder="Company name"
      />
      <Select
        id="status"
        name="status"
        label="Status"
        defaultValue={client?.status || 'active'}
        options={[
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' },
        ]}
      />
      <Textarea
        id="notes"
        name="notes"
        label="Notes"
        rows={3}
        defaultValue={client?.notes || ''}
        placeholder="Additional notes..."
      />
      <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row">
        <Button type="button" variant="secondary" onClick={() => router.back()} className="w-full sm:w-auto">
          Cancel
        </Button>
        <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
          {isPending ? 'Saving...' : client ? 'Update Client' : 'Create Client'}
        </Button>
      </div>
    </form>
  )
}
