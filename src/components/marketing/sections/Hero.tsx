'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { ScrollReveal } from '../ScrollReveal';

const announcements = [
  'Now with AI-powered insights',
  'Now with team workspaces',
  'Telegram bot is live',
  'Voice input — speak your tasks',
  'Press N to add a task instantly',
  'Daily email reminders',
];

function RotatingBadge() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const cycle = useCallback(() => {
    setVisible(false);
    timeoutRef.current = setTimeout(() => {
      setIndex((prev) => (prev + 1) % announcements.length);
      setVisible(true);
    }, 300);
  }, []);

  useEffect(() => {
    const timer = setInterval(cycle, 3500);
    return () => {
      clearInterval(timer);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [cycle]);

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5">
      <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
      <span
        className="text-sm font-medium text-foreground transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
      >
        {announcements[index]}
      </span>
    </div>
  );
}

export function Hero() {
  return (
    <section className="pt-28 pb-20 relative overflow-hidden">
      {/* Dot grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, var(--foreground) 0.75px, transparent 0.75px)',
          backgroundSize: '24px 24px',
          opacity: 0.08,
        }}
      />
      {/* Radial glow behind headline */}
      <div
        className="absolute top-32 left-1/2 -translate-x-1/2 w-[800px] h-[500px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, var(--primary) 0%, transparent 70%)',
          opacity: 0.1,
        }}
      />
      <div className="max-w-5xl mx-auto px-4 md:px-8 w-full relative">
        <div className="text-center max-w-3xl mx-auto">
          <ScrollReveal delay={0}>
            <RotatingBadge />
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-[1.1] tracking-tight mt-6">
              Think less.{' '}
              <span className="text-primary">Run smoother</span>.
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <p className="text-lg md:text-xl text-muted-foreground mt-6 max-w-2xl mx-auto leading-relaxed">
              Add your first task in 5 seconds. No setup, no project boards, no learning curve. Just your work, organized.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={300}>
            <div className="mt-10 flex gap-4 flex-wrap justify-center">
              <a
                href="#pricing"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all duration-200 hover:shadow-lg hover:shadow-primary/25"
              >
                Get Started
                <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-border text-foreground font-medium hover:bg-muted transition-colors"
              >
                Get started — it&apos;s free
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-border text-foreground font-medium hover:bg-muted transition-colors"
              >
                See how it works
              </a>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={400}>
            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Free forever
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Setup in 5 minutes
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                No credit card
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
