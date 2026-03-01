import Link from 'next/link'
import { getProjects, getClientsForSelect } from '@/actions/projects'
import { getProjectHealth } from '@/actions/dashboard'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { ProjectsFilter } from './ProjectsFilter'
import { ProjectsView } from './ProjectsView'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{ search?: string; status?: string; priority?: string; clientId?: string; sort?: string }>
}

export default async function ProjectsPage({ searchParams }: Props) {
  const params = await searchParams
  const [projects, clients, health] = await Promise.all([
    getProjects(params),
    getClientsForSelect(),
    getProjectHealth(),
  ])

  const healthMap: Record<string, 'healthy' | 'at_risk' | 'critical' | 'completed'> = {}
  for (const h of health) {
    healthMap[h.projectId] = h.label
  }

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
          <h1 className="mt-2 text-xl md:text-2xl font-bold text-foreground">Projects</h1>
        </div>
        <Link href="/projects/new">
          <Button className="w-full sm:w-auto flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Project
            </Button>
        </Link>
      </div>

      <ProjectsFilter clients={clients} />

      <Card>
        <CardContent className="p-6">
          {projects.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <svg className="w-6 h-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-foreground">No projects yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Projects help you organize tasks and track progress for each client.
                </p>
              </div>
              <Link href="/projects/new">
                <Button className="mt-2 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create your first project
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground mt-1">
                Tip: Add a <Link href="/clients/new" className="text-primary hover:text-primary/80">client</Link> first to keep things organized.
              </p>
            </div>
          ) : (
            <ProjectsView projects={projects} currentSort={params.sort} healthMap={healthMap} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
