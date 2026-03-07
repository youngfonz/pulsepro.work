import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/expo'
import { fetchClients, fetchClient, createClient, updateClient, deleteClient } from '../api/clients'
import { Client } from '../types/api'

export function useClients(filters?: Record<string, string>) {
  const { getToken } = useAuth()
  return useQuery({
    queryKey: ['clients', filters],
    queryFn: () => fetchClients(getToken, filters),
  })
}

export function useClientDetail(id: string) {
  const { getToken } = useAuth()
  return useQuery({
    queryKey: ['client', id],
    queryFn: () => fetchClient(getToken, id),
    enabled: !!id,
  })
}

export function useCreateClient() {
  const { getToken } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Client>) => createClient(getToken, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clients'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useUpdateClient() {
  const { getToken } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Client> }) => updateClient(getToken, id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['client', id] })
      qc.invalidateQueries({ queryKey: ['clients'] })
    },
  })
}

export function useDeleteClient() {
  const { getToken } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteClient(getToken, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clients'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
