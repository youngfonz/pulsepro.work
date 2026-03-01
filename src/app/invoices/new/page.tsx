import { getClientsForInvoice, getNextInvoiceNumber } from '@/actions/invoices'
import { Card, CardContent } from '@/components/ui/Card'
import Link from 'next/link'
import { InvoiceForm } from './InvoiceForm'

export const dynamic = 'force-dynamic'

export default async function NewInvoicePage() {
  const [clients, nextNumber] = await Promise.all([
    getClientsForInvoice(),
    getNextInvoiceNumber(),
  ])

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <Link
          href="/invoices"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Invoices
        </Link>
        <h1 className="mt-2 text-xl md:text-2xl font-bold text-foreground">New Invoice</h1>
      </div>

      <Card>
        <CardContent className="py-6">
          <InvoiceForm clients={clients} nextNumber={nextNumber} />
        </CardContent>
      </Card>
    </div>
  )
}
