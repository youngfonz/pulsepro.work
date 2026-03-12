'use client'

import Link from 'next/link'
import { ScrollReveal } from '@/components/marketing/ScrollReveal'

const plans = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for trying it out.',
    features: [
      '3 projects, 50 tasks, 1 client',
      'Kanban board & calendar',
      'Search & command bar',
      'File attachments',
    ],
    highlighted: false,
    cta: 'Get Started',
    href: '/sign-up',
  },
  {
    name: 'Pro',
    price: '$12',
    badge: 'Most Popular',
    description: 'Everything you need to manage clients.',
    features: [
      'Unlimited projects, tasks & clients',
      'Professional invoicing',
      'Siri, Telegram & email integrations',
      'Voice input & AI insights',
      'Share with up to 3 collaborators',
      'Daily email reminders',
      'Priority support',
    ],
    highlighted: true,
    cta: 'Get Started',
    href: '/sign-up?plan=pro',
  },
  {
    name: 'Team',
    price: '$29',
    description: 'For agencies and small teams.',
    features: [
      'Everything in Pro',
      'Up to 10 team members',
      'Full role-based access control',
      'Organization workspace',
      'Team project sharing',
      'Priority support',
    ],
    highlighted: false,
    cta: 'Get Started',
    href: '/sign-up?plan=team',
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="py-20 md:py-28 bg-muted/30">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <h2 className="text-3xl font-semibold text-foreground text-center tracking-tight">
          Simple pricing
        </h2>
        <p className="text-base text-muted-foreground mt-3 text-center">
          No per-seat fees. No annual contracts. No surprise price hikes. Ever.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative ${
                plan.highlighted
                  ? 'border-2 border-foreground shadow-lg'
                  : 'border border-border'
              } rounded-xl p-8`}
            >
              {'badge' in plan && plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center rounded-full bg-foreground text-background px-3 py-0.5 text-xs font-medium">
                    {plan.badge}
                  </span>
                </div>
              )}
              <div className="text-sm font-medium text-muted-foreground">
                {plan.name}
              </div>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-semibold text-foreground tracking-tight">{plan.price}</span>
                <span className="text-sm text-muted-foreground">/month</span>
              </div>

              <p className="text-sm text-muted-foreground mt-2">
                {plan.description}
              </p>

              <ul className="mt-6 space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <svg
                      className="w-4 h-4 text-muted-foreground flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`mt-6 block rounded-full px-5 py-2.5 w-full text-center text-sm font-medium transition-colors ${
                  plan.highlighted
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'border border-border hover:bg-muted'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Cost comparison */}
        <div className="mt-12 border border-border rounded-xl p-6 max-w-2xl mx-auto">
          <p className="text-sm font-semibold text-foreground text-center">
            What 10 users actually costs per month
          </p>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { tool: 'Monday.com', cost: '$90' },
              { tool: 'Asana', cost: '$110' },
              { tool: 'ClickUp', cost: '$70' },
            ].map((item) => (
              <div key={item.tool} className="text-center py-2 px-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">{item.tool}</p>
                <p className="text-sm font-semibold text-muted-foreground line-through">{item.cost}/mo</p>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              10 users on Pulse Pro: <span className="font-semibold text-foreground">$29/mo flat</span>. No per-seat math.
            </p>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Free plan included. No credit card required.
        </p>
      </div>
    </section>
  )
}
