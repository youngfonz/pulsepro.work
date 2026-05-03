import { prisma } from '@/lib/prisma'

export class InvoiceInputError extends Error {
  status: number

  constructor(message: string, status = 400) {
    super(message)
    this.name = 'InvoiceInputError'
    this.status = status
  }
}

export type ValidatedInvoiceItem = {
  description: string
  quantity: number
  rate: number
  amount: number
}

type RawInvoiceItem = {
  description?: unknown
  quantity?: unknown
  rate?: unknown
}

export function validateInvoiceItems(items: unknown): ValidatedInvoiceItem[] {
  if (!Array.isArray(items) || items.length === 0) {
    throw new InvoiceInputError('At least one line item is required')
  }

  if (items.length > 100) {
    throw new InvoiceInputError('Invoices can have up to 100 line items')
  }

  return items.map((value, index) => {
    if (!value || typeof value !== 'object') {
      throw new InvoiceInputError(`Line item ${index + 1} is invalid`)
    }

    const item = value as RawInvoiceItem
    const description = typeof item.description === 'string' ? item.description.trim() : ''
    if (!description) {
      throw new InvoiceInputError(`Line item ${index + 1} needs a description`)
    }
    if (description.length > 500) {
      throw new InvoiceInputError(`Line item ${index + 1} description is too long`)
    }

    const quantity = Number(item.quantity)
    const rate = Number(item.rate)
    if (!Number.isFinite(quantity) || quantity <= 0) {
      throw new InvoiceInputError(`Line item ${index + 1} needs a positive quantity`)
    }
    if (!Number.isFinite(rate) || rate <= 0) {
      throw new InvoiceInputError(`Line item ${index + 1} needs a positive rate`)
    }

    return {
      description,
      quantity,
      rate,
      amount: quantity * rate,
    }
  })
}

export async function resolveInvoiceProjectId({
  projectId,
  userId,
  clientId,
}: {
  projectId?: unknown
  userId: string
  clientId: string
}): Promise<string | null> {
  if (projectId === undefined || projectId === null || projectId === '' || projectId === 'none') {
    return null
  }

  if (typeof projectId !== 'string') {
    throw new InvoiceInputError('Invalid projectId')
  }

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId, clientId },
    select: { id: true },
  })

  if (!project) {
    throw new InvoiceInputError('Project not found for this client', 404)
  }

  return project.id
}
