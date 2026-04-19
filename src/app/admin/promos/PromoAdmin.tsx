'use client'

import { useState, useTransition } from 'react'
import { createPromoCode, deactivatePromoCode, getPromoCodes } from '@/actions/promo'

type PromoCode = {
  id: string
  code: string
  plan: string
  maxUses: number
  usedCount: number
  expiresAt: Date | null
  active: boolean
  createdAt: Date
  _count: { redemptions: number }
}

export function PromoAdmin({ initialCodes }: { initialCodes: PromoCode[] }) {
  const [codes, setCodes] = useState(initialCodes)
  const [plan, setPlan] = useState<'pro' | 'team'>('team')
  const [maxUses, setMaxUses] = useState('10')
  const [expiryDays, setExpiryDays] = useState('30')
  const [isPending, startTransition] = useTransition()
  const [lastCreated, setLastCreated] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  function handleCreate() {
    startTransition(async () => {
      const result = await createPromoCode(plan, parseInt(maxUses) || 10, parseInt(expiryDays) || undefined)
      setLastCreated(result.code)
      const updated = await getPromoCodes()
      setCodes(updated)
    })
  }

  function handleDeactivate(id: string) {
    startTransition(async () => {
      await deactivatePromoCode(id)
      const updated = await getPromoCodes()
      setCodes(updated)
    })
  }

  function handleCopy(code: string) {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Create form */}
      <div className="rounded-lg border border-border p-4 space-y-4">
        <h2 className="text-sm font-semibold text-foreground">Generate New Code</h2>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Plan</label>
            <select
              value={plan}
              onChange={e => setPlan(e.target.value as 'pro' | 'team')}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="pro">Pro</option>
              <option value="team">Team</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Max Uses</label>
            <input
              type="number"
              value={maxUses}
              onChange={e => setMaxUses(e.target.value)}
              className="w-20 rounded-lg border border-border bg-background px-3 py-2 text-sm"
              min={1}
              max={1000}
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">Expires In (days)</label>
            <input
              type="number"
              value={expiryDays}
              onChange={e => setExpiryDays(e.target.value)}
              className="w-24 rounded-lg border border-border bg-background px-3 py-2 text-sm"
              min={1}
              placeholder="Never"
            />
          </div>
          <button
            onClick={handleCreate}
            disabled={isPending}
            className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isPending ? 'Generating...' : 'Generate Code'}
          </button>
        </div>

        {lastCreated && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <code className="text-lg font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">
              {lastCreated}
            </code>
            <button
              onClick={() => handleCopy(lastCreated)}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        )}
      </div>

      {/* Codes table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-4 py-2 font-medium text-muted-foreground">Code</th>
              <th className="text-left px-4 py-2 font-medium text-muted-foreground">Plan</th>
              <th className="text-left px-4 py-2 font-medium text-muted-foreground">Used</th>
              <th className="text-left px-4 py-2 font-medium text-muted-foreground">Expires</th>
              <th className="text-left px-4 py-2 font-medium text-muted-foreground">Status</th>
              <th className="text-right px-4 py-2 font-medium text-muted-foreground"></th>
            </tr>
          </thead>
          <tbody>
            {codes.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No promo codes yet. Generate one above.
                </td>
              </tr>
            )}
            {codes.map(c => {
              const expired = c.expiresAt && new Date(c.expiresAt) < new Date()
              const exhausted = c.usedCount >= c.maxUses
              const isActive = c.active && !expired && !exhausted

              return (
                <tr key={c.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleCopy(c.code)}
                      className="font-mono font-semibold text-foreground hover:text-primary transition-colors"
                      title="Click to copy"
                    >
                      {c.code}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      c.plan === 'team'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-emerald-500/10 text-emerald-500'
                    }`}>
                      {c.plan.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {c.usedCount} / {c.maxUses}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {c.expiresAt
                      ? new Date(c.expiresAt).toLocaleDateString()
                      : 'Never'}
                  </td>
                  <td className="px-4 py-3">
                    {isActive ? (
                      <span className="text-emerald-500 text-xs font-medium">Active</span>
                    ) : (
                      <span className="text-muted-foreground text-xs">
                        {!c.active ? 'Deactivated' : expired ? 'Expired' : 'Exhausted'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {c.active && (
                      <button
                        onClick={() => handleDeactivate(c.id)}
                        disabled={isPending}
                        className="text-xs text-destructive hover:underline disabled:opacity-50"
                      >
                        Deactivate
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
