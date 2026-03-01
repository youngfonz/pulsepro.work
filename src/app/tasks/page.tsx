import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { getAllTasks, getProjectsForTaskFilter } from '@/actions/tasks'
import { getDashboardStats, getTasksDueThisWeek } from '@/actions/dashboard'
import { priorityColors, priorityLabels, formatDate } from '@/lib/utils'
import { TasksFilter } from './TasksFilter'
import { TaskCheckbox } from './TaskCheckbox'
import { AddTaskDialog } from './AddTaskDialog'
import { CompletedSection } from './CompletedSection'
import { ProgressRing } from '@/components/ui/ProgressRing'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{
    date?: string
    status?: 'all' | 'pending' | 'completed'
    priority?: 'all' | 'high' | 'medium' | 'low'
    projectId?: string
    sort?: string
    add?: string
  }>
}

export default async function TasksPage({ searchParams }: Props) {
  const params = await searchParams
  const [tasks, projects, stats, tasksDueThisWeekCount] = await Promise.all([
    getAllTasks({
      date: params.date,
      status: params.status,
      priority: params.priority,
      projectId: params.projectId,
      sort: params.sort,
    }),
    getProjectsForTaskFilter(),
    getDashboardStats(),
    getTasksDueThisWeek(),
  ])

  const completedTasks = stats.totalTasks - stats.pendingTasks

  const dateLabel = params.date
    ? new Date(params.date).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null

  // Split into active vs completed — unless user explicitly filtered to "completed"
  const showingCompleted = params.status === 'completed'
  const activeTasks = showingCompleted ? [] : tasks.filter((t) => t.status !== 'done')
  const completedTasksList = showingCompleted ? tasks : tasks.filter((t) => t.status === 'done')

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
          <h1 className="mt-2 text-xl md:text-2xl font-bold text-foreground">Tasks</h1>
          {dateLabel && (
            <p className="text-sm text-muted-foreground mt-1">
              Showing tasks for {dateLabel}
              <Link href="/tasks" className="ml-2 text-link hover:text-link/80">
                Clear filter
              </Link>
            </p>
          )}
        </div>
        <AddTaskDialog projects={projects} defaultOpen={params.add === 'true'} />
      </div>

      {/* Task Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="flex items-center gap-3 rounded-lg border border-border px-4 py-3">
          <ProgressRing value={completedTasks} max={stats.totalTasks} className="text-emerald-500" />
          <div>
            <p className="text-xs text-muted-foreground">Completed</p>
            <p className="text-lg font-semibold text-foreground">{completedTasks}<span className="text-sm font-normal text-muted-foreground">/{stats.totalTasks}</span></p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-border px-4 py-3">
          <ProgressRing
            value={tasksDueThisWeekCount}
            max={Math.max(stats.pendingTasks, 1)}
            label={String(tasksDueThisWeekCount)}
            className={tasksDueThisWeekCount === 0 ? 'text-emerald-500' : tasksDueThisWeekCount > 5 ? 'text-amber-500' : 'text-blue-500'}
          />
          <div>
            <p className="text-xs text-muted-foreground">Due This Week</p>
            <p className="text-lg font-semibold text-foreground">{tasksDueThisWeekCount}</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-3 rounded-lg border border-border px-4 py-3">
          <ProgressRing value={stats.activeProjects} max={stats.totalProjects} className="text-blue-500" />
          <div>
            <p className="text-xs text-muted-foreground">Active Projects</p>
            <p className="text-lg font-semibold text-foreground">{stats.activeProjects}<span className="text-sm font-normal text-muted-foreground">/{stats.totalProjects}</span></p>
          </div>
        </div>
      </div>

      <TasksFilter
        currentDate={params.date}
        currentStatus={params.status}
        currentPriority={params.priority}
        currentProjectId={params.projectId}
        currentSort={params.sort}
        projects={projects}
      />

      <Card>
        <CardHeader>
          <CardTitle>
            {showingCompleted
              ? `${completedTasksList.length} Completed ${completedTasksList.length === 1 ? 'Task' : 'Tasks'}`
              : `${activeTasks.length} Active ${activeTasks.length === 1 ? 'Task' : 'Tasks'}`
            }
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {tasks.length === 0 ? (
            <div className="px-6 py-12 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <svg className="w-6 h-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              {stats.totalTasks === 0 ? (
                <div>
                  <p className="font-medium text-foreground">No tasks yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Add your first task to start tracking your work. Press <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded text-xs font-mono">N</kbd> for quick-add.
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">No tasks found matching your filters.</p>
              )}
            </div>
          ) : showingCompleted ? (
            /* User explicitly filtered to "Completed" — show flat list */
            <div className="divide-y divide-border">
              {completedTasksList.map((task) => (
                <div
                  key={task.id}
                  className="px-4 py-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <TaskCheckbox taskId={task.id} done={task.status === 'done'} />
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/tasks/${task.id}`}
                        className="font-medium block truncate hover:text-link text-muted-foreground line-through"
                      >
                        {task.title}
                      </Link>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge className={`${priorityColors[task.priority]} flex-shrink-0 opacity-50`}>
                          {priorityLabels[task.priority]}
                        </Badge>
                        <p className="text-sm text-muted-foreground truncate">
                          {task.project?.name ?? 'Quick task'}{task.project?.client?.name ? ` \u2022 ${task.project.client.name}` : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Default view: active tasks + collapsible completed */
            <>
              {activeTasks.length === 0 ? (
                <div className="px-6 py-8 text-center text-muted-foreground">
                  All caught up — no active tasks.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {activeTasks.map((task) => {
                    const isOverdue =
                      task.dueDate &&
                      new Date(task.dueDate) < new Date()

                    return (
                      <div
                        key={task.id}
                        className={`px-4 py-3 hover:bg-muted/50 transition-colors ${
                          isOverdue ? 'bg-destructive/5 hover:bg-destructive/10' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <TaskCheckbox taskId={task.id} done={task.status === 'done'} />
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/tasks/${task.id}`}
                              className={`font-medium block truncate hover:text-link ${
                                isOverdue
                                  ? 'text-destructive'
                                  : 'text-foreground'
                              }`}
                            >
                              {task.title}
                            </Link>
                            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
                              <Badge className={`${priorityColors[task.priority]} flex-shrink-0`}>
                                {priorityLabels[task.priority]}
                              </Badge>
                              <span className="truncate">
                                {task.project?.name ?? 'Quick task'}{task.project?.client?.name ? ` \u2022 ${task.project.client.name}` : ''}
                              </span>
                              {task.dueDate && (
                                <>
                                  <span className="text-border">&middot;</span>
                                  <span className={`flex-shrink-0 ${isOverdue ? 'text-destructive font-medium' : ''}`}>
                                    {isOverdue ? 'Overdue' : 'Due'}: {formatDate(task.dueDate)}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {completedTasksList.length > 0 && (
                <CompletedSection count={completedTasksList.length}>
                  <div className="divide-y divide-border">
                    {completedTasksList.map((task) => (
                      <div
                        key={task.id}
                        className="px-4 py-3 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <TaskCheckbox taskId={task.id} done={task.status === 'done'} />
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/tasks/${task.id}`}
                              className="font-medium block truncate hover:text-link text-muted-foreground line-through"
                            >
                              {task.title}
                            </Link>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge className={`${priorityColors[task.priority]} flex-shrink-0 opacity-50`}>
                                {priorityLabels[task.priority]}
                              </Badge>
                              <p className="text-sm text-muted-foreground truncate">
                                {task.project?.name ?? 'Quick task'}{task.project?.client?.name ? ` \u2022 ${task.project.client.name}` : ''}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CompletedSection>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
