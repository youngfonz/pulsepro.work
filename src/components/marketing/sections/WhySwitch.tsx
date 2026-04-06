import { ScrollReveal } from '../ScrollReveal';

const tools = [
  {
    name: 'Notion',
    pain: 'Beautiful docs, terrible project tracking. You end up building your own system from scratch every time.',
    switch: 'Pulse Pro gives you projects, tasks, and clients out of the box. No templates to configure.',
  },
  {
    name: 'Trello',
    pain: 'Fine for one board. Falls apart when you have 5 clients with different deadlines across 12 projects.',
    switch: 'See all clients, all projects, all deadlines in one dashboard. Filter by what matters right now.',
  },
  {
    name: 'Asana',
    pain: 'Built for 50-person teams with PMs. Half the features you\'ll never touch, none of the simplicity you need.',
    switch: 'Set up in 5 minutes. No onboarding call needed. Just your work, organized.',
  },
  {
    name: 'ClickUp',
    pain: 'Powerful, sure — if you have time to configure 47 features you\'ll never use. You wanted a task manager, not a second job.',
    switch: 'Everything you need, nothing you don\'t. Projects, clients, deadlines — ready in minutes, not hours.',
  },
  {
    name: 'Apple Notes',
    pain: 'Fast to jot things down, impossible to organize. No deadlines, no priorities, no structure when you actually need it.',
    switch: 'Just as fast to capture — press N and type. But with deadlines, priorities, and projects when you\'re ready for them.',
  },
];

export function WhySwitch() {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="text-center">
          <ScrollReveal>
            <h2 className="text-3xl font-semibold text-foreground tracking-tight font-[family-name:var(--font-display)]">
              Why freelancers switch to Pulse Pro.
            </h2>
            <p className="text-base text-muted-foreground mt-3 max-w-lg mx-auto">
              You don&apos;t need a tool built for a 50-person team. You need one that works the way you do.
            </p>
          </ScrollReveal>
        </div>

        <ScrollReveal delay={100}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mt-14">
            {tools.map((tool) => (
              <div
                key={tool.name}
                className="rounded-2xl p-6 bg-[#f5f5f7] dark:bg-[#1d1d1f] hover:shadow-lg transition-all duration-200"
              >
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Switching from
                </p>
                <h3 className="text-lg font-semibold text-foreground mt-1">
                  {tool.name}
                </h3>

                <div className="mt-5 space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <svg className="w-4 h-4 text-destructive flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="text-xs font-medium text-destructive uppercase tracking-wide">The problem</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {tool.pain}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-xs font-medium text-emerald-500 uppercase tracking-wide">With Pulse Pro</span>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">
                      {tool.switch}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
