import { ScrollReveal } from '../ScrollReveal'

const stats = [
  {
    number: '400',
    suffix: '%',
    label: 'more done per week',
    context: 'when every deadline, client, and task lives in one place.',
  },
  {
    number: '8',
    suffix: 'hrs',
    label: 'saved every week',
    context: 'no more jumping between Notion, Trello, email, and Slack.',
  },
  {
    number: '0',
    suffix: '',
    label: 'missed deadlines',
    context: 'daily reminders, calendar view, and Telegram pings.',
  },
]

export function StatsImpact() {
  return (
    <section className="relative overflow-hidden bg-[#f5f5f7] dark:bg-[#1d1d1f] py-24 md:py-32">
      {/* Ambient coral bloom */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[360px] w-[780px] -translate-x-1/2 rounded-full blur-[130px] opacity-40 dark:opacity-30"
        style={{ background: 'radial-gradient(closest-side, rgba(229,77,46,0.35), transparent 70%)' }}
      />

      <div className="relative max-w-6xl mx-auto px-4 md:px-8">
        <ScrollReveal delay={0}>
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-md px-3.5 py-1.5 text-[11px] font-medium tracking-[0.14em] uppercase text-foreground/70">
              <span className="size-1.5 rounded-full bg-[#E54D2E]" />
              Trusted by 1,200+ freelancers and small teams
            </div>
            <h2 className="mt-6 text-4xl md:text-6xl font-semibold text-foreground tracking-[-0.03em] font-[family-name:var(--font-display)]">
              Numbers that <span className="italic font-light">speak</span>.
            </h2>
            <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
              Real outcomes from solo operators and small teams running Pulse Pro as their daily driver.
            </p>
          </div>

          <div className="mt-16 md:mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0 md:divide-x divide-black/5 dark:divide-white/10">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className="relative text-center md:px-8"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex items-baseline justify-center">
                  <span
                    className="text-7xl md:text-[128px] leading-none font-semibold tracking-[-0.06em] tabular-nums font-[family-name:var(--font-display)] bg-clip-text text-transparent bg-[linear-gradient(180deg,var(--foreground)_0%,var(--foreground)_55%,#E54D2E_115%)]"
                  >
                    {stat.number}
                  </span>
                  {stat.suffix && (
                    <span className="ml-1 text-2xl md:text-3xl font-medium text-[#E54D2E] tracking-tight font-[family-name:var(--font-display)]">
                      {stat.suffix}
                    </span>
                  )}
                </div>
                <p className="mt-3 text-sm md:text-base font-medium text-foreground">
                  {stat.label}
                </p>
                <p className="mt-2 text-xs md:text-sm text-muted-foreground leading-relaxed max-w-[240px] mx-auto">
                  {stat.context}
                </p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
