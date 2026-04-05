import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest, apiError, handleCors } from '@/lib/api-auth'

export async function OPTIONS() { return handleCors() }

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authenticateRequest(request)
    if ('error' in auth) return apiError(auth.error, auth.status)
    const { userId } = auth
    const { id } = await params

    const invoice = await prisma.invoice.findFirst({
      where: { id, userId },
      include: {
        client: { select: { id: true, name: true, email: true, company: true } },
        project: { select: { id: true, name: true, hourlyRate: true } },
        items: true,
      },
    })

    if (!invoice) return apiError('Invoice not found', 404)

    const subtotal = invoice.items.reduce((sum, item) => sum + item.amount, 0)
    const total = subtotal + subtotal * (invoice.taxRate / 100)
    const status = invoice.status === 'sent' && invoice.dueDate && invoice.dueDate < new Date() ? 'overdue' : invoice.status

    return NextResponse.json({ ...invoice, status, subtotal, total })
  } catch (error) {
    console.error('API v1/invoices/[id] GET error:', error)
    return apiError('Internal error', 500)
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authenticateRequest(request)
    if ('error' in auth) return apiError(auth.error, auth.status)
    const { userId } = auth
    const { id } = await params

    const existing = await prisma.invoice.findFirst({ where: { id, userId } })
    if (!existing) return apiError('Invoice not found', 404)
    if (existing.status !== 'draft') return apiError('Only draft invoices can be edited', 400)

    const body = await request.json()

    // Prevent email header injection
    if (body.fromEmail && /[\r\n]/.test(body.fromEmail)) return apiError('Invalid email format', 400)
    if (body.fromName && /[\r\n]/.test(body.fromName)) return apiError('Invalid name format', 400)
    if (body.fromAddress && /[\r\n]/.test(body.fromAddress)) return apiError('Invalid address format', 400)

    // Verify client ownership if changing client
    if (body.clientId) {
      const client = await prisma.client.findFirst({ where: { id: body.clientId, userId } })
      if (!client) return apiError('Client not found', 404)
    }

    await prisma.$transaction(async (tx) => {
      if (body.items && Array.isArray(body.items)) {
        await tx.invoiceItem.deleteMany({ where: { invoiceId: id } })
        await tx.invoiceItem.createMany({
          data: body.items.map((item: { description: string; quantity: number; rate: number }) => ({
            invoiceId: id,
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.quantity * item.rate,
          })),
        })
      }

      await tx.invoice.update({
        where: { id },
        data: {
          ...(body.clientId && { clientId: body.clientId }),
          ...(body.projectId !== undefined && { projectId: body.projectId || null }),
          ...(body.dueDate && { dueDate: new Date(body.dueDate) }),
          ...(body.taxRate !== undefined && { taxRate: body.taxRate }),
          ...(body.notes !== undefined && { notes: body.notes || null }),
          ...(body.fromName !== undefined && { fromName: body.fromName || null }),
          ...(body.fromEmail !== undefined && { fromEmail: body.fromEmail || null }),
          ...(body.fromAddress !== undefined && { fromAddress: body.fromAddress || null }),
        },
      })
    })

    // Return updated invoice
    const updated = await prisma.invoice.findFirst({
      where: { id, userId },
      include: {
        client: { select: { id: true, name: true, email: true, company: true } },
        project: { select: { id: true, name: true } },
        items: true,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('API v1/invoices/[id] PATCH error:', error)
    return apiError('Internal error', 500)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authenticateRequest(request)
    if ('error' in auth) return apiError(auth.error, auth.status)
    const { userId } = auth
    const { id } = await params

    const existing = await prisma.invoice.findFirst({ where: { id, userId } })
    if (!existing) return apiError('Invoice not found', 404)
    if (existing.status !== 'draft') return apiError('Only draft invoices can be deleted', 400)

    await prisma.invoice.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API v1/invoices/[id] DELETE error:', error)
    return apiError('Internal error', 500)
  }
}
