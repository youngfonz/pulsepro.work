import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/expo'
import { fetchTasks, fetchTask, createTask, updateTask, deleteTask, toggleTask } from '../api/tasks'
import { Task } from '../types/api'
import { mockTasks } from '../data/mock'

export function useTasks(filters?: Record<string, string>) {
  const { getToken } = useAuth()
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => fetchTasks(getToken, filters),
    initialData: { tasks: mockTasks },
    initialDataUpdatedAt: 0,
  })
}

export function useTaskDetail(id: string) {
  const { getToken } = useAuth()
  const mock = mockTasks.find(t => t.id === id)
  return useQuery({
    queryKey: ['task', id],
    queryFn: () => fetchTask(getToken, id),
    enabled: !!id,
    ...(mock ? { initialData: mock, initialDataUpdatedAt: 0 } : {}),
  })
}

export function useCreateTask() {
  const { getToken } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => createTask(getToken, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useUpdateTask() {
  const { getToken } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Task> }) => updateTask(getToken, id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['task', id] })
      qc.invalidateQueries({ queryKey: ['tasks'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useDeleteTask() {
  const { getToken } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteTask(getToken, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useToggleTask() {
  const { getToken } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => toggleTask(getToken, id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['task', id] })
      qc.invalidateQueries({ queryKey: ['tasks'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      qc.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}
