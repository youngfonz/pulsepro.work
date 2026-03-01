'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { TaskList } from './TaskList'
import { AddTaskForm } from './AddTaskForm'

const TaskBoard = dynamic(
  () => import('./TaskBoard').then(mod => ({ default: mod.TaskBoard })),
  { loading: () => <div className="py-12 text-center text-muted-foreground text-sm">Loading board view...</div> },
)
import { AddBookmarkForm } from './AddBookmarkForm'
import { TimeTracker } from './TimeTracker'
import { ProjectImages } from './ProjectImages'
import { ProjectMembers } from './ProjectMembers'

interface Task {
  id: string
  title: string
  description: string | null
  notes: string | null
  status: string
  sortOrder: number
  priority: string
  startDate: Date | null
  dueDate: Date | null
  url: string | null
  bookmarkType: string | null
  thumbnailUrl: string | null
  tags: string[]
  images: any[]
  files: any[]
  _count: { comments: number }
}

interface TimeEntry {
  id: string
  hours: number
  description: string | null
  date: Date
}

interface ProjectImage {
  id: string
  path: string
  name: string
}

interface TeamMember {
  userId: string
  role: string
  user: { id: string; name: string; email: string; imageUrl: string }
}

interface OrgMember {
  userId: string
  name: string
  email: string
  imageUrl: string
  role: string
}

interface ProjectTabsProps {
  projectId: string
  tasks: Task[]
  timeEntries: TimeEntry[]
  images: ProjectImage[]
  userRole?: 'owner' | 'manager' | 'editor' | 'viewer'
  hasOrg?: boolean
  teamOwner?: { id: string; name: string; email: string; imageUrl: string } | null
  teamMembers?: TeamMember[]
  orgMembers?: OrgMember[]
}

export function ProjectTabs({ projectId, tasks, timeEntries, images, userRole = 'owner', hasOrg, teamOwner, teamMembers = [], orgMembers = [] }: ProjectTabsProps) {
  const showTeamTab = hasOrg || teamMembers.length > 0
  const canAddContent = userRole !== 'viewer'
  const [activeTab, setActiveTab] = useState<'tasks' | 'bookmarks' | 'time' | 'files' | 'team'>('tasks')
  const [taskView, setTaskView] = useState<'list' | 'board'>('list')

  // Separate regular tasks from bookmarks
  const regularTasks = tasks.filter(task => !task.url)
  const bookmarks = tasks.filter(task => task.url)

  const tabs = [
    { id: 'tasks' as const, name: 'Tasks', count: regularTasks.length },
    { id: 'bookmarks' as const, name: 'Bookmarks', count: bookmarks.length },
    { id: 'time' as const, name: 'Time Tracking', count: timeEntries.length },
    { id: 'files' as const, name: 'Files', count: images.length },
    ...(showTeamTab ? [{ id: 'team' as const, name: 'Team', count: teamMembers.length }] : []),
  ]

  return (
    <div className="mt-6">
      {/* Tab Navigation */}
      <div className="border-b border-border overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <nav className="-mb-px flex gap-4 sm:gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                py-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap
                ${activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }
              `}
            >
              {tab.name}
              {tab.count > 0 && (
                <span className="ml-2 py-0.5 px-2 rounded-full bg-muted text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              {canAddContent ? <AddTaskForm projectId={projectId} /> : <div />}
              <div className="flex items-center border border-border rounded-md overflow-hidden">
                <button
                  onClick={() => setTaskView('list')}
                  className={`p-1.5 ${taskView === 'list' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  title="List view"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <button
                  onClick={() => setTaskView('board')}
                  className={`p-1.5 ${taskView === 'board' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  title="Board view"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 4v16M15 4v16M4 9h16M4 15h16" />
                  </svg>
                </button>
              </div>
            </div>
            {regularTasks.length > 0 ? (
              taskView === 'list' ? (
                <TaskList tasks={regularTasks} canEdit={canAddContent} />
              ) : (
                <TaskBoard tasks={regularTasks} canEdit={canAddContent} />
              )
            ) : (
              <div className="py-12 text-center text-muted-foreground">
                No tasks yet. Add your first task above.
              </div>
            )}
          </div>
        )}

        {activeTab === 'bookmarks' && (
          <div className="space-y-6">
            {canAddContent && <AddBookmarkForm projectId={projectId} />}
            {bookmarks.length > 0 ? (
              <TaskList tasks={bookmarks} canEdit={canAddContent} />
            ) : (
              <div className="py-12 text-center text-muted-foreground">
                No bookmarks yet. Add your first bookmark above.
              </div>
            )}
          </div>
        )}

        {activeTab === 'time' && (
          <div className="max-w-2xl">
            <TimeTracker projectId={projectId} timeEntries={timeEntries} canEdit={canAddContent} />
          </div>
        )}

        {activeTab === 'files' && (
          <div className="max-w-2xl">
            <ProjectImages projectId={projectId} images={images} canEdit={canAddContent} />
          </div>
        )}

        {activeTab === 'team' && showTeamTab && (
          <ProjectMembers
            projectId={projectId}
            isOwnerOrManager={userRole === 'owner' || userRole === 'manager'}
            hasOrg={!!hasOrg}
            owner={teamOwner ?? null}
            members={teamMembers}
            orgMembers={orgMembers}
          />
        )}
      </div>
    </div>
  )
}
