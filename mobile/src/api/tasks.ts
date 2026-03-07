import { apiFetch, GetToken } from './client'
import { Task, TaskComment } from '../types/api'

interface TasksResponse { tasks: Task[] }

export function fetchTasks(getToken: GetToken, filters?: Record<string, string>) {
  const params = new URLSearchParams(filters || {}).toString()
  return apiFetch<TasksResponse>(`/tasks${params ? `?${params}` : ''}`, getToken)
}

export function fetchTask(getToken: GetToken, id: string) {
  return apiFetch<Task>(`/tasks/${id}`, getToken)
}

export function createTask(getToken: GetToken, data: Record<string, unknown>) {
  return apiFetch<Task>('/tasks', getToken, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateTask(getToken: GetToken, id: string, data: Partial<Task>) {
  return apiFetch<Task>(`/tasks/${id}`, getToken, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export function deleteTask(getToken: GetToken, id: string) {
  return apiFetch<{ success: boolean }>(`/tasks/${id}`, getToken, { method: 'DELETE' })
}

export function toggleTask(getToken: GetToken, id: string) {
  return apiFetch<Task>(`/tasks/${id}/toggle`, getToken, { method: 'POST' })
}

export function addComment(getToken: GetToken, taskId: string, content: string) {
  return apiFetch<TaskComment>(`/tasks/${taskId}/comments`, getToken, {
    method: 'POST',
    body: JSON.stringify({ content }),
  })
}
