import Image from 'next/image'
import { ScrollReveal } from '../ScrollReveal'

type Human = {
  name: string
  role: string
  avatar: string
  size: 'sm' | 'md' | 'lg'
  /** desktop vertical offset in %, relative to strip baseline */
  offset: string
  delay: number
}

const humans: Human[] = [
  { name: 'Sarah',   role: 'Designer',     avatar: 'https://randomuser.me/api/portraits/women/44.jpg', size: 'md', offset: '4%',   delay: 0 },
  { name: 'Marcus',  role: 'Consultant',   avatar: 'https://randomuser.me/api/portraits/men/32.jpg',   size: 'lg', offset: '18%',  delay: 120 },
  { name: 'Elena',   role: 'Strategist',   avatar: 'https://randomuser.me/api/portraits/women/68.jpg', size: 'sm', offset: '2%',   delay: 240 },
  { name: 'Theo',    role: 'Founder',      avatar: 'https://randomuser.me/api/portraits/men/76.jpg',   size: 'md', offset: '22%',  delay: 360 },
  { name: 'Priya',   role: 'Producer',     avatar: 'https://randomuser.me/api/portraits/women/55.jpg', size: 'lg', offset: '6%',   delay: 480 },
  { name: 'Jamal',   role: 'Engineer',     avatar: 'https://randomuser.me/api/portraits/men/85.jpg',   size: 'sm', offset: '20%',  delay: 600 },
  { name: 'Noa',     role: 'Art Director', avatar: 'https://randomuser.me/api/portraits/women/22.jpg', size: 'md', offset: '4%',   delay: 720 },
]

const snippets = [
  { body: '"Six clients. Zero spreadsheets. I feel human again."', name: 'Sarah', role: 'Freelance designer' },
  { body: '"Set up in five minutes. Ten more things shipped that afternoon."', name: 'Theo', role: 'Indie founder' },
  { body: '"I stopped waking up anxious. The reminders are gentle, not loud."', name: 'Elena', role: 'Marketing strategist' },
]

const sizeMap = {
  sm: { box: 'w-14 h-14 md:w-16 md:h-16', ring: 'ring-[3px]' },
  md: { box: 'w-20 h-20 md:w-24 md:h-24', ring: 'ring-[3px]' },
  lg: { box: 'w-24 h-24 md:w-32 md:h-32', ring: 'ring-4' },
}

export function HumansStrip() {
  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      {/* Warm ambient wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-full"
        style={{
          background:
            'radial-gradient(120% 60% at 50% 0%, rgba(229,77,46,0.08) 0%, transparent 60%)',
        }}
      />

      <div className="relative max-w-6xl mx-auto px-4 md:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 backdrop-blur-md px-3.5 py-1.5 text-[11px] font-medium tracking-[0.14em] uppercase text-foreground/70">
            <span className="size-1.5 rounded-full bg-[#E54D2E]" />
            Real people, real work
          </div>
          <h2 className="mt-6 text-4xl md:text-5xl font-semibold text-foreground tracking-[-0.03em] font-[family-name:var(--font-display)]">
            Made for builders <span className="italic font-light">who ship</span>.
          </h2>
          <p className="mt-4 text-base md:text-lg text-muted-foreground">
            Freelancers, solo founders, and small teams running their operation on Pulse Pro.
          </p>
        </div>

        {/* Constellation — desktop: varying sizes + offsets in a wide row; mobile: horizontal scroll */}
        <ScrollReveal delay={0}>
          <div className="relative mt-14 md:mt-20 h-[260px] md:h-[320px]">
            {/* Desktop constellation */}
            <div className="hidden md:flex relative h-full items-start justify-between gap-4 lg:gap-8">
              {humans.map((h, i) => {
                const sizes = sizeMap[h.size]
                return (
                  <div
                    key={h.name}
                    className="relative flex-1 flex flex-col items-center"
                    style={{ paddingTop: h.offset }}
                  >
                    <div
                      className="group relative"
                      style={{
                        animation: `humanDrift 6s ease-in-out ${i * 0.35}s infinite alternate`,
                      }}
                    >
                      <div
                        className={`absolute inset-0 rounded-full blur-xl opacity-40 -z-10`}
                        style={{
                          background:
                            i % 2 === 0
                              ? 'radial-gradient(closest-side, rgba(229,77,46,0.55), transparent 70%)'
                              : 'radial-gradient(closest-side, rgba(240,97,62,0.4), transparent 70%)',
                        }}
                      />
                      <div
                        className={`${sizes.box} ${sizes.ring} rounded-full overflow-hidden ring-white shadow-[0_18px_40px_-12px_rgba(0,0,0,0.25)]`}
                      >
                        <Image
                          src={h.avatar}
                          alt={`${h.name}, ${h.role}`}
                          width={128}
                          height={128}
                          sizes="128px"
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    </div>
                    <p className="mt-3 text-xs font-semibold text-foreground tracking-tight font-[family-name:var(--font-display)]">
                      {h.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground tracking-wide uppercase">
                      {h.role}
                    </p>
                  </div>
                )
              })}
            </div>

            {/* Mobile: horizontal scroll rail */}
            <div className="md:hidden flex gap-5 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {humans.map((h) => {
                const sizes = sizeMap[h.size]
                return (
                  <div key={h.name} className="shrink-0 flex flex-col items-center snap-start">
                    <div className="relative">
                      <div
                        className={`absolute inset-0 rounded-full blur-lg opacity-40 -z-10`}
                        style={{
                          background: 'radial-gradient(closest-side, rgba(229,77,46,0.45), transparent 70%)',
                        }}
                      />
                      <div className={`${sizes.box} ${sizes.ring} rounded-full overflow-hidden ring-white shadow-[0_14px_30px_-10px_rgba(0,0,0,0.25)]`}>
                        <Image
                          src={h.avatar}
                          alt={`${h.name}, ${h.role}`}
                          width={128}
                          height={128}
                          sizes="128px"
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    </div>
                    <p className="mt-2 text-[11px] font-semibold text-foreground tracking-tight font-[family-name:var(--font-display)]">
                      {h.name}
                    </p>
                    <p className="text-[9px] text-muted-foreground tracking-wide uppercase">
                      {h.role}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </ScrollReveal>

        {/* Featured snippets */}
        <ScrollReveal delay={150}>
          <div className="mt-4 md:mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
            {snippets.map((s) => (
              <div
                key={s.name}
                className="rounded-2xl bg-white ring-1 ring-black/5 p-5 hover:ring-[#E54D2E]/25 hover:-translate-y-0.5 transition-all duration-300"
              >
                <p className="text-[15px] text-foreground leading-relaxed tracking-tight">
                  {s.body}
                </p>
                <div className="mt-3 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{s.name}</span>
                  {' · '}
                  {s.role}
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
