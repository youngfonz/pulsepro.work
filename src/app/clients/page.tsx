import Link from 'next/link'
import Image from 'next/image'
import { getClients } from '@/actions/clients'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { SortableHeader } from '@/components/ui/SortableHeader'
import { statusColors, statusLabels } from '@/lib/utils'
import { ClientsFilter } from './ClientsFilter'

export const dynamic = 'force-dynamic'

interface Props {
  searchParams: Promise<{ search?: string; status?: string; sort?: string }>
}

export default async function ClientsPage({ searchParams }: Props) {
  const params = await searchParams
  const clients = await getClients(params.search, params.status, params.sort)

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
          <h1 className="mt-2 text-xl md:text-2xl font-bold text-foreground">Clients</h1>
        </div>
        <Link href="/clients/new">
          <Button className="w-full sm:w-auto flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Client
            </Button>
        </Link>
      </div>

      <ClientsFilter />

      <Card>
        <CardHeader>
          <CardTitle>All Clients ({clients.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {clients.length === 0 ? (
            <div className="px-6 py-12 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <svg className="w-6 h-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-foreground">No clients yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Clients let you group projects, track work, and send invoices.
                </p>
              </div>
              <Link href="/clients/new">
                <Button className="mt-2 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add your first client
                </Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      <th className="px-4 py-3">
                        <SortableHeader label="Client" sortKey="name" currentSort={params.sort} basePath="/clients" />
                      </th>
                      <th className="px-4 py-3">
                        <SortableHeader label="Company" sortKey="company" currentSort={params.sort} basePath="/clients" />
                      </th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">
                        <SortableHeader label="Projects" sortKey="projects" currentSort={params.sort} basePath="/clients" />
                      </th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {clients.map((client) => (
                      <tr key={client.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-4 py-3">
                          <Link
                            href={`/clients/${client.id}`}
                            className="flex items-center gap-3"
                          >
                            {client.logo ? (
                              <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden ">
                                <Image
                                  src={client.logo}
                                  alt={client.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center  bg-muted text-muted-foreground">
                                <span className="text-sm font-medium">
                                  {client.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <span className="font-medium text-foreground hover:text-link">
                              {client.name}
                            </span>
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {client.company || '-'}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {client.email || '-'}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={statusColors[client.status]}>
                            {statusLabels[client.status]}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {client.projects.length}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/clients/${client.id}`}
                            className="text-sm text-link hover:text-link/80"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="divide-y divide-border md:hidden">
                {clients.map((client) => (
                  <Link
                    key={client.id}
                    href={`/clients/${client.id}`}
                    className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
                  >
                    {client.logo ? (
                      <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden ">
                        <Image
                          src={client.logo}
                          alt={client.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center  bg-muted text-muted-foreground">
                        <span className="text-lg font-medium">
                          {client.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground truncate">
                          {client.name}
                        </span>
                        <Badge className={statusColors[client.status]}>
                          {statusLabels[client.status]}
                        </Badge>
                      </div>
                      {client.company && (
                        <p className="text-sm text-muted-foreground truncate">{client.company}</p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {client.projects.length} project{client.projects.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <svg className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
