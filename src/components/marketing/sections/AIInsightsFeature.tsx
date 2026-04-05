import { ScrollReveal } from '../ScrollReveal'

const mockInsights = [
  {
    color: 'bg-rose-500',
    message: 'Acme Rebrand has 3 overdue tasks — prioritize before Friday',
  },
  {
    color: 'bg-amber-500',
    message: "Morris Design Co hasn't been updated in 12 days",
  },
  {
    color: 'bg-blue-500',
    message: '2 high-priority tasks due tomorrow — start with wireframes',
  },
]

export function AIInsightsFeature() {
  return (
    <section className="py-20 md:py-28 bg-muted/30">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <ScrollReveal delay={0}>
          <div className="overflow-hidden rounded-2xl bg-blue-950 border border-blue-900/50 p-8 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              {/* Left: copy */}
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-900 text-blue-300 text-xs font-medium mb-6">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                  </svg>
                  AI-Powered
                </div>

                <h2 className="text-2xl md:text-3xl font-semibold text-white tracking-tight leading-tight">
                  Your projects, analyzed.
                  <br />
                  Priorities, surfaced.
                </h2>

                <p className="text-sm md:text-base text-blue-300 mt-4 max-w-md leading-relaxed">
                  Pulse Pro scans your projects, deadlines, and task patterns to surface what needs attention. No digging through data — just actionable next steps.
                </p>

                <div className="mt-8 flex flex-col gap-3">
                  {[
                    'Flags overdue tasks and at-risk projects',
                    'Spots deadline clusters before they pile up',
                    'Highlights progress so you know what\u2019s working',
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <div className="w-1 h-1 rounded-full bg-blue-700 flex-shrink-0" />
                      <span className="text-sm text-blue-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: mock insights panel */}
              <div className="flex flex-col items-center">
                <div className="w-full rounded-xl bg-blue-900/40 border border-blue-800/50 overflow-hidden">
                  {/* Panel header */}
                  <div className="flex items-center gap-2 px-5 py-3 border-b border-blue-800/50">
                    <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                    </svg>
                    <span className="text-sm font-medium text-blue-200">Insights</span>
                  </div>

                  {/* Mock insight rows */}
                  <div className="divide-y divide-blue-800/30">
                    {mockInsights.map((insight) => (
                      <div key={insight.message} className="flex items-center gap-3 px-5 py-3.5">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${insight.color}`} />
                        <p className="text-sm text-blue-100 flex-1">{insight.message}</p>
                        <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
