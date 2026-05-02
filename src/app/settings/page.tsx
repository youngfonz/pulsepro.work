import { Suspense } from 'react'
import Link from 'next/link'
import { SettingsClient } from './SettingsClient'
import { BillingCard } from './BillingCard'
import { TelegramCard } from './TelegramCard'
import { SlackCard } from './SlackCard'
import { EmailTaskCard } from './EmailTaskCard'
import { ApiAccessCard } from './ApiAccessCard'
import { CollapsibleSection } from './CollapsibleSection'

export default function SettingsPage() {
  return (
    <div className="space-y-2 max-w-2xl">
      <div className="mb-4">
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

      <CollapsibleSection title="Billing" defaultOpen>
        <BillingCard />
      </CollapsibleSection>

      <CollapsibleSection title="Telegram Bot">
        <TelegramCard />
      </CollapsibleSection>

      <CollapsibleSection title="Slack">
        <Suspense fallback={null}>
          <SlackCard />
        </Suspense>
      </CollapsibleSection>

      <CollapsibleSection title="Email to Task">
        <EmailTaskCard />
      </CollapsibleSection>

      <CollapsibleSection title="Siri & Shortcuts">
        <ApiAccessCard />
      </CollapsibleSection>

      <CollapsibleSection title="Appearance">
        <div className="px-3 sm:px-5 py-3">
          <SettingsClient />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="About">
        <div className="px-3 sm:px-5 py-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Version</span>
            <span className="text-sm text-foreground">1.0.0</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Built with</span>
            <span className="text-sm text-foreground">Next.js, Prisma, Tailwind</span>
          </div>
        </div>
      </CollapsibleSection>
    </div>
  )
}
