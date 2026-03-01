import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { DashboardCalendar } from '@/components/DashboardCalendar'

export const dynamic = 'force-dynamic'
import { DashboardGreeting } from '@/components/DashboardGreeting'
import { OnboardingOverlay } from '@/components/OnboardingOverlay'
import { DashboardProvider, DashboardGrid, DashboardCustomize, type DashboardSectionDef } from '@/components/DashboardLayout'
import { requireUserId } from '@/lib/auth'
import {
  getProjectsDueThisWeek,
  getTasksDueToday,
  getOverdueTasks,
  getRecentlyViewed,
  getProjectHealth,
  getSmartInsights,
  getDashboardStats,
  getTasksDueThisWeek,
} from '@/actions/dashboard'
import { InsightsPanel } from '@/components/InsightsPanel'
import { InsightsPanelWithAI } from '@/components/InsightsPanelWithAI'
import { statusColors, statusLabels, priorityColors, priorityLabels, formatDate } from '@/lib/utils'

export default async function DashboardPage() {
  const userId = await requireUserId()

  const [projectsDueThisWeek, tasksDueToday, overdueTasks, recentlyViewed, projectHealth, insightResult, stats, tasksDueThisWeekCount] = await Promise.all([
    getProjectsDueThisWeek(),
    getTasksDueToday(),
    getOverdueTasks(),
    getRecentlyViewed(),
    getProjectHealth(),
    getSmartInsights(),
    getDashboardStats(),
    getTasksDueThisWeek(),
  ])

  const completedTasks = stats.totalTasks - stats.pendingTasks

  // Group overdue tasks by project
  const overdueByProject = overdueTasks.reduce<Record<string, { name: string; id: string; tasks: typeof overdueTasks }>>((acc, task) => {
    const projectKey = task.project?.id ?? '__standalone__'
    if (!acc[projectKey]) {
      acc[projectKey] = { name: task.project?.name ?? 'Quick Tasks', id: task.project?.id ?? '', tasks: [] }
    }
    acc[projectKey].tasks.push(task)
    return acc
  }, {})
  const overdueGroups = Object.values(overdueByProject)

  const sections: DashboardSectionDef[] = [
    // Overdue — grouped by project
    ...(overdueTasks.length > 0 ? [{
      id: 'overdue',
      content: (
        <Card className="h-full border-l-2 border-l-rose-500/40">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-rose-600 dark:text-rose-400 text-base">Overdue</CardTitle>
            <Link href="/tasks" className="text-sm text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-300">
              View all
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {overdueGroups.map((group) => (
                <div key={group.id || '__standalone__'}>
                  <Link
                    href={group.id ? `/projects/${group.id}` : `/tasks`}
                    className="flex items-center justify-between px-4 sm:px-6 pt-3 pb-1 hover:bg-muted/30 transition-colors"
                  >
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{group.name}</p>
                    <span className="text-xs text-rose-500 dark:text-rose-400 font-medium">
                      {group.tasks.length} task{group.tasks.length > 1 ? 's' : ''}
                    </span>
                  </Link>
                  {group.tasks.map((task) => (
                    <Link
                      key={task.id}
                      href={`/tasks/${task.id}`}
                      className="block px-4 py-2.5 sm:px-6 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <span className="font-medium text-foreground block truncate text-sm">{task.title}</span>
                        </div>
                        <Badge className={`${priorityColors[task.priority]} flex-shrink-0`}>
                          {priorityLabels[task.priority]}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-rose-500 dark:text-rose-400">
                        Due {formatDate(task.dueDate)}
                      </p>
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ),
    }] : []),

    // Upcoming
    {
      id: 'upcoming',
      content: (
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Upcoming</CardTitle>
            <Link href="/tasks" className="text-sm text-primary hover:text-primary/80">
              View all
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {tasksDueToday.length === 0 && projectsDueThisWeek.length === 0 ? (
              <div className="px-6 py-10 flex flex-col items-center justify-center text-center">
                <svg className="w-8 h-8 text-emerald-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-muted-foreground">Nothing due this week</p>
              </div>
            ) : (
              <div>
                {tasksDueToday.length > 0 && (
                  <div>
                    <p className="px-4 sm:px-6 pt-2 pb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">Due Today</p>
                    <div className="divide-y divide-border">
                      {tasksDueToday.map((task) => (
                        <Link
                          key={task.id}
                          href={`/tasks/${task.id}`}
                          className="flex items-center gap-3 px-4 py-2.5 sm:px-6 hover:bg-muted transition-colors"
                        >
                          <svg className="w-4 h-4 text-muted-foreground flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium text-foreground block truncate">{task.title}</span>
                            <p className="text-xs text-muted-foreground truncate">{task.project?.name ?? 'Quick task'}</p>
                          </div>
                          <Badge className={`${priorityColors[task.priority]} flex-shrink-0`}>
                            {priorityLabels[task.priority]}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                {projectsDueThisWeek.length > 0 && (
                  <div className={tasksDueToday.length > 0 ? 'border-t border-border' : ''}>
                    <p className="px-4 sm:px-6 pt-3 pb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">Projects This Week</p>
                    <div className="divide-y divide-border">
                      {projectsDueThisWeek.map((project) => (
                        <Link
                          key={project.id}
                          href={`/projects/${project.id}`}
                          className="flex items-center gap-3 px-4 py-2.5 sm:px-6 hover:bg-muted transition-colors"
                        >
                          <svg className="w-4 h-4 text-muted-foreground flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                          </svg>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium text-foreground block truncate">{project.name}</span>
                            <p className="text-xs text-muted-foreground truncate">{project.client.name} · Due {formatDate(project.dueDate)}</p>
                          </div>
                          <Badge className={`${priorityColors[project.priority]} flex-shrink-0`}>
                            {priorityLabels[project.priority]}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ),
    },

    // Project Health
    ...(projectHealth.length > 0 ? [{
      id: 'health',
      content: (
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Project Health</CardTitle>
            <Link href="/projects" className="text-sm text-primary hover:text-primary/80">
              View all
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {projectHealth.slice(0, 6).map((project) => (
                <Link
                  key={project.projectId}
                  href={project.href}
                  className="flex items-center gap-3 px-4 py-3 sm:px-6 hover:bg-muted/50 transition-colors"
                >
                  <span
                    className={`inline-flex items-center gap-1.5 text-[10px] font-medium px-1.5 py-0.5 rounded flex-shrink-0 ${
                      project.label === 'completed' || project.label === 'healthy'
                        ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10'
                        : project.label === 'at_risk'
                        ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10'
                        : 'text-rose-600 dark:text-rose-400 bg-rose-500/10'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      project.label === 'completed' || project.label === 'healthy'
                        ? 'bg-emerald-500'
                        : project.label === 'at_risk'
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`} />
                    {project.label === 'completed' ? 'Done' : project.label === 'healthy' ? 'Healthy' : project.label === 'at_risk' ? 'At Risk' : 'Critical'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{project.projectName}</p>
                    <p className="text-xs text-muted-foreground truncate">{project.clientName}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {project.label === 'completed' ? (
                      <Badge className="border border-emerald-500/30 text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 text-xs">
                        Done
                      </Badge>
                    ) : project.overdueTasks > 0 ? (
                      <span className="text-xs text-rose-500 font-medium">
                        {project.overdueTasks} overdue
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {project.completedTasks}/{project.totalTasks} tasks
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      ),
    }] : []),

    // Recently Viewed
    {
      id: 'recent',
      content: (
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recently Viewed</CardTitle>
            <Link href="/projects" className="text-sm text-primary hover:text-primary/80">
              View all
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {recentlyViewed.length === 0 ? (
              <Link
                href="/projects/new"
                className="block px-4 py-8 text-center text-muted-foreground hover:bg-muted transition-colors"
              >
                Start by creating a project, task, or bookmark to see it here.
              </Link>
            ) : (
              <div className="divide-y divide-border">
                {recentlyViewed.map((item) => (
                  <Link
                    key={`${item.type}-${item.id}`}
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors active:bg-muted"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-muted text-muted-foreground">
                      {item.type === 'project' ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                        </svg>
                      ) : item.type === 'task' ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate text-sm">{item.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
                    </div>
                    {item.status && (
                      <Badge className={`${statusColors[item.status]} flex-shrink-0 text-xs`}>
                        {statusLabels[item.status]}
                      </Badge>
                    )}
                    {item.priority && (
                      <Badge className={`${priorityColors[item.priority]} flex-shrink-0 text-xs`}>
                        {priorityLabels[item.priority]}
                      </Badge>
                    )}
                    {item.type === 'bookmark' && (
                      <span className="text-xs text-muted-foreground flex-shrink-0">Bookmark</span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ),
    },

    // Calendar
    {
      id: 'calendar',
      content: (
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Calendar</CardTitle>
            <Link href="/calendar" className="text-sm text-primary hover:text-primary/80">
              Full view
            </Link>
          </CardHeader>
          <CardContent>
            <DashboardCalendar />
          </CardContent>
        </Card>
      ),
    },
  ]

  return (
    <DashboardProvider>
      <div className="space-y-4 md:space-y-6">
        <OnboardingOverlay userId={userId} />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <DashboardGreeting />
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <DashboardCustomize />
            <Link href="/tasks?add=true">
              <Button variant="secondary" className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Task
              </Button>
            </Link>
            <Link href="/projects/new">
              <Button className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Add Project
              </Button>
            </Link>
          </div>
        </div>

        {/* Activity Rings + Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6">
          {/* Activity Card */}
          <Card className="lg:col-span-2 border-border/50 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col items-center gap-5">
                {/* Activity Rings */}
                <Link href="/projects" className="relative w-36 h-36 flex-shrink-0 cursor-pointer group">
                  {/* Glow effect */}
                  <div className="absolute inset-0 blur-xl opacity-20">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="#f43f5e" strokeWidth="6" />
                      <circle cx="50" cy="50" r="32" fill="none" stroke="#3b82f6" strokeWidth="6" />
                      <circle cx="50" cy="50" r="22" fill="none" stroke="#22c55e" strokeWidth="6" />
                    </svg>
                  </div>

                  {/* Background rings */}
                  <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" className="text-rose-500/15" strokeWidth="6" />
                    <circle cx="50" cy="50" r="32" fill="none" stroke="currentColor" className="text-blue-500/15" strokeWidth="6" />
                    <circle cx="50" cy="50" r="22" fill="none" stroke="currentColor" className="text-emerald-500/15" strokeWidth="6" />
                  </svg>

                  {/* Progress rings */}
                  <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full -rotate-90">
                    <circle
                      cx="50" cy="50" r="42"
                      fill="none"
                      stroke="url(#projectGradient)"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={`${stats.totalProjects > 0 ? (stats.activeProjects / stats.totalProjects) * 264 : 0} 264`}
                    />
                    <circle
                      cx="50" cy="50" r="32"
                      fill="none"
                      stroke="url(#taskGradient)"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={`${stats.totalTasks > 0 ? (completedTasks / stats.totalTasks) * 201 : 0} 201`}
                    />
                    <circle
                      cx="50" cy="50" r="22"
                      fill="none"
                      stroke="url(#dueGradient)"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={`${stats.pendingTasks > 0 ? Math.min((tasksDueThisWeekCount / stats.pendingTasks) * 138, 138) : 0} 138`}
                    />
                    <defs>
                      <linearGradient id="projectGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#fb7185" />
                        <stop offset="100%" stopColor="#f43f5e" />
                      </linearGradient>
                      <linearGradient id="taskGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#60a5fa" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                      <linearGradient id="dueGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#4ade80" />
                        <stop offset="100%" stopColor="#22c55e" />
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* Center number */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">{tasksDueThisWeekCount}</span>
                  </div>
                </Link>

                {/* Stats Legend */}
                <div className="flex items-start justify-center gap-6">
                  <Link href="/projects" className="group flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500 flex-shrink-0" />
                    <div>
                      <div className="text-lg font-semibold text-foreground">{stats.activeProjects}<span className="text-sm font-normal text-muted-foreground">/{stats.totalProjects}</span></div>
                      <div className="text-xs text-muted-foreground">Active Projects</div>
                    </div>
                  </Link>

                  <Link href="/tasks" className="group flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0" />
                    <div>
                      <div className="text-lg font-semibold text-foreground">{completedTasks}<span className="text-sm font-normal text-muted-foreground">/{stats.totalTasks}</span></div>
                      <div className="text-xs text-muted-foreground">Tasks Done</div>
                    </div>
                  </Link>

                  <Link href="/tasks" className="group flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
                    <div>
                      <div className="text-lg font-semibold text-foreground">{tasksDueThisWeekCount}</div>
                      <div className="text-xs text-muted-foreground">Due This Week</div>
                    </div>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Insights Card */}
          <Card className="lg:col-span-3 border-border/50">
            <CardHeader>
              <CardTitle>Insights</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <InsightsPanelWithAI
                initialInsights={insightResult.insights}
                needsRefresh={insightResult.needsRefresh}
              />
            </CardContent>
          </Card>
        </div>

        <DashboardGrid sections={sections} />
      </div>
    </DashboardProvider>
  )
}
