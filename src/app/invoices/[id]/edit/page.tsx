import { getInvoice, getClientsForInvoice, getNextInvoiceNumber } from '@/actions/invoices'
import { Card, CardContent } from '@/components/ui/Card'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { InvoiceForm } from '../../new/InvoiceForm'

export const dynamic = 'force-dynamic'

export default async function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [invoice, clients, nextNumber] = await Promise.all([
    getInvoice(id),
    getClientsForInvoice(),
    getNextInvoiceNumber(),
  ])

  if (!invoice) notFound()
  if (invoice.status !== 'draft') redirect(`/invoices/${id}`)

  const invoiceData = {
    id: invoice.id,
    number: invoice.number,
    dueDate: invoice.dueDate,
    taxRate: invoice.taxRate,
    notes: invoice.notes,
    fromName: invoice.fromName,
    fromEmail: invoice.fromEmail,
    fromAddress: invoice.fromAddress,
    clientId: invoice.client.id,
    projectId: invoice.project?.id ?? null,
    items: invoice.items.map(i => ({
      description: i.description,
      quantity: i.quantity,
      rate: i.rate,
    })),
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <Link
          href={`/invoices/${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Invoice
        </Link>
        <h1 className="mt-2 text-xl md:text-2xl font-bold text-foreground">Edit {invoice.number}</h1>
      </div>

      <Card>
        <CardContent className="py-6">
          <InvoiceForm clients={clients} nextNumber={nextNumber} invoice={invoiceData} />
        </CardContent>
      </Card>
    </div>
  )
}
