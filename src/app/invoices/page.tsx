import Link from 'next/link'
import { getInvoices, getClientsForInvoice } from '@/actions/invoices'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { InvoicesFilter } from './InvoicesFilter'
import { InvoicesList } from './InvoicesList'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{ status?: string; clientId?: string }>
}

export default async function InvoicesPage({ searchParams }: Props) {
  const params = await searchParams
  const [invoices, clients] = await Promise.all([
    getInvoices(params),
    getClientsForInvoice(),
  ])

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="mt-2 text-xl md:text-2xl font-bold text-foreground">Invoices</h1>
        </div>
        <Link href="/invoices/new">
          <Button className="w-full sm:w-auto flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Invoice
          </Button>
        </Link>
      </div>

      <InvoicesFilter clients={clients} />

      <Card>
        <CardContent className="p-6">
          <InvoicesList invoices={invoices} />
        </CardContent>
      </Card>
    </div>
  )
}
