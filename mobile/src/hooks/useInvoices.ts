import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/expo'
import { fetchInvoices, fetchInvoice, createInvoice, sendInvoice, markInvoicePaid } from '../api/invoices'
import { mockInvoices } from '../data/mock'

export function useInvoices(filters?: Record<string, string>) {
  const { getToken } = useAuth()
  return useQuery({
    queryKey: ['invoices', filters],
    queryFn: () => fetchInvoices(getToken, filters),
    initialData: { invoices: mockInvoices },
    initialDataUpdatedAt: 0,
  })
}

export function useInvoiceDetail(id: string) {
  const { getToken } = useAuth()
  const mock = mockInvoices.find(i => i.id === id)
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: () => fetchInvoice(getToken, id),
    enabled: !!id,
    ...(mock ? { initialData: mock, initialDataUpdatedAt: 0 } : {}),
  })
}

export function useCreateInvoice() {
  const { getToken } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => createInvoice(getToken, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invoices'] }),
  })
}

export function useSendInvoice() {
  const { getToken } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => sendInvoice(getToken, id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['invoice', id] })
      qc.invalidateQueries({ queryKey: ['invoices'] })
    },
  })
}

export function useMarkInvoicePaid() {
  const { getToken } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => markInvoicePaid(getToken, id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['invoice', id] })
      qc.invalidateQueries({ queryKey: ['invoices'] })
    },
  })
}
