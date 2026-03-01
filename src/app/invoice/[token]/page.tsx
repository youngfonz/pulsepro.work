import { getInvoiceByToken } from '@/actions/invoices'
import { notFound } from 'next/navigation'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ token: string }>
}

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

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

export default async function PublicInvoicePage({ params }: Props) {
  const { token } = await params
  const invoice = await getInvoiceByToken(token)

  if (!invoice) {
    notFound()
  }

  const taxAmount = invoice.subtotal * (invoice.taxRate / 100)
  const isPaid = invoice.status === 'paid'

  return (
    <div className="min-h-screen bg-white text-gray-900 print:p-0">
      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
        }
      `}</style>

      {/* Top bar with print button — not shown when printing */}
      <div className="no-print border-b border-gray-200 bg-white">
        <div className="max-w-3xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {invoice.fromName && (
              <span className="text-sm font-semibold text-gray-900">{invoice.fromName}</span>
            )}
          </div>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md px-3 py-1.5 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z"
              />
            </svg>
            Print
          </button>
        </div>
      </div>

      {/* Invoice content */}
      <div className="max-w-3xl mx-auto p-8 print:p-0">
        <div className="relative space-y-8">
          {/* Paid watermark */}
          {isPaid && (
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
              aria-hidden="true"
            >
              <span
                className="text-emerald-500/20 font-black text-[10rem] leading-none select-none"
                style={{ transform: 'rotate(-30deg)', letterSpacing: '-0.02em' }}
              >
                PAID
              </span>
            </div>
          )}

          {/* Header row */}
          <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
            {/* From info */}
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                From
              </p>
              {invoice.fromName ? (
                <p className="text-base font-semibold text-gray-900">{invoice.fromName}</p>
              ) : (
                <p className="text-sm text-gray-400 italic">Business</p>
              )}
              {invoice.fromEmail && (
                <p className="text-sm text-gray-500">{invoice.fromEmail}</p>
              )}
              {invoice.fromAddress && (
                <p className="text-sm text-gray-500 whitespace-pre-line">{invoice.fromAddress}</p>
              )}
            </div>

            {/* Invoice meta */}
            <div className="sm:text-right space-y-1">
              <p className="text-2xl font-bold text-gray-900">{invoice.number}</p>
              <span
                className={[
                  'inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium border',
                  invoice.status === 'paid'
                    ? 'border-emerald-300 text-emerald-700 bg-emerald-50'
                    : invoice.status === 'overdue'
                    ? 'border-rose-300 text-rose-700 bg-rose-50'
                    : invoice.status === 'sent'
                    ? 'border-blue-300 text-blue-700 bg-blue-50'
                    : 'border-gray-300 text-gray-600 bg-gray-50',
                ].join(' ')}
              >
                {statusLabel(invoice.status)}
              </span>
              {invoice.project && (
                <p className="text-sm text-gray-500 pt-1">{invoice.project.name}</p>
              )}
              <div className="text-sm text-gray-500 pt-1 space-y-0.5">
                <p>
                  <span className="font-medium text-gray-700">Issued:</span>{' '}
                  {formatDate(invoice.issueDate)}
                </p>
                <p>
                  <span className="font-medium text-gray-700">Due:</span>{' '}
                  {formatDate(invoice.dueDate)}
                </p>
                {invoice.paidAt && (
                  <p>
                    <span className="font-medium text-gray-700">Paid:</span>{' '}
                    {formatDate(invoice.paidAt)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200" />

          {/* Bill to */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Bill To
            </p>
            <p className="text-sm font-semibold text-gray-900">{invoice.client.name}</p>
            {invoice.client.email && (
              <p className="text-sm text-gray-500">{invoice.client.email}</p>
            )}
            {invoice.client.company && (
              <p className="text-sm text-gray-500">{invoice.client.company}</p>
            )}
          </div>

          {/* Line items table */}
          <div className="overflow-x-auto -mx-2">
            <table className="w-full min-w-[500px] text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3 px-2 text-left font-semibold text-gray-400 text-xs uppercase tracking-wider">
                    Description
                  </th>
                  <th className="py-3 px-2 text-right font-semibold text-gray-400 text-xs uppercase tracking-wider w-20">
                    Qty
                  </th>
                  <th className="py-3 px-2 text-right font-semibold text-gray-400 text-xs uppercase tracking-wider w-24">
                    Rate
                  </th>
                  <th className="py-3 px-2 text-right font-semibold text-gray-400 text-xs uppercase tracking-wider w-28">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoice.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 px-2 text-gray-900">{item.description}</td>
                    <td className="py-3 px-2 text-right tabular-nums text-gray-500">
                      {item.quantity.toFixed(2)}
                    </td>
                    <td className="py-3 px-2 text-right tabular-nums text-gray-500">
                      {fmt(item.rate)}
                    </td>
                    <td className="py-3 px-2 text-right tabular-nums text-gray-900 font-medium">
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
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span className="tabular-nums">{fmt(invoice.subtotal)}</span>
              </div>
              {invoice.taxRate > 0 && (
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Tax ({invoice.taxRate}%)</span>
                  <span className="tabular-nums">{fmt(taxAmount)}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold text-gray-900">
                <span>Total</span>
                <span className="tabular-nums text-lg">{fmt(invoice.total)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <>
              <div className="border-t border-gray-200" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                  Notes
                </p>
                <p className="text-sm text-gray-500 whitespace-pre-line">{invoice.notes}</p>
              </div>
            </>
          )}

          {/* Footer */}
          <div className="border-t border-gray-100 pt-6 text-center">
            <p className="text-xs text-gray-400">Thank you for your business.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
