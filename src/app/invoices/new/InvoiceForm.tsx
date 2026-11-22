'use client'

import { useEffect, useTransition, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { DatePicker } from '@/components/ui/DatePicker'
import { createInvoice, updateInvoice, sendInvoice, getTimeEntriesForImport } from '@/actions/invoices'

interface Client {
  id: string
  name: string
  projects: { id: string; name: string; hourlyRate: number | null }[]
}

interface ExistingInvoice {
  id: string
  number: string
  dueDate: Date
  taxRate: number
  notes: string | null
  fromName: string | null
  fromEmail: string | null
  fromAddress: string | null
  clientId: string
  projectId: string | null
  items: { description: string; quantity: number; rate: number }[]
}

interface InvoiceFormProps {
  clients: Client[]
  nextNumber: string
  invoice?: ExistingInvoice
}

interface LineItem {
  description: string
  quantity: number
  rate: number
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)

const SECTION_LABEL = 'text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3'
const SECTION_DIVIDER = 'border-t border-border pt-6 mt-6'

export function InvoiceForm({ clients, nextNumber, invoice }: InvoiceFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const isEdit = !!invoice

  // Invoice header
  const [dueDate, setDueDate] = useState(
    invoice ? new Date(invoice.dueDate).toISOString().split('T')[0] : ''
  )

  // From (business info)
  const [fromName, setFromName] = useState(invoice?.fromName ?? '')
  const [fromEmail, setFromEmail] = useState(invoice?.fromEmail ?? '')
  const [fromAddress, setFromAddress] = useState(invoice?.fromAddress ?? '')

  // Bill To
  const [clientId, setClientId] = useState(invoice?.clientId ?? '')
  const [projectId, setProjectId] = useState(invoice?.projectId ?? '')

  // Line items
  const [items, setItems] = useState<LineItem[]>(
    invoice?.items?.length
      ? invoice.items.map(i => ({ description: i.description, quantity: i.quantity, rate: i.rate }))
      : [{ description: '', quantity: 1, rate: 0 }]
  )

  // Totals
  const [taxRate, setTaxRate] = useState(invoice?.taxRate ?? 0)

  // Notes
  const [notes, setNotes] = useState(invoice?.notes ?? '')

  // Import state
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Pre-fill business info from localStorage on mount (skip for edit mode)
  useEffect(() => {
    if (isEdit) return
    try {
      const stored = localStorage.getItem('invoiceBusinessInfo')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed.fromName) setFromName(parsed.fromName)
        if (parsed.fromEmail) setFromEmail(parsed.fromEmail)
        if (parsed.fromAddress) setFromAddress(parsed.fromAddress)
      }
    } catch {
      // ignore malformed localStorage data
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Derived values
  const selectedClient = clients.find((c) => c.id === clientId)
  const availableProjects = selectedClient?.projects ?? []
  const selectedProject = availableProjects.find((p) => p.id === projectId)
  const showImportButton = !!(projectId && selectedProject?.hourlyRate)

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.rate, 0)
  const taxAmount = subtotal * (taxRate / 100)
  const total = subtotal + taxAmount

  // Client change resets project
  function handleClientChange(newClientId: string) {
    setClientId(newClientId)
    setProjectId('')
  }

  // Line item helpers
  function updateItem(index: number, field: keyof LineItem, value: string | number) {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    )
  }

  function addItem() {
    setItems((prev) => [...prev, { description: '', quantity: 1, rate: 0 }])
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  // Import time entries
  async function handleImportTimeEntries() {
    if (!projectId || !selectedProject?.hourlyRate) return
    setIsImporting(true)
    setError(null)
    try {
      const { entries, hourlyRate } = await getTimeEntriesForImport(projectId)
      const rate = hourlyRate ?? 0
      const newItems: LineItem[] = entries.map((entry) => {
        const dateStr = new Date(entry.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
        return {
          description: entry.description || `Time entry - ${dateStr}`,
          quantity: entry.hours,
          rate,
        }
      })
      setItems((prev) => [...prev, ...newItems])
    } catch {
      setError('Failed to import time entries. Please try again.')
    } finally {
      setIsImporting(false)
    }
  }

  // Persist business info to localStorage and submit
  function persistBusinessInfo() {
    try {
      localStorage.setItem(
        'invoiceBusinessInfo',
        JSON.stringify({ fromName, fromEmail, fromAddress })
      )
    } catch {
      // ignore
    }
  }

  function buildInvoiceData() {
    return {
      clientId,
      projectId: projectId || undefined,
      dueDate,
      taxRate,
      notes: notes || undefined,
      fromName: fromName || undefined,
      fromEmail: fromEmail || undefined,
      fromAddress: fromAddress || undefined,
      items: items
        .filter((i) => i.description && i.quantity > 0 && i.rate > 0)
        .map((i) => ({
          description: i.description,
          quantity: i.quantity,
          rate: i.rate,
        })),
    }
  }

  function handleSaveDraft() {
    setError(null)
    persistBusinessInfo()
    startTransition(async () => {
      try {
        if (isEdit) {
          const saved = await updateInvoice(invoice.id, buildInvoiceData())
          if (!saved.ok) return setError(saved.error)
          router.push(`/invoices/${invoice.id}`)
        } else {
          const created = await createInvoice(buildInvoiceData())
          if (!created.ok) return setError(created.error)
          router.push(`/invoices/${created.invoice.id}`)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save invoice.')
      }
    })
  }

  function handleSaveAndSend() {
    setError(null)
    persistBusinessInfo()
    startTransition(async () => {
      try {
        if (isEdit) {
          const saved = await updateInvoice(invoice.id, buildInvoiceData())
          if (!saved.ok) return setError(saved.error)
          const sent = await sendInvoice(invoice.id)
          if (!sent.ok) return setError(sent.error)
          router.push(`/invoices/${invoice.id}`)
        } else {
          const created = await createInvoice(buildInvoiceData())
          if (!created.ok) return setError(created.error)
          const sent = await sendInvoice(created.invoice.id)
          if (!sent.ok) return setError(sent.error)
          router.push(`/invoices/${created.invoice.id}`)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save and send invoice.')
      }
    })
  }

  const clientOptions = [
    { value: '', label: 'Select a client...' },
    ...clients.map((c) => ({ value: c.id, label: c.name })),
  ]

  const projectOptions = [
    { value: '', label: 'No project' },
    ...availableProjects.map((p) => ({ value: p.id, label: p.name })),
  ]

  return (
    <div className="space-y-0">
      {/* Section 1: Invoice Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <p className={SECTION_LABEL}>Invoice Number</p>
          <p className="text-lg font-semibold text-foreground font-mono">{isEdit ? invoice.number : nextNumber}</p>
        </div>
        <div>
          <p className={SECTION_LABEL}>Due Date <span className="text-destructive">*</span></p>
          <DatePicker
            value={dueDate}
            onChange={setDueDate}
            placeholder="Pick a due date"
          />
        </div>
      </div>

      {/* Section 2: From (Your Business) */}
      <div className={SECTION_DIVIDER}>
        <p className={SECTION_LABEL}>From — Your Business</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Business Name"
            value={fromName}
            onChange={(e) => setFromName(e.target.value)}
            placeholder="Acme Studio LLC"
          />
          <Input
            label="Email"
            type="email"
            value={fromEmail}
            onChange={(e) => setFromEmail(e.target.value)}
            placeholder="billing@acme.studio"
          />
          <div className="sm:col-span-2">
            <Textarea
              label="Address"
              value={fromAddress}
              onChange={(e) => setFromAddress(e.target.value)}
              placeholder="123 Main St, Suite 100&#10;New York, NY 10001"
              rows={2}
            />
          </div>
        </div>
      </div>

      {/* Section 3: Bill To */}
      <div className={SECTION_DIVIDER}>
        <p className={SECTION_LABEL}>Bill To</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {clients.length === 0 ? (
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1">Client <span className="text-destructive">*</span></label>
              <a
                href="/clients?add=true"
                className="flex items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:border-muted-foreground/50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add a client to get started
              </a>
            </div>
          ) : (
          <Select
            label="Client"
            required
            value={clientId}
            onChange={(e) => handleClientChange(e.target.value)}
            options={clientOptions}
          />
          )}
          {clients.length > 0 && (
            <div className="space-y-1">
              <Select
                label="Project (optional)"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                options={projectOptions}
                disabled={!clientId}
              />
              {showImportButton && (
                <button
                  type="button"
                  onClick={handleImportTimeEntries}
                  disabled={isImporting}
                  className="text-xs text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
                >
                  {isImporting ? 'Importing...' : 'Import Time Entries'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Section 4: Line Items */}
      <div className={SECTION_DIVIDER}>
        <p className={SECTION_LABEL}>Line Items</p>
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-2 text-left font-medium text-muted-foreground pr-3">Description</th>
                <th className="pb-2 text-right font-medium text-muted-foreground w-24 pr-3">Qty</th>
                <th className="pb-2 text-right font-medium text-muted-foreground w-28 pr-3">Rate</th>
                <th className="pb-2 text-right font-medium text-muted-foreground w-28 pr-3">Amount</th>
                <th className="pb-2 w-8" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item, index) => {
                const amount = item.quantity * item.rate
                return (
                  <tr key={index}>
                    <td className="py-2 pr-3">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        placeholder="Service description"
                        className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        type="number"
                        min="0"
                        step="0.25"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-24 rounded-md border border-input bg-background px-2 py-1.5 text-sm text-right text-foreground focus:border-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
                      />
                    </td>
                    <td className="py-2 pr-3">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.rate}
                        onChange={(e) => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                        className="w-28 rounded-md border border-input bg-background px-2 py-1.5 text-sm text-right text-foreground focus:border-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
                      />
                    </td>
                    <td className="py-2 pr-3 text-right tabular-nums text-foreground">
                      {formatCurrency(amount)}
                    </td>
                    <td className="py-2">
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        disabled={items.length === 1}
                        className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label="Remove line item"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addItem}
            className="gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Line Item
          </Button>
        </div>
      </div>

      {/* Section 5: Totals */}
      <div className={SECTION_DIVIDER}>
        <div className="flex flex-col items-end gap-2 text-sm">
          <div className="flex justify-between w-full sm:w-64 gap-4">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="tabular-nums text-foreground">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between w-full sm:w-64 gap-4">
            <span className="text-muted-foreground shrink-0">Tax Rate</span>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                className="w-20 rounded-md border border-input bg-background px-2 py-1 text-sm text-right text-foreground focus:border-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
              />
              <span className="text-muted-foreground">%</span>
            </div>
          </div>
          {taxRate > 0 && (
            <div className="flex justify-between w-full sm:w-64 gap-4">
              <span className="text-muted-foreground">Tax</span>
              <span className="tabular-nums text-foreground">{formatCurrency(taxAmount)}</span>
            </div>
          )}
          <div className="flex justify-between w-full sm:w-64 gap-4 border-t border-border pt-2 mt-1">
            <span className="text-lg font-bold text-foreground">Total</span>
            <span className="text-lg font-bold tabular-nums text-foreground">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {/* Section 6: Notes */}
      <div className={SECTION_DIVIDER}>
        <p className={SECTION_LABEL}>Notes</p>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Payment terms, bank details, or any additional notes for the client..."
          rows={3}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Actions */}
      {(!clientId || !dueDate) && (
        <p className="text-xs text-muted-foreground text-right pt-4">
          {!clientId && !dueDate
            ? 'Client and due date are required.'
            : !clientId
            ? 'Client is required.'
            : 'Due date is required.'}
        </p>
      )}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-6 mt-6 border-t border-border">
        <Button
          type="button"
          variant="secondary"
          size="lg"
          onClick={handleSaveDraft}
          disabled={isPending || !clientId || !dueDate}
          className="w-full sm:w-auto"
        >
          {isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Save Draft'}
        </Button>
        <Button
          type="button"
          variant="primary"
          size="lg"
          onClick={handleSaveAndSend}
          disabled={isPending || !clientId || !dueDate}
          className="w-full sm:w-auto"
        >
          {isPending ? 'Saving...' : isEdit ? 'Save & Send' : 'Save & Send'}
        </Button>
      </div>
    </div>
  )
}
