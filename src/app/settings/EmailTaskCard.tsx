'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import {
  getIntegrationSettings,
  generateEmailToken,
  regenerateEmailToken,
} from '@/actions/integrations'

const EMAIL_DOMAIN = process.env.NEXT_PUBLIC_EMAIL_DOMAIN || 'in.pulsepro.work'

export function EmailTaskCard() {
  const [plan, setPlan] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    getIntegrationSettings()
      .then((s) => {
        setPlan(s.plan)
        setToken(s.emailToken)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <EmailIcon />
            Email to Task
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

  if (plan !== 'pro' && plan !== 'team') {
    return (
      <Card className="opacity-60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <EmailIcon />
            Email to Task
            <span className="ml-auto text-[10px] font-medium uppercase tracking-wider text-muted-foreground border border-border rounded px-1.5 py-0.5">Pro</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Forward emails to your personal Pulse Pro address and they become tasks automatically.
          </p>
        </CardContent>
      </Card>
    )
  }

  async function handleGenerate() {
    setActionLoading(true)
    try {
      const result = await generateEmailToken()
      if ('token' in result && result.token) {
        setToken(result.token)
      }
    } catch {
      // silently fail — button returns to normal
    } finally {
      setActionLoading(false)
    }
  }

  async function handleRegenerate() {
    if (!confirm('Regenerating will invalidate your current email address. Continue?')) return
    setActionLoading(true)
    try {
      const result = await regenerateEmailToken()
      if ('token' in result && result.token) {
        setToken(result.token)
      }
    } catch {
      // silently fail — button returns to normal
    } finally {
      setActionLoading(false)
    }
  }

  function handleCopy() {
    if (!token) return
    navigator.clipboard.writeText(`${token}@${EMAIL_DOMAIN}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const emailAddress = token ? `${token}@${EMAIL_DOMAIN}` : null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <EmailIcon />
          Email to Task
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {token ? (
          <>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2 w-2 rounded-full bg-success" />
              <span className="text-sm text-foreground">Email address active</span>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1.5">Your task email address</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-muted rounded-lg text-sm font-mono text-foreground truncate">
                  {emailAddress}
                </code>
                <button
                  onClick={handleCopy}
                  className="shrink-0 p-2 text-muted-foreground hover:text-foreground transition-colors"
                  title="Copy address"
                >
                  {copied ? (
                    <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-border">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                How it works
              </p>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div>Forward or send any email to the address above</div>
                <div>Email <b>subject</b> becomes the task title</div>
                <div>Email <b>body</b> becomes the description</div>
                <div>Use <code className="text-foreground">[Project Name]</code> in the subject to assign to a project</div>
              </div>
            </div>

            <button
              onClick={handleRegenerate}
              disabled={actionLoading}
              className="text-sm text-destructive hover:text-destructive/80 transition-colors"
            >
              {actionLoading ? 'Regenerating...' : 'Regenerate address'}
            </button>
          </>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Forward emails to your personal Pulse Pro address and they become tasks automatically. Subject becomes the title, body becomes the description.
            </p>
            <button
              onClick={handleGenerate}
              disabled={actionLoading}
              className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              {actionLoading ? 'Generating...' : 'Generate Email Address'}
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function EmailIcon() {
  return (
    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  )
}
