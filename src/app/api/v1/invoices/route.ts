import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest, apiError, handleCors } from '@/lib/api-auth'
import crypto from 'crypto'

export async function OPTIONS() { return handleCors() }

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if ('error' in auth) return apiError(auth.error, auth.status)
    const { userId } = auth

    const url = new URL(request.url)
    const search = url.searchParams.get('search')
    const status = url.searchParams.get('status')
    const clientId = url.searchParams.get('clientId')
    const sort = url.searchParams.get('sort')

    const where: Record<string, unknown> = { userId }
    const conditions: Record<string, unknown>[] = []

    if (search) {
      conditions.push({
        OR: [
          { number: { contains: search, mode: 'insensitive' } },
          { client: { name: { contains: search, mode: 'insensitive' } } },
        ],
      })
    }

    if (status && status !== 'all') {
      if (status === 'overdue') {
        conditions.push({ status: 'sent', dueDate: { lt: new Date() } })
      } else {
        conditions.push({ status })
      }
    }

    if (clientId && clientId !== 'all') {
      conditions.push({ clientId })
    }

    if (conditions.length > 0) where.AND = conditions

    type OrderBy = Record<string, 'asc' | 'desc'>
    let orderBy: OrderBy = { createdAt: 'desc' }
    switch (sort) {
      case 'oldest': orderBy = { createdAt: 'asc' }; break
      case 'number': orderBy = { number: 'asc' }; break
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        client: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
        items: { select: { amount: true } },
      },
      orderBy,
    })

    const now = new Date()
    const withTotal = invoices.map((invoice) => {
      const subtotal = invoice.items.reduce((sum, item) => sum + item.amount, 0)
      const total = subtotal + subtotal * (invoice.taxRate / 100)
      const computedStatus = invoice.status === 'sent' && invoice.dueDate && invoice.dueDate < now ? 'overdue' : invoice.status
      return { ...invoice, status: computedStatus, subtotal, total }
    })

    if (sort === 'amount') {
      withTotal.sort((a, b) => b.total - a.total)
    }

    return NextResponse.json({ invoices: withTotal })
  } catch (error) {
    console.error('API v1/invoices GET error:', error)
    return apiError('Internal error', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if ('error' in auth) return apiError(auth.error, auth.status)
    const { userId } = auth

    const body = await request.json()
    if (!body.clientId) return apiError('clientId is required', 400)
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return apiError('At least one line item is required', 400)
    }

    // Prevent email header injection
    if (body.fromEmail && /[\r\n]/.test(body.fromEmail)) return apiError('Invalid email format', 400)
    if (body.fromName && /[\r\n]/.test(body.fromName)) return apiError('Invalid name format', 400)
    if (body.fromAddress && /[\r\n]/.test(body.fromAddress)) return apiError('Invalid address format', 400)

    // Verify client ownership
    const client = await prisma.client.findFirst({ where: { id: body.clientId, userId } })
    if (!client) return apiError('Client not found', 404)

    // Generate next invoice number
    const latest = await prisma.invoice.findFirst({
      where: { userId },
      orderBy: { number: 'desc' },
      select: { number: true },
    })
    let next = 1
    if (latest?.number) {
      const parsed = parseInt(latest.number.replace('INV-', ''), 10)
      if (!isNaN(parsed)) next = parsed + 1
    }
    const number = `INV-${String(next).padStart(3, '0')}`

    const invoice = await prisma.$transaction(async (tx) => {
      const created = await tx.invoice.create({
        data: {
          userId,
          number,
          clientId: body.clientId,
          projectId: body.projectId || null,
          dueDate: body.dueDate ? new Date(body.dueDate) : new Date(),
          taxRate: body.taxRate ?? 0,
          notes: body.notes || null,
          fromName: body.fromName || null,
          fromEmail: body.fromEmail || null,
          fromAddress: body.fromAddress || null,
          shareToken: crypto.randomBytes(16).toString('hex'),
        },
      })

      await tx.invoiceItem.createMany({
        data: body.items.map((item: { description: string; quantity: number; rate: number }) => ({
          invoiceId: created.id,
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          amount: item.quantity * item.rate,
        })),
      })

      return created
    })

    return NextResponse.json(invoice, { status: 201 })
  } catch (error) {
    console.error('API v1/invoices POST error:', error)
    return apiError('Internal error', 500)
  }
}
