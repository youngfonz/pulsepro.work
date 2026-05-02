'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { getSlackSettings, unlinkSlack } from '@/actions/slack'

type SlackState = Awaited<ReturnType<typeof getSlackSettings>>

export function SlackCard() {
  const [state, setState] = useState<SlackState | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [flash, setFlash] = useState<string | null>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    getSlackSettings()
      .then(setState)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const slackParam = searchParams.get('slack')
    if (slackParam === 'connected') setFlash('Slack connected successfully.')
    else if (slackParam === 'upgrade') setFlash('Upgrade to Pro to connect Slack.')
    else if (slackParam === 'error') setFlash('Something went wrong. Please try again.')
  }, [searchParams])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SlackIcon />
            Slack
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-2/3" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!state || (state.plan !== 'pro' && state.plan !== 'team')) {
    return (
      <Card className="opacity-60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SlackIcon />
            Slack
            <span className="ml-auto text-[10px] font-medium uppercase tracking-wider text-muted-foreground border border-border rounded px-1.5 py-0.5">Pro</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Create tasks from any Slack channel with <code className="text-foreground">/pulse task title</code>.
          </p>
        </CardContent>
      </Card>
    )
  }

  async function handleUnlink() {
    if (!confirm('Disconnect Slack? You will no longer be able to create tasks via /pulse.')) return
    setActionLoading(true)
    try {
      await unlinkSlack()
      setState((s) => (s ? { ...s, linked: false } : s))
      setFlash(null)
    } catch {
      // silently fail
    } finally {
      setActionLoading(false)
    }
  }

  const clientId = process.env.NEXT_PUBLIC_SLACK_CLIENT_ID
  const redirectUri = 'https://pulsepro.work/api/webhook/slack/oauth'
  const oauthUrl = clientId && state?.userId
    ? `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=commands,chat:write&state=${encodeURIComponent(state.userId)}&redirect_uri=${encodeURIComponent(redirectUri)}`
    : '#'

  return (
    <Card id="slack">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SlackIcon />
          Slack
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {flash && (
          <p className={`text-sm ${flash.includes('connected') ? 'text-success' : 'text-destructive'}`}>
            {flash}
          </p>
        )}

        {state.linked ? (
          <>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2 w-2 rounded-full bg-success" />
              <span className="text-sm text-foreground">Slack workspace connected</span>
            </div>
            <button
              onClick={handleUnlink}
              disabled={actionLoading}
              className="text-sm text-destructive hover:text-destructive/80 transition-colors"
            >
              Disconnect Slack
            </button>
          </>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Create tasks from any Slack channel with the <code className="text-foreground">/pulse</code> slash command.
            </p>
            <a
              href={oauthUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-[#4A154B] text-white px-4 py-2 text-sm font-medium hover:bg-[#4A154B]/90 transition-colors"
            >
              <SlackIcon white />
              Add to Slack
            </a>
          </div>
        )}

        <div className="pt-3 border-t border-border">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Usage
          </p>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div><code className="text-foreground">/pulse Buy groceries</code> — Create a task</div>
            <div><code className="text-foreground">/pulse [Acme] Write proposal high</code> — Add to project, high priority</div>
            <div><code className="text-foreground">/pulse [Acme] Review mockups due tomorrow</code> — With due date</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function SlackIcon({ white }: { white?: boolean }) {
  return (
    <svg
      className={`w-5 h-5 ${white ? '' : 'text-[#4A154B]'}`}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
    </svg>
  )
}
