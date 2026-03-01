import { notFound } from 'next/navigation'
import { getProject, getClientsForSelect } from '@/actions/projects'
import { getProjectRole } from '@/lib/access'
import { getOrgId } from '@/lib/auth'
import { getProjectMembers, getOrgMembers } from '@/actions/access'
import { ProjectHeader } from './ProjectHeader'
import { ProjectTabs } from './ProjectTabs'
import type { ProjectRole } from '@/lib/access'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params
  const [project, clients, role, orgId] = await Promise.all([
    getProject(id),
    getClientsForSelect(),
    getProjectRole(id),
    getOrgId(),
  ])

  if (!project) {
    notFound()
  }

  const completedTasks = project.tasks.filter((t) => t.status === 'done').length
  const totalTasks = project.tasks.length
  const totalHours = project.timeEntries.reduce((sum, entry) => sum + entry.hours, 0)
  const userRole: ProjectRole = role || 'viewer'
  const hasOrg = !!orgId

  // Fetch team data only if user has access and is in an org
  let teamData = { owner: null as { id: string; name: string; email: string; imageUrl: string } | null, members: [] as Array<{ userId: string; role: string; user: { id: string; name: string; email: string; imageUrl: string } }> }
  let orgMembers: Array<{ userId: string; name: string; email: string; imageUrl: string; role: string }> = []

  if (role) {
    try {
      const members = await getProjectMembers(id)
      teamData = {
        owner: members.owner as typeof teamData.owner,
        members: members.members.map(m => ({
          userId: m.userId,
          role: m.role,
          user: m.user,
        })),
      }
      if (hasOrg) {
        orgMembers = await getOrgMembers()
      }
    } catch {
      // Team data fetch failed — continue without it
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <ProjectHeader
        project={project}
        clients={clients}
        completedTasks={completedTasks}
        totalTasks={totalTasks}
        totalHours={totalHours}
        userRole={userRole}
      />
      <ProjectTabs
        projectId={project.id}
        tasks={project.tasks}
        timeEntries={project.timeEntries}
        images={project.images}
        userRole={userRole}
        hasOrg={hasOrg}
        teamOwner={teamData.owner}
        teamMembers={teamData.members}
        orgMembers={orgMembers}
      />
    </div>
  )
}
