import Link from 'next/link'
import { ScrollReveal } from '@/components/marketing/ScrollReveal'

const plans = [
  {
    name: 'Free',
    price: '0',
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
    price: '12',
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
    cta: 'Start Free Trial',
    href: '/sign-up?plan=pro',
  },
  {
    name: 'Team',
    price: '29',
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
    <section id="pricing" className="relative overflow-hidden py-24 md:py-32">
      {/* Ambient glow behind Pro card */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[140px] opacity-40 dark:opacity-25"
        style={{ background: 'radial-gradient(closest-side, rgba(229,77,46,0.45), transparent 70%)' }}
      />

      <div className="relative max-w-5xl mx-auto px-4 md:px-8">
        <div className="text-center max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-md px-3.5 py-1.5 text-[11px] font-medium tracking-[0.14em] uppercase text-foreground/70">
            <span className="size-1.5 rounded-full bg-[#E54D2E]" />
            Simple pricing
          </div>
          <h2 className="mt-6 text-4xl md:text-5xl font-semibold text-foreground tracking-[-0.03em] font-[family-name:var(--font-display)]">
            One price. <span className="italic font-light">No</span> surprises.
          </h2>
          <p className="mt-4 text-base md:text-lg text-muted-foreground">
            No per-seat fees. No annual contracts. No surprise price hikes. Ever.
          </p>
        </div>

        <ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-14 md:mt-16">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-3xl p-8 transition-all duration-300 ${
                  plan.highlighted
                    ? 'bg-[#1a1a1a] text-white shadow-[0_30px_60px_-15px_rgba(229,77,46,0.45),0_16px_40px_-10px_rgba(0,0,0,0.4)] md:-translate-y-2 md:scale-[1.02]'
                    : 'bg-white dark:bg-[#232325] ring-1 ring-black/5 dark:ring-white/5 hover:ring-[#E54D2E]/30 hover:-translate-y-1'
                }`}
              >
                {plan.highlighted && (
                  <>
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 rounded-3xl opacity-40"
                      style={{
                        background:
                          'radial-gradient(120% 80% at 50% -10%, rgba(229,77,46,0.35) 0%, transparent 60%)',
                      }}
                    />
                    <div className="absolute inset-x-0 -top-0.5 mx-auto h-px w-2/3 bg-gradient-to-r from-transparent via-[#E54D2E]/60 to-transparent" />
                  </>
                )}

                {'badge' in plan && plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E54D2E] text-white px-3 py-1 text-[10px] font-semibold tracking-[0.14em] uppercase shadow-[0_6px_16px_-4px_rgba(229,77,46,0.6)]">
                      <span className="size-1 rounded-full bg-white" />
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="relative">
                  <div
                    className={`text-xs font-medium tracking-[0.14em] uppercase ${
                      plan.highlighted ? 'text-[#F0613E]' : 'text-muted-foreground'
                    }`}
                  >
                    {plan.name}
                  </div>

                  <div className="mt-5 flex items-baseline gap-1">
                    <span
                      className={`text-xl font-medium ${plan.highlighted ? 'text-white/60' : 'text-muted-foreground'}`}
                    >
                      $
                    </span>
                    <span
                      className={`text-6xl md:text-7xl font-semibold tracking-[-0.05em] tabular-nums font-[family-name:var(--font-display)] ${
                        plan.highlighted ? 'text-white' : 'text-foreground'
                      }`}
                    >
                      {plan.price}
                    </span>
                    <span
                      className={`text-sm ml-1 ${
                        plan.highlighted ? 'text-white/50' : 'text-muted-foreground'
                      }`}
                    >
                      /month
                    </span>
                  </div>

                  <p
                    className={`text-sm mt-3 ${
                      plan.highlighted ? 'text-white/60' : 'text-muted-foreground'
                    }`}
                  >
                    {plan.description}
                  </p>

                  <div
                    className={`my-7 h-px ${
                      plan.highlighted ? 'bg-white/10' : 'bg-black/5 dark:bg-white/10'
                    }`}
                  />

                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span
                          className={`mt-0.5 size-4 shrink-0 rounded-full flex items-center justify-center ${
                            plan.highlighted
                              ? 'bg-[#E54D2E]/20 text-[#F0613E]'
                              : 'bg-[#E54D2E]/10 text-[#E54D2E]'
                          }`}
                        >
                          <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                        <span
                          className={`text-sm ${plan.highlighted ? 'text-white/90' : 'text-foreground'}`}
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={plan.href}
                    className={`mt-8 block rounded-full px-5 py-3 w-full text-center text-sm font-semibold tracking-tight transition-all duration-200 ${
                      plan.highlighted
                        ? 'bg-[#E54D2E] text-white hover:bg-[#F0613E] hover:-translate-y-0.5 shadow-[0_10px_24px_-6px_rgba(229,77,46,0.55)]'
                        : 'bg-foreground text-background hover:-translate-y-0.5'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Cost comparison */}
        <ScrollReveal delay={100}>
          <div className="mt-14 md:mt-20 rounded-2xl bg-[#f5f5f7] dark:bg-[#1d1d1f] p-6 md:p-8 max-w-3xl mx-auto">
            <p className="text-xs font-medium text-muted-foreground tracking-[0.14em] uppercase text-center">
              Cost for 10 users per month
            </p>
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 items-end">
              {[
                { tool: 'Monday', cost: '90' },
                { tool: 'Asana', cost: '110' },
                { tool: 'ClickUp', cost: '70' },
              ].map((item) => (
                <div
                  key={item.tool}
                  className="text-center py-4 px-3 rounded-xl bg-white dark:bg-[#2d2d2f]"
                >
                  <p className="text-[11px] text-muted-foreground">{item.tool}</p>
                  <p className="mt-1 text-xl font-semibold text-muted-foreground/60 line-through tabular-nums font-[family-name:var(--font-display)]">
                    ${item.cost}
                  </p>
                </div>
              ))}
              <div className="relative text-center py-4 px-3 rounded-xl bg-[#1a1a1a] text-white shadow-[0_14px_30px_-8px_rgba(229,77,46,0.5)]">
                <p className="text-[11px] text-[#F0613E] font-semibold tracking-wide">Pulse Pro</p>
                <p className="mt-1 text-2xl font-semibold text-white tabular-nums font-[family-name:var(--font-display)]">
                  $29
                </p>
                <p className="text-[10px] text-white/50 mt-0.5">flat</p>
              </div>
            </div>
            <p className="mt-5 text-center text-sm text-muted-foreground">
              Scale your team. Not your bill.
            </p>
          </div>
        </ScrollReveal>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Free plan included. No credit card required.
        </p>
      </div>
    </section>
  )
}
