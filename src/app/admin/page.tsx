import Link from 'next/link'
import { getAdminStats, getMaintenanceMode } from '@/actions/admin'
import { MaintenanceToggle } from './MaintenanceToggle'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const [stats, maintenanceMode] = await Promise.all([
    getAdminStats(),
    getMaintenanceMode(),
  ])

  const cards = [
    { label: 'Total Users', value: stats.totalUsers },
    { label: 'Pro Users', value: stats.proUsers },
    { label: 'Projects', value: stats.totalProjects },
    { label: 'Tasks', value: stats.totalTasks },
    { label: 'Clients', value: stats.totalClients },
  ]

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin</h1>
          <p className="text-sm text-muted-foreground mt-1">Platform overview</p>
        </div>
      </div>

      <MaintenanceToggle enabled={maintenanceMode} />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-lg border border-border px-4 py-3"
          >
            <p className="text-xs text-muted-foreground">{card.label}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80"
        >
          View all users
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">Internal Docs</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a
            href="/api/admin/docs/qa"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-border px-4 py-3 hover:bg-muted/50 transition-colors"
          >
            <p className="text-sm font-medium text-foreground">QA Checklist</p>
            <p className="text-xs text-muted-foreground mt-1">262/291 verified (90%)</p>
          </a>
          <a
            href="/api/admin/docs/features"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-border px-4 py-3 hover:bg-muted/50 transition-colors"
          >
            <p className="text-sm font-medium text-foreground">Feature Catalog</p>
            <p className="text-xs text-muted-foreground mt-1">206 features across 12 categories</p>
          </a>
        </div>
      </div>
    </div>
  )
}
