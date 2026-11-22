'use client'

import { useTransition, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { sendInvoice, markInvoicePaid, deleteInvoice } from '@/actions/invoices'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'

interface InvoiceDetailProps {
  invoice: {
    id: string
    number: string
    status: string
    issueDate: Date
    dueDate: Date
    taxRate: number
    notes: string | null
    fromName: string | null
    fromEmail: string | null
    fromAddress: string | null
    shareToken: string
    paidAt: Date | null
    subtotal: number
    total: number
    client: { id: string; name: string; email: string | null; company: string | null }
    project: { id: string; name: string } | null
    items: { id: string; description: string; quantity: number; rate: number; amount: number }[]
  }
}

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

function statusBadgeVariant(status: string): 'default' | 'info' | 'success' | 'danger' {
  switch (status) {
    case 'sent':
      return 'info'
    case 'paid':
      return 'success'
    case 'overdue':
      return 'danger'
    default:
      return 'default'
  }
}

function statusLabel(status: string): string {
  switch (status) {
    case 'draft':
      return 'Draft'
    case 'sent':
      return 'Sent'
    case 'paid':
      return 'Paid'
    case 'overdue':
      return 'Overdue'
    default:
      return status.charAt(0).toUpperCase() + status.slice(1)
  }
}

export function InvoiceDetail({ invoice }: InvoiceDetailProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [copied, setCopied] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  const handleSend = () => {
    startTransition(async () => {
      try {
        const result = await sendInvoice(invoice.id)
        if (!result.ok) return showToast(result.error)
        router.refresh()
        showToast('Invoice sent successfully')
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'Failed to send invoice')
      }
    })
  }

  const handleMarkPaid = () => {
    startTransition(async () => {
      try {
        const result = await markInvoicePaid(invoice.id)
        if (!result.ok) return showToast(result.error)
        router.refresh()
        showToast('Invoice marked as paid')
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'Failed to mark as paid')
      }
    })
  }

  const handleDelete = () => {
    if (!confirm('Delete this invoice? This cannot be undone.')) return
    startTransition(async () => {
      try {
        const result = await deleteInvoice(invoice.id)
        if (!result.ok) return showToast(result.error)
        router.push('/invoices')
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'Failed to delete invoice')
      }
    })
  }

  const handleCopyLink = () => {
    const url = `${window.location.origin}/invoice/${invoice.shareToken}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      showToast('Link copied!')
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const taxAmount = invoice.subtotal * (invoice.taxRate / 100)

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; padding: 40px; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Toast */}
      {toast && (
        <div className="no-print fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-foreground text-background text-sm px-4 py-2 rounded-lg shadow-lg pointer-events-none">
          {toast}
        </div>
      )}

      <div className="space-y-4 md:space-y-6">
        {/* Top bar */}
        <div className="no-print flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/invoices"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Invoices
            </Link>
            <Badge variant={statusBadgeVariant(invoice.status)}>
              {statusLabel(invoice.status)}
            </Badge>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <a
              href={`/invoices/${invoice.id}/pdf`}
              download
              className="inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-secondary text-secondary-foreground hover:bg-secondary/80 h-7 px-2.5 text-xs"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Download PDF
            </a>
            {invoice.status === 'draft' && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => router.push(`/invoices/${invoice.id}/edit`)}
                >
                  Edit
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSend}
                  disabled={isPending}
                >
                  {isPending ? 'Sending...' : 'Send Invoice'}
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isPending}
                >
                  Delete
                </Button>
              </>
            )}

            {invoice.status === 'sent' && (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleMarkPaid}
                  disabled={isPending}
                >
                  {isPending ? 'Updating...' : 'Mark Paid'}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleSend}
                  disabled={isPending}
                >
                  {isPending ? 'Sending...' : 'Resend'}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCopyLink}
                  disabled={copied}
                >
                  {copied ? 'Copied!' : 'Copy Share Link'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.print()}
                >
                  Print
                </Button>
              </>
            )}

            {invoice.status === 'paid' && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCopyLink}
                  disabled={copied}
                >
                  {copied ? 'Copied!' : 'Copy Share Link'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.print()}
                >
                  Print
                </Button>
              </>
            )}

            {invoice.status === 'overdue' && (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleMarkPaid}
                  disabled={isPending}
                >
                  {isPending ? 'Updating...' : 'Mark Paid'}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleSend}
                  disabled={isPending}
                >
                  {isPending ? 'Sending...' : 'Resend'}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCopyLink}
                  disabled={copied}
                >
                  {copied ? 'Copied!' : 'Copy Share Link'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.print()}
                >
                  Print
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Invoice body */}
        <div className="print-area bg-card border border-border rounded-lg p-8 md:p-10 space-y-8">
          {/* Header row */}
          <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
            {/* From info */}
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                From
              </p>
              {invoice.fromName ? (
                <p className="text-base font-semibold text-foreground">{invoice.fromName}</p>
              ) : (
                <p className="text-sm text-muted-foreground italic">No business name set</p>
              )}
              {invoice.fromEmail && (
                <p className="text-sm text-muted-foreground">{invoice.fromEmail}</p>
              )}
              {invoice.fromAddress && (
                <p className="text-sm text-muted-foreground whitespace-pre-line">{invoice.fromAddress}</p>
              )}
            </div>

            {/* Invoice meta */}
            <div className="sm:text-right space-y-1">
              <p className="text-2xl font-bold text-foreground">{invoice.number}</p>
              <div className="flex items-center gap-2 sm:justify-end">
                <Badge variant={statusBadgeVariant(invoice.status)}>
                  {statusLabel(invoice.status)}
                </Badge>
              </div>
              {invoice.project && (
                <p className="text-sm text-muted-foreground">{invoice.project.name}</p>
              )}
              <div className="text-sm text-muted-foreground pt-1 space-y-0.5">
                <p>
                  <span className="font-medium text-foreground">Issued:</span>{' '}
                  {formatDate(invoice.issueDate)}
                </p>
                <p>
                  <span className="font-medium text-foreground">Due:</span>{' '}
                  {formatDate(invoice.dueDate)}
                </p>
                {invoice.paidAt && (
                  <p>
                    <span className="font-medium text-foreground">Paid:</span>{' '}
                    {formatDate(invoice.paidAt)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Bill to */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Bill To
            </p>
            <p className="text-sm font-semibold text-foreground">{invoice.client.name}</p>
            {invoice.client.email && (
              <p className="text-sm text-muted-foreground">{invoice.client.email}</p>
            )}
            {invoice.client.company && (
              <p className="text-sm text-muted-foreground">{invoice.client.company}</p>
            )}
          </div>

          {/* Line items table */}
          <div className="overflow-x-auto -mx-2">
            <table className="w-full min-w-[500px] text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-3 px-2 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                    Description
                  </th>
                  <th className="py-3 px-2 text-right font-semibold text-muted-foreground text-xs uppercase tracking-wider w-20">
                    Qty
                  </th>
                  <th className="py-3 px-2 text-right font-semibold text-muted-foreground text-xs uppercase tracking-wider w-24">
                    Rate
                  </th>
                  <th className="py-3 px-2 text-right font-semibold text-muted-foreground text-xs uppercase tracking-wider w-28">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {invoice.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 px-2 text-foreground">{item.description}</td>
                    <td className="py-3 px-2 text-right tabular-nums text-muted-foreground">
                      {item.quantity.toFixed(2)}
                    </td>
                    <td className="py-3 px-2 text-right tabular-nums text-muted-foreground">
                      {fmt(item.rate)}
                    </td>
                    <td className="py-3 px-2 text-right tabular-nums text-foreground font-medium">
                      {fmt(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-full max-w-xs space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span className="tabular-nums">{fmt(invoice.subtotal)}</span>
              </div>
              {invoice.taxRate > 0 && (
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Tax ({invoice.taxRate}%)</span>
                  <span className="tabular-nums">{fmt(taxAmount)}</span>
                </div>
              )}
              <div className="border-t border-border pt-2 flex justify-between font-semibold text-foreground">
                <span>Total</span>
                <span className="tabular-nums text-lg">{fmt(invoice.total)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <>
              <div className="border-t border-border" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  Notes
                </p>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{invoice.notes}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
