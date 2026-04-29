'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'
import { SortableHeader } from '@/components/ui/SortableHeader'
import { statusColors, statusLabels, priorityColors, priorityLabels, formatDate, isOverdue } from '@/lib/utils'

interface Project {
  id: string
  name: string
  status: string
  priority: string
  dueDate: Date | null
  client: {
    id: string
    name: string
  }
  tasks: { id: string; status: string; url: string | null }[]
  _count: {
    tasks: number
  }
}

type HealthLabel = 'healthy' | 'at_risk' | 'critical' | 'completed'

const healthDotColors: Record<HealthLabel, string> = {
  healthy: 'bg-success',
  at_risk: 'bg-warning',
  critical: 'bg-destructive',
  completed: 'bg-success',
}

const healthTooltips: Record<HealthLabel, string> = {
  healthy: 'Healthy',
  at_risk: 'At Risk',
  critical: 'Critical',
  completed: 'Completed',
}

interface Props {
  projects: Project[]
  currentSort?: string
  viewMode: 'table' | 'grid'
  healthMap?: Record<string, HealthLabel>
}

function isProjectCompleted(p: Project): boolean {
  if (p.status === 'completed') return true
  const realTasks = p.tasks.filter(t => !t.url)
  if (realTasks.length > 0 && realTasks.every(t => t.status === 'done')) return true
  return false
}

