import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { ProjectForm } from '@/components/forms/ProjectForm'
import { getClientsForSelect } from '@/actions/projects'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{ clientId?: string }>
}

export default async function NewProjectPage({ searchParams }: Props) {
  const params = await searchParams
  const clients = await getClientsForSelect()

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/projects"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Projects
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>Add New Project</CardTitle>
        </CardHeader>
        <CardContent>
          <ProjectForm clients={clients} defaultClientId={params.clientId} />
        </CardContent>
      </Card>
    </div>
  )
}
