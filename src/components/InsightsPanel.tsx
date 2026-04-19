import Link from 'next/link'
import type { Insight } from '@/actions/dashboard'

const dotColor = {
  red: 'bg-rose-500',
  amber: 'bg-amber-500',
  blue: 'bg-primary',
  green: 'bg-emerald-500',
}

export function InsightsPanel({ insights }: { insights: Insight[] }) {
  if (insights.length === 0) {
    return (
      <div className="px-6 py-10 flex flex-col items-center justify-center text-center">
        <svg className="w-8 h-8 text-emerald-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm text-muted-foreground">You&apos;re all caught up</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-border">
      {insights.map((insight) => (
        <Link
          key={insight.id}
          href={insight.href}
          className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/50 transition-colors"
        >
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor[insight.color]}`} />
          <p className="text-sm text-foreground flex-1 min-w-0">
            {insight.message}
          </p>
          <svg className="w-4 h-4 text-muted-foreground flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      ))}
    </div>
  )
}
