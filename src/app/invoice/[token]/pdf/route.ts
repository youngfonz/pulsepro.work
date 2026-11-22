import { getInvoiceByToken } from '@/actions/invoices'
import { buildInvoicePdf, invoicePdfFilename } from '@/lib/invoice-pdf'

export const dynamic = 'force-dynamic'

// Public download for the client, authorised by the share token like the page itself.
export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const invoice = await getInvoiceByToken(token)
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
