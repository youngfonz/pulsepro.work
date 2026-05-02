import { Suspense } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { SettingsClient } from './SettingsClient'
import { BillingCard } from './BillingCard'
import { TelegramCard } from './TelegramCard'
import { SlackCard } from './SlackCard'
import { EmailTaskCard } from './EmailTaskCard'
import { ApiAccessCard } from './ApiAccessCard'

export default function SettingsPage() {
  return (
    <div className="space-y-4 md:space-y-6 max-w-2xl">
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
        <h1 className="mt-2 text-xl md:text-2xl font-bold text-foreground">Settings</h1>
      </div>

      <BillingCard />

      <TelegramCard />

      <Suspense fallback={null}>
        <SlackCard />
      </Suspense>

      <EmailTaskCard />

      <ApiAccessCard />

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <SettingsClient />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Version</span>
            <span className="text-sm text-foreground">1.0.0</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Built with</span>
            <span className="text-sm text-foreground">Next.js, Prisma, Tailwind</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
