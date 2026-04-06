import { ScrollReveal } from '../ScrollReveal'

const stats = [
  {
    number: '400%',
    label: 'more done per week',
    context: 'when every deadline, client, and task is in one place.',
  },
  {
    number: '8 hrs',
    label: 'saved every week',
    context: 'no more jumping between Notion, Trello, email, and Slack.',
  },
  {
    number: '0',
    label: 'missed deadlines',
    context: 'daily reminders, calendar view, and Telegram pings.',
  },
]

export function StatsImpact() {
  return (
    <section className="bg-[#f5f5f7] dark:bg-[#1d1d1f] py-16 md:py-20">
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        <ScrollReveal delay={0}>
          <p className="text-sm font-medium text-muted-foreground text-center tracking-wide uppercase mb-2">
            Trusted by 1,200+ freelancers and small teams
          </p>
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground text-center tracking-tight mb-12 font-[family-name:var(--font-display)]">
            The numbers speak for themselves.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
            {stats.map((stat, i) => (
              <div key={stat.label} className="text-center">
                <p className="text-4xl md:text-5xl font-bold text-foreground tracking-tight font-[family-name:var(--font-display)]">
                  {stat.number}
                </p>
                <p className="text-sm font-medium text-muted-foreground mt-2">
                  {stat.label}
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1.5 leading-relaxed max-w-[220px] mx-auto">
                  {stat.context}
                </p>
                {i < stats.length - 1 && (
                  <div className="md:hidden w-12 h-px bg-border mx-auto mt-8" />
                )}
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
