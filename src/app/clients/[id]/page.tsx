import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getClient, deleteClient } from '@/actions/clients'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { statusColors, statusLabels, priorityColors, priorityLabels, formatDate } from '@/lib/utils'
import { ClientForm } from '@/components/forms/ClientForm'
import { DeleteClientButton } from './DeleteClientButton'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ClientDetailPage({ params }: Props) {
  const { id } = await params
  const client = await getClient(id)

  if (!client) {
    notFound()
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/clients"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Clients
          </Link>
          <h1 className="mt-2 text-xl md:text-2xl font-bold text-foreground">{client.name}</h1>
        </div>
        <div className="flex gap-3">
          <DeleteClientButton id={client.id} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Client Details</CardTitle>
            </CardHeader>
            <CardContent>
              <ClientForm client={client} />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Projects ({client.projects.length})</CardTitle>
              <Link href={`/projects/new?clientId=${client.id}`}>
                <Button size="sm" className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Project
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {client.projects.length === 0 ? (
                <div className="px-6 py-12 text-center text-muted-foreground">
                  No projects yet. Create one to get started.
                </div>
              ) : (
                <>
                  {/* Desktop table */}
                  <div className="hidden md:block">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border text-left text-sm font-medium text-muted-foreground">
                          <th className="px-6 py-3">Project</th>
                          <th className="px-6 py-3">Status</th>
                          <th className="px-6 py-3">Priority</th>
                          <th className="px-6 py-3">Due Date</th>
                          <th className="px-6 py-3">Tasks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {client.projects.map((project) => (
                          <tr key={project.id} className="hover:bg-muted/50 transition-colors">
                            <td className="px-6 py-4">
                              <Link
                                href={`/projects/${project.id}`}
                                className="font-medium text-foreground hover:text-link"
                              >
                                {project.name}
                              </Link>
                            </td>
                            <td className="px-6 py-4">
                              <Badge className={statusColors[project.status]}>
                                {statusLabels[project.status]}
                              </Badge>
                            </td>
                            <td className="px-6 py-4">
                              <Badge className={priorityColors[project.priority]}>
                                {priorityLabels[project.priority]}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 text-muted-foreground">
                              {formatDate(project.dueDate)}
                            </td>
                            <td className="px-6 py-4 text-muted-foreground">
                              {project._count.tasks}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile cards */}
                  <div className="divide-y divide-border md:hidden">
                    {client.projects.map((project) => (
                      <Link
                        key={project.id}
                        href={`/projects/${project.id}`}
                        className="block p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <h3 className="font-medium text-foreground truncate">{project.name}</h3>
                          </div>
                          <svg className="h-5 w-5 text-muted-foreground flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <Badge className={statusColors[project.status]}>
                            {statusLabels[project.status]}
                          </Badge>
                          <Badge className={priorityColors[project.priority]}>
                            {priorityLabels[project.priority]}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {project._count.tasks} task{project._count.tasks !== 1 ? 's' : ''}
                          </span>
                        </div>
                        {project.dueDate && (
                          <p className="mt-2 text-sm text-muted-foreground">
                            Due: {formatDate(project.dueDate)}
                          </p>
                        )}
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
