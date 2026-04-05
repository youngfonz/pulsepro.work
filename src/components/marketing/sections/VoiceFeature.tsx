import { ScrollReveal } from '../ScrollReveal'

export function VoiceFeature() {
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
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  Voice Input
                </div>

                <h2 className="text-2xl md:text-3xl font-semibold text-white tracking-tight leading-tight">
                  Speak your tasks
                  <br />
                  into existence.
                </h2>

                <p className="text-sm md:text-base text-blue-300 mt-4 max-w-md leading-relaxed">
                  Click the mic, say what you need to do, and it&apos;s captured instantly. Works in task creation, project notes, and descriptions. No typing required.
                </p>

                <div className="mt-8 flex flex-col gap-3">
                  {[
                    'Add tasks hands-free while multitasking',
                    'Capture ideas the moment they hit',
                    'Works in any modern browser — no install',
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <div className="w-1 h-1 rounded-full bg-blue-700 flex-shrink-0" />
                      <span className="text-sm text-blue-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: waveform visualization */}
              <div className="flex flex-col items-center gap-6">
                {/* Waveform card */}
                <div className="w-full rounded-xl bg-blue-900/40 border border-blue-800/50 p-6">
                  {/* Listening indicator */}
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs text-blue-400 font-medium tracking-wide uppercase">Listening</span>
                  </div>

                  {/* Waveform bars */}
                  <div className="flex items-center justify-center gap-[3px] h-16">
                    {Array.from({ length: 40 }).map((_, i) => {
                      const height = getWaveHeight(i, 40)
                      return (
                        <div
                          key={i}
                          className="w-[3px] rounded-full bg-blue-400/40"
                          style={{
                            height: `${height}%`,
                            animationName: 'waveform-pulse',
                            animationDuration: `${0.8 + (i % 5) * 0.2}s`,
                            animationTimingFunction: 'ease-in-out',
                            animationIterationCount: 'infinite',
                            animationDirection: 'alternate',
                            animationDelay: `${(i * 0.05)}s`,
                          }}
                        />
                      )
                    })}
                  </div>

                  {/* Transcript preview */}
                  <div className="mt-5 pt-4 border-t border-blue-800/50">
                    <p className="text-sm text-blue-100">
                      &ldquo;Follow up with Sarah about the brand guidelines by Friday&rdquo;
                    </p>
                    <p className="text-xs text-blue-400 mt-2">
                      Transcribed to task title
                    </p>
                  </div>
                </div>

                {/* Controls hint */}
                <div className="flex items-center gap-4 text-blue-500 text-xs">
                  <span className="flex items-center gap-1.5">
                    <kbd className="px-1.5 py-0.5 rounded bg-blue-900 text-blue-400 font-mono text-[10px]">Click</kbd>
                    to start
                  </span>
                  <span className="flex items-center gap-1.5">
                    <kbd className="px-1.5 py-0.5 rounded bg-blue-900 text-blue-400 font-mono text-[10px]">Click</kbd>
                    to stop
                  </span>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* CSS animation for waveform */}
        <style jsx>{`
          @keyframes waveform-pulse {
            0% { transform: scaleY(1); }
            100% { transform: scaleY(0.4); }
          }
        `}</style>
      </div>
    </section>
  )
}

function getWaveHeight(index: number, total: number): number {
  const center = total / 2
  const distance = Math.abs(index - center) / center
  const base = 30 + (1 - distance) * 60
  const variation = Math.sin(index * 0.7) * 15 + Math.cos(index * 1.3) * 10
  return Math.max(15, Math.min(95, base + variation))
}
