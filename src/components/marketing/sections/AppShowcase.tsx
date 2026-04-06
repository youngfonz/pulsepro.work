'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ScrollReveal } from '../ScrollReveal';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { cn } from '@/lib/utils';

const screens = [
  { src: '/screenshots/dashboard.png', label: 'Dashboard', alt: 'Pulse Pro dashboard with project overview and stats', description: 'Activity rings, overdue alerts, and your calendar — everything you need in one glance.' },
  { src: '/screenshots/projects.png', label: 'Projects', alt: 'Pulse Pro projects view with task management', description: 'Every client project with status, priority, and deadlines — no more digging through emails.' },
  { src: '/screenshots/tasks.png', label: 'Tasks', alt: 'Pulse Pro task list with status tracking', description: 'Filter by project, status, or priority. See what\'s overdue and what\'s next.' },
  { src: '/screenshots/bookmarks.jpg', label: 'Bookmarks', alt: 'Pulse Pro bookmarks for saving important items', description: 'Save articles, videos, and links to any project. Your research, organized.' },
];

export function AppShowcase() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const { ref, isVisible } = useScrollReveal(0.2);

  const next = useCallback(() => {
    setActive((prev) => (prev + 1) % screens.length);
  }, []);

  // Auto-rotate every 4 seconds when visible and not paused
  useEffect(() => {
    if (!isVisible || paused) return;
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [isVisible, paused, next]);

  return (
    <section className="py-20 md:py-28" ref={ref}>
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        <ScrollReveal delay={0}>
          <h2 className="text-3xl font-semibold text-foreground tracking-tight text-center font-[family-name:var(--font-display)]">
            See it in action
          </h2>
          <p className="text-base text-muted-foreground mt-3 text-center max-w-xl mx-auto">
            From project dashboards to task lists and bookmarks — explore the workspace that keeps freelancers organized.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={200} direction="none">
          <div className="flex flex-col items-center mt-10">
            {/* Tab buttons */}
            <div className="inline-flex justify-center gap-1 bg-muted/50 rounded-full p-1 overflow-x-auto max-w-full">
              {screens.map((screen, i) => (
                <button
                  key={screen.label}
                  onClick={() => {
                    setActive(i);
                    setPaused(true);
                  }}
                  className={cn(
                    'px-3 py-1.5 text-xs sm:text-sm sm:px-4 font-medium rounded-full transition-all duration-200 whitespace-nowrap',
                    i === active
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {screen.label}
                </button>
              ))}
            </div>

            {/* Tab description */}
            <p className="mt-4 text-sm text-muted-foreground text-center max-w-lg mx-auto transition-opacity duration-300">
              {screens[active].description}
            </p>

            {/* Screenshot container */}
            <div
              className="mt-6 rounded-2xl overflow-hidden w-full bg-primary/5"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            >
              {/* Floating browser card */}
              <div className="p-4 md:p-8">
                <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-black/5">
                  {/* Browser chrome */}
                  <div className="h-9 bg-gray-100 border-b border-gray-200 flex items-center px-4 gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
                    <div className="ml-3 flex-1 h-4 bg-gray-200/60 rounded max-w-[180px]" />
                  </div>

                  <div className="relative aspect-[16/10.5]">
                    {screens.map((screen, i) => (
                      <Image
                        key={screen.src}
                        src={screen.src}
                        alt={screen.alt}
                        width={1920}
                        height={1200}
                        className={cn(
                          'absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-500',
                          i === active ? 'opacity-100' : 'opacity-0'
                        )}
                        priority={i <= 1}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
