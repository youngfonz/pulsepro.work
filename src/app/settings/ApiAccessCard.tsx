'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import {
  getIntegrationSettings,
  generateApiToken,
  revokeApiToken,
  regenerateApiToken,
} from '@/actions/integrations'

function CopyButton({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors shrink-0"
      title={`Copy ${label || 'value'}`}
    >
      {copied ? (
        <svg className="w-3 h-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )}
      {label && <span>{copied ? 'Copied' : label}</span>}
    </button>
  )
}

export function ApiAccessCard() {
  const [plan, setPlan] = useState<string | null>(null)
  const [hasToken, setHasToken] = useState(false)
  // freshToken is only set when the user just generated/regenerated — it's the only time they see the plain text
  const [freshToken, setFreshToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showToken, setShowToken] = useState(false)
  const [showSetup, setShowSetup] = useState(false)

  useEffect(() => {
    getIntegrationSettings()
      .then((s) => {
        setPlan(s.plan)
        setHasToken(s.hasApiToken)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ApiIcon />
            Siri &amp; Shortcuts
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ApiIcon />
            Siri &amp; Shortcuts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            Create tasks from Siri, Apple Shortcuts, or any tool that can make HTTP requests.
          </p>
          <a
            href={`/api/checkout?products=${process.env.NEXT_PUBLIC_POLAR_PRO_PRODUCT_ID || ''}`}
            className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Upgrade to Pro
          </a>
        </CardContent>
      </Card>
    )
  }

  async function handleGenerate() {
    setActionLoading(true)
    try {
      const result = await generateApiToken()
      if ('token' in result && result.token) {
        setFreshToken(result.token)
        setHasToken(true)
        setShowToken(true)
      } else if ('hasToken' in result && result.hasToken) {
        setHasToken(true)
      }
    } catch {
      // silently fail — button returns to normal
    } finally {
      setActionLoading(false)
    }
  }

  async function handleRevoke() {
    if (!confirm('Revoking will immediately disable API access. Continue?')) return
    setActionLoading(true)
    try {
      await revokeApiToken()
      setHasToken(false)
      setFreshToken(null)
      setShowToken(false)
    } catch {
      // silently fail — button returns to normal
    } finally {
      setActionLoading(false)
    }
  }

  async function handleRegenerate() {
    if (!confirm('Regenerating will invalidate your current token. Continue?')) return
    setActionLoading(true)
    try {
      const result = await regenerateApiToken()
      if ('token' in result && result.token) {
        setFreshToken(result.token)
        setShowToken(true)
      }
    } catch {
      // silently fail — button returns to normal
    } finally {
      setActionLoading(false)
    }
  }

  function handleCopy() {
    if (!freshToken) return
    navigator.clipboard.writeText(freshToken)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const maskedToken = freshToken ? `${freshToken.slice(0, 6)}${'*'.repeat(20)}` : null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ApiIcon />
          Siri &amp; Shortcuts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasToken ? (
          <>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-sm text-foreground">API access enabled</span>
            </div>

            {freshToken ? (
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">Your API token</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-muted rounded-lg text-sm font-mono text-foreground truncate">
                    {showToken ? freshToken : maskedToken}
                  </code>
                  <button
                    onClick={() => setShowToken(!showToken)}
                    className="shrink-0 p-2 text-muted-foreground hover:text-foreground transition-colors"
                    title={showToken ? 'Hide token' : 'Show token'}
                  >
                    {showToken ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={handleCopy}
                    className="shrink-0 p-2 text-muted-foreground hover:text-foreground transition-colors"
                    title="Copy token"
                  >
                    {copied ? (
                      <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-amber-500 mt-2">
                  Copy this token now — it won&apos;t be shown again.
                </p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Your token is stored securely. Regenerate to get a new one.
              </p>
            )}

            {/* Siri Shortcut setup */}
            <div className="pt-3 border-t border-border">
              <button
                onClick={() => setShowSetup(!showSetup)}
                className="flex items-center gap-2 w-full text-left"
              >
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Apple Shortcuts Setup
                </p>
                <svg
                  className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${showSetup ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showSetup && (
                <div className="mt-3 space-y-4 text-xs text-muted-foreground">
                  {/* Step 1 */}
                  <div>
                    <div className="font-medium text-foreground mb-1">Step 1: Create a new shortcut</div>
                    <p>Open the <b>Shortcuts</b> app on your iPhone. Tap the <b>+</b> button in the top right to create a new shortcut.</p>
                  </div>

                  {/* Step 2 */}
                  <div>
                    <div className="font-medium text-foreground mb-1">Step 2: Add &quot;Ask for Input&quot;</div>
                    <p>In the search bar at the bottom, type <b>Ask for Input</b> and tap it to add it. Change the prompt text to:</p>
                    <div className="mt-1.5 flex items-center gap-2 bg-muted rounded-md px-2.5 py-1.5">
                      <code className="text-foreground text-[11px] flex-1">What&apos;s the task?</code>
                      <CopyButton value="What's the task?" />
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div>
                    <div className="font-medium text-foreground mb-1">Step 3: Add &quot;Get Contents of URL&quot;</div>
                    <p>Search for <b>Get Contents of URL</b> and tap it to add it below the input action. Tap the URL field and paste:</p>
                    <div className="mt-1.5 flex items-center gap-2 bg-muted rounded-md px-2.5 py-1.5">
                      <code className="text-foreground text-[11px] flex-1 break-all">https://www.pulsepro.work/api/v1/tasks</code>
                      <CopyButton value="https://www.pulsepro.work/api/v1/tasks" label="Copy" />
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div>
                    <div className="font-medium text-foreground mb-1">Step 4: Change method to POST</div>
                    <p>Tap the <b>&rsaquo;</b> arrow next to the URL to expand the details. Tap <b>Method</b> and change it to <b>POST</b>.</p>
                  </div>

                  {/* Step 5 */}
                  <div>
                    <div className="font-medium text-foreground mb-1">Step 5: Add the authorization header</div>
                    <p>Under <b>Headers</b>, tap <b>Add new header</b>. Set the key to <b>Authorization</b> and the value to:</p>
                    <div className="mt-1.5 flex items-center gap-2 bg-muted rounded-md px-2.5 py-1.5">
                      <code className="text-foreground text-[11px] flex-1 truncate">Bearer {freshToken && showToken ? freshToken : 'YOUR_TOKEN'}</code>
                      {freshToken && <CopyButton value={`Bearer ${freshToken}`} label="Copy" />}
                    </div>
                  </div>

                  {/* Step 6 */}
                  <div>
                    <div className="font-medium text-foreground mb-1">Step 6: Set up the JSON body</div>
                    <p>Tap <b>Request Body</b> and change it to <b>JSON</b>. Then tap <b>Add new field</b>:</p>
                    <ul className="mt-1.5 space-y-1 pl-3">
                      <li>Choose <b>Text</b> as the type</li>
                      <li>Set the key to <b>text</b></li>
                      <li>For the value, tap the field, then tap the <b>variable icon</b> (wand) above the keyboard and select <b>Ask for Input</b> from the list</li>
                    </ul>
                  </div>

                  {/* Step 7 */}
                  <div>
                    <div className="font-medium text-foreground mb-1">Step 7: Add confirmation</div>
                    <p>Search for <b>Get Dictionary Value</b> and add it. Set the key to <b>message</b>. Then search for <b>Show Notification</b> and add it &mdash; set the body to the <b>Dictionary Value</b> variable. This shows a confirmation after each task is created.</p>
                  </div>

                  {/* Step 8 */}
                  <div>
                    <div className="font-medium text-foreground mb-1">Step 8: Name it and try it</div>
                    <p>Tap the name at the top and rename it to <b>Add Pulse Task</b>. Now say:</p>
                    <p className="mt-1 font-medium text-foreground">&quot;Hey Siri, Add Pulse Task&quot;</p>
                  </div>

                  {/* Voice examples */}
                  <div className="pt-2 border-t border-border">
                    <div className="font-medium text-foreground mb-1">What you can say</div>
                    <p>Pulse Pro parses your full sentence &mdash; just speak naturally:</p>
                    <ul className="mt-1.5 space-y-1 pl-3">
                      <li>&quot;Buy groceries&quot;</li>
                      <li>&quot;Send invoice for the <b>Acme</b> project&quot;</li>
                      <li>&quot;Call plumber <b>high priority</b>&quot;</li>
                      <li>&quot;Review mockups for <b>Rebrand</b>, <b>due tomorrow</b>&quot;</li>
                    </ul>
                    <p className="mt-1.5">Project names are matched automatically. Priority, due dates, and project are all optional.</p>
                  </div>
                </div>
              )}
            </div>

            {/* curl example */}
            <div className="pt-3 border-t border-border">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                API Example
              </p>
              <code className="block px-3 py-2 bg-muted rounded-lg text-[11px] font-mono text-muted-foreground whitespace-pre-wrap break-all">
{`curl -X POST https://www.pulsepro.work/api/v1/tasks \\
  -H "Authorization: Bearer ${freshToken && showToken ? freshToken : 'YOUR_TOKEN'}" \\
  -H "Content-Type: application/json" \\
  -d '{"title": "Buy groceries", "priority": "high"}'`}
              </code>
            </div>

            <div className="flex items-center gap-4 pt-1">
              <button
                onClick={handleRegenerate}
                disabled={actionLoading}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Regenerate token
              </button>
              <button
                onClick={handleRevoke}
                disabled={actionLoading}
                className="text-sm text-red-500 hover:text-red-400 transition-colors"
              >
                Revoke access
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Generate an API token to create tasks from Siri, Apple Shortcuts, Zapier, or any HTTP client. Works on iPhone, iPad, Mac, and Apple Watch.
            </p>
            <button
              onClick={handleGenerate}
              disabled={actionLoading}
              className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              {actionLoading ? 'Generating...' : 'Generate API Token'}
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ApiIcon() {
  return (
    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  )
}