export function ProjectsList({ projects, currentSort, viewMode, healthMap }: Props) {
  const activeProjects = projects.filter(p => !isProjectCompleted(p))
  const completedProjects = projects.filter(p => isProjectCompleted(p))

  return (
    <>

      {/* Table View */}
      {viewMode === 'table' && (
        <>
          {/* Desktop table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3">
                    <SortableHeader label="Project" sortKey="name" currentSort={currentSort} basePath="/projects" />
                  </th>
                  <th className="px-4 py-3 min-w-[120px]">
                    <SortableHeader label="Status" sortKey="status" currentSort={currentSort} basePath="/projects" />
                  </th>
                  <th className="px-4 py-3">
                    <SortableHeader label="Priority" sortKey="priority" currentSort={currentSort} basePath="/projects" />
                  </th>
                  <th className="px-4 py-3">
                    <SortableHeader label="Due Date" sortKey="due_date" currentSort={currentSort} basePath="/projects" />
                  </th>
                  <th className="px-4 py-3">Tasks</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {activeProjects.map((project) => {
                  const overdue = isOverdue(project.dueDate) && project.status !== 'completed'
                  return (
                    <tr key={project.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {healthMap?.[project.id] && (
                            <span
                              className={`w-2 h-2 rounded-full flex-shrink-0 ${healthDotColors[healthMap[project.id]]}`}
                              title={healthTooltips[healthMap[project.id]]}
                            />
                          )}
                          <Link
                            href={`/projects/${project.id}`}
                            className="font-medium text-link hover:text-link/80"
                          >
                            {project.name}
                          </Link>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={statusColors[project.status]}>
                          {statusLabels[project.status]}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={priorityColors[project.priority]}>
                          {priorityLabels[project.priority]}
                        </Badge>
                      </td>
                      <td className={`px-4 py-3 ${overdue ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                        {formatDate(project.dueDate)}
                        {overdue && ' (Overdue)'}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {project._count.tasks}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/projects/${project.id}`}
                          className="text-sm text-link hover:text-link/80"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  )
                })}
                {completedProjects.length > 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 pt-8 pb-2">
                      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Completed ({completedProjects.length})
                      </span>
                    </td>
                  </tr>
                )}
                {completedProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-muted/30 transition-colors text-muted-foreground">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-success flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <Link
                          href={`/projects/${project.id}`}
                          className="font-medium text-muted-foreground hover:text-foreground"
                        >
                          {project.name}
                        </Link>
                      </div>
                    </td>
                    <td className="px-4 py-3" colSpan={3}>
                      <span className="text-xs text-muted-foreground/50">
                        {project._count.tasks} tasks
                      </span>
                    </td>
                    <td className="px-4 py-3"></td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/projects/${project.id}`}
                        className="text-sm text-muted-foreground/70 hover:text-foreground"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile/Tablet cards */}
          <div className="divide-y divide-border lg:hidden">
            {activeProjects.map((project) => {
              const overdue = isOverdue(project.dueDate) && project.status !== 'completed'
              const completedTasks = project.tasks.filter(t => t.status === 'done').length
              const totalTasks = project._count.tasks
              const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
              return (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="block p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {healthMap?.[project.id] && (
                          <span
                            className={`w-2 h-2 rounded-full flex-shrink-0 ${healthDotColors[healthMap[project.id]]}`}
                            title={healthTooltips[healthMap[project.id]]}
                          />
                        )}
                        <h3 className="font-medium text-foreground truncate">{project.name}</h3>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge className={statusColors[project.status]}>
                        {statusLabels[project.status]}
                      </Badge>
                      <svg className="h-4 w-4 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                  {totalTasks > 0 && (
                    <div className="mt-3 relative w-full h-5 bg-secondary rounded overflow-hidden">
                      <div
                        className={`h-full rounded transition-all ${progress === 100 ? 'bg-success' : 'bg-primary'}`}
                        style={{ width: `${Math.max(progress, 8)}%` }}
                      />
                      <span className="absolute inset-0 flex items-center px-2 text-xs font-medium text-white">
                        {completedTasks}/{totalTasks} tasks
                      </span>
                    </div>
                  )}
                  {project.dueDate && (
                    <p className={`mt-2 text-xs ${overdue ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                      Due: {formatDate(project.dueDate)}
                      {overdue && ' (Overdue)'}
                    </p>
                  )}
                </Link>
              )
            })}
          </div>
          {completedProjects.length > 0 && (
            <div className="mt-6 lg:hidden">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2 px-4">
                Completed ({completedProjects.length})
              </p>
              <div className="divide-y divide-border/50">
                {completedProjects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors"
                  >
                    <svg className="w-4 h-4 text-success flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-muted-foreground truncate">{project.name}</p>
                    </div>
                    <span className="text-xs text-muted-foreground/50 flex-shrink-0">
                      {project._count.tasks} tasks
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {activeProjects.map((project) => {
              const overdue = isOverdue(project.dueDate) && project.status !== 'completed'
              const completedTasks = project.tasks.filter(t => t.status === 'done').length
              const totalTasks = project._count.tasks
              const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
              return (
                <Link key={project.id} href={`/projects/${project.id}`}>
                  <Card className="h-full hover:bg-muted/50 transition-colors cursor-pointer group">
                    <CardContent className="p-5 space-y-4">
                      {/* Project Name */}
                      <div>
                        <div className="flex items-center gap-2">
                          {healthMap?.[project.id] && (
                            <span
                              className={`w-2 h-2 rounded-full flex-shrink-0 ${healthDotColors[healthMap[project.id]]}`}
                              title={healthTooltips[healthMap[project.id]]}
                            />
                          )}
                          <h3 className="font-semibold text-foreground group-hover:text-link transition-colors line-clamp-2">
                            {project.name}
                          </h3>
                        </div>
                      </div>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-2">
                        <Badge className={statusColors[project.status]}>
                          {statusLabels[project.status]}
                        </Badge>
                        <Badge className={priorityColors[project.priority]}>
                          {priorityLabels[project.priority]}
                        </Badge>
                      </div>

                      {/* Progress */}
                      {totalTasks > 0 && (
                        <div className="relative w-full h-5 bg-secondary rounded overflow-hidden">
                          <div
                            className={`h-full rounded transition-all ${
                              progress === 100 ? 'bg-success' : 'bg-primary'
                            }`}
                            style={{ width: `${Math.max(progress, 8)}%` }}
                          />
                          <span className="absolute inset-0 flex items-center px-2 text-xs font-medium text-white">
                            {completedTasks}/{totalTasks} tasks
                          </span>
                        </div>
                      )}

                      {/* Due Date */}
                      {project.dueDate && (
                        <div className="pt-2 border-t border-border">
                          <p className={`text-sm ${overdue ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                            <span className="font-medium">Due:</span> {formatDate(project.dueDate)}
                            {overdue && (
                              <span className="block mt-1 text-xs">(Overdue)</span>
                            )}
                          </p>
                        </div>
                      )}

                      {/* Tasks Count (only show if no progress bar shown) */}
                      {totalTasks === 0 && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          <span>No tasks yet</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>

          {/* Completed projects — compact rows */}
          {completedProjects.length > 0 && (
            <div className="mt-8">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
                Completed ({completedProjects.length})
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
                {completedProjects.map((project) => (
                  <Link key={project.id} href={`/projects/${project.id}`}>
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors group">
                      <div className="w-5 h-5 rounded-full bg-success/15 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors truncate">
                          {project.name}
                        </p>
                        <p className="text-xs text-muted-foreground/60 truncate">{project.client.name}</p>
                      </div>
                      <span className="text-xs text-muted-foreground/40 flex-shrink-0">
                        {project._count.tasks} tasks
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </>
  )
}
