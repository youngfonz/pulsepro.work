import Link from 'next/link'

export const dynamic = 'force-dynamic'

const docs = [
  {
    title: 'QA Checklist',
    description: 'Automated verification dashboard — code-verified items, E2E tests, and manual checks',
    href: '/api/admin/docs/qa',
    external: true,
  },
  {
    title: 'Feature Catalog',
    description: 'Complete feature inventory with plan-tier badges across all categories',
    href: '/api/admin/docs/features',
    external: true,
  },
  {
    title: 'Knowledge Base',
    description: 'User-facing product documentation — how-to guides for every feature',
    href: '/kb',
    external: false,
  },
]

export default function AdminDocsPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Admin
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-foreground">Docs</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Bookmark this page for quick access to all documentation
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {docs.map((doc) => (
          <a
            key={doc.title}
            href={doc.href}
            target={doc.external ? '_blank' : undefined}
            rel={doc.external ? 'noopener noreferrer' : undefined}
            className="rounded-lg border border-border px-5 py-4 hover:bg-muted/50 transition-colors flex items-center justify-between gap-4"
          >
            <div>
              <p className="text-sm font-medium text-foreground">{doc.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{doc.description}</p>
            </div>
            <svg className="w-4 h-4 text-muted-foreground shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {doc.external ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              )}
            </svg>
          </a>
        ))}
      </div>

      <div className="rounded-lg border border-dashed border-border px-5 py-4">
        <p className="text-xs text-muted-foreground">
          Source files live in <code className="text-foreground">docs/</code> and <code className="text-foreground">src/app/kb/page.tsx</code>
        </p>
      </div>
    </div>
  )
}
