import { getInvoice } from '@/actions/invoices'
import { buildInvoicePdf, invoicePdfFilename } from '@/lib/invoice-pdf'

export const dynamic = 'force-dynamic'

// Owner download. getInvoice() scopes the lookup to the signed-in user.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const invoice = await getInvoice(id)
  if (!invoice) return new Response('Invoice not found', { status: 404 })

  const bytes = await buildInvoicePdf(invoice)

  return new Response(Buffer.from(bytes), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${invoicePdfFilename(invoice.number)}"`,
      'Cache-Control': 'private, no-store',
    },
  })
}
