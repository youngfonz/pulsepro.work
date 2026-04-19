'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { ScrollReveal } from '@/components/marketing/ScrollReveal'

const audiences = ['freelancers', 'designers', 'creatives', 'entrepreneurs', 'small teams']

const testimonials = [
  {
    quote: "I manage 6 clients at once. Before Pulse Pro, I was tracking everything in sticky notes and spreadsheets. Now I actually feel in control.",
    name: "Sarah Kim",
    role: "Freelance Designer",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    quote: "I tried Trello, Asana, Notion — they all felt like overkill for a solo consultant. Pulse Pro was set up in 5 minutes. That's it. Done.",
    name: "Marcus Chen",
    role: "IT Consultant",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    quote: "The daily email telling me what's due today? Game changer. I used to wake up anxious about what I was forgetting. Not anymore.",
    name: "Ava Rodriguez",
    role: "Marketing Strategist",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
  }
]

function RotatingText() {
  const [index, setIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false)
      timeoutRef.current = setTimeout(() => {
        setIndex((prev) => (prev + 1) % audiences.length)
        setIsVisible(true)
      }, 300)
    }, 3000)
    return () => {
      clearInterval(interval)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return (
    <span
      className={`inline-block italic font-light text-[#E54D2E] transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
      }`}
    >
      {audiences[index]}
    </span>
  )
}

export function Testimonials() {
  return (
    <section className="relative overflow-hidden py-24 md:py-32 bg-[#f5f5f7] dark:bg-[#1d1d1f]">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-1/2 -translate-y-1/2 h-[420px] w-[420px] rounded-full blur-[130px] opacity-30 dark:opacity-20"
        style={{ background: 'radial-gradient(closest-side, rgba(229,77,46,0.4), transparent 70%)' }}
      />

      <div className="relative max-w-6xl mx-auto px-4 md:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-md px-3.5 py-1.5 text-[11px] font-medium tracking-[0.14em] uppercase text-foreground/70">
            <span className="size-1.5 rounded-full bg-[#E54D2E]" />
            What our users say
          </div>
          <h2 className="mt-6 text-4xl md:text-5xl font-semibold text-foreground tracking-[-0.03em] font-[family-name:var(--font-display)]">
            Trusted by <RotatingText /> who ship.
          </h2>
        </div>

        <ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-14 md:mt-16">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="group relative rounded-2xl p-7 bg-white dark:bg-[#2d2d2f] ring-1 ring-black/5 dark:ring-white/5 hover:ring-[#E54D2E]/30 hover:-translate-y-1 transition-all duration-300"
              >
                <span
                  aria-hidden
                  className="absolute -top-4 left-6 text-7xl leading-none text-[#E54D2E]/20 font-[family-name:var(--font-display)] select-none"
                >
                  &ldquo;
                </span>
                <p className="relative text-[15px] text-foreground leading-relaxed tracking-tight">
                  {testimonial.quote}
                </p>

                <div className="mt-6 pt-5 border-t border-black/5 dark:border-white/10 flex items-center gap-3">
                  <Image
                    src={testimonial.avatar}
                    alt="Testimonial author"
                    width={40}
                    height={40}
                    sizes="40px"
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-[#E54D2E]/20"
                    loading="lazy"
                  />
                  <div>
                    <div className="text-sm font-semibold text-foreground tracking-tight">
                      {testimonial.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
