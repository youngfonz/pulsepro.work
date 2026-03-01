import { getInvoice } from '@/actions/invoices'
import { notFound } from 'next/navigation'
import { InvoiceDetail } from './InvoiceDetail'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export default async function InvoiceDetailPage({ params }: Props) {
  const { id } = await params
  const invoice = await getInvoice(id)

  if (!invoice) {
    notFound()
  }

  return <InvoiceDetail invoice={invoice} />
}
