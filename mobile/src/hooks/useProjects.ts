import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/expo'
import { fetchProjects, fetchProject, createProject, updateProject, deleteProject } from '../api/projects'
import { Project } from '../types/api'

export function useProjects(filters?: Record<string, string>) {
  const { getToken } = useAuth()
  return useQuery({
    queryKey: ['projects', filters],
    queryFn: () => fetchProjects(getToken, filters),
  })
}

export function useProjectDetail(id: string) {
  const { getToken } = useAuth()
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => fetchProject(getToken, id),
    enabled: !!id,
  })
}

export function useCreateProject() {
  const { getToken } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Project>) => createProject(getToken, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useUpdateProject() {
  const { getToken } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Project> }) => updateProject(getToken, id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['project', id] })
      qc.invalidateQueries({ queryKey: ['projects'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useDeleteProject() {
  const { getToken } = useAuth()
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteProject(getToken, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
