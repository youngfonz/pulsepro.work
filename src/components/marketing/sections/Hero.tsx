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
    <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/[0.04] dark:border-white/10 dark:bg-white/[0.04] backdrop-blur-md px-4 py-1.5">
      <span className="relative flex h-2 w-2">
        <span className="absolute inset-0 animate-ping rounded-full bg-[#F0613E] opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-[#F0613E]" />
      </span>
      <span
        className="text-sm font-medium text-gray-800 dark:text-white/80 transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
      >
        {announcements[index]}
      </span>
    </div>
  );
}

// Phone mock — shows the actual Pulse Pro mobile app (dashboard view)
function HeroPhoneMock() {
  const tasks = [
    { task: 'Brand guidelines', meta: 'Acme · today', priority: 'high' },
    { task: 'Review wireframes', meta: 'CloudSync · 4pm', priority: 'medium' },
    { task: 'Send invoice #1042', meta: 'Bloom · today', priority: 'high' },
  ];
  return (
    <div className="relative w-[240px] h-[490px]">
      {/* Phone chassis */}
      <div className="absolute inset-0 rounded-[46px] bg-[#0d0d0d] p-2 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.55)] ring-1 ring-white/10">
        {/* Notch */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 w-24 h-6 rounded-full bg-black" />
        {/* Screen */}
        <div className="relative h-full w-full rounded-[38px] overflow-hidden bg-white">
          <div className="relative h-full flex flex-col px-4 pt-10 pb-4 text-gray-900">
            {/* Top bar */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[9px] font-medium tracking-[0.14em] uppercase text-gray-400">Wednesday</p>
                <p className="font-[family-name:var(--font-display)] text-[17px] font-extrabold tracking-tight">Good morning</p>
              </div>
              <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-[10px] font-bold text-[#E54D2E]">JD</div>
            </div>

            {/* Activity rings — compact */}
            <div className="bg-gradient-to-br from-[#fff8f5] to-[#ffeee6] rounded-2xl p-3 ring-1 ring-orange-100/60 mb-3">
              <div className="flex items-center gap-3">
                <svg viewBox="0 0 120 120" className="w-16 h-16 shrink-0">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(229,77,46,0.18)" strokeWidth="12" />
                  <circle cx="60" cy="60" r="52" fill="none" stroke="#E54D2E" strokeWidth="12" strokeDasharray="327" strokeDashoffset="98" strokeLinecap="round" transform="rotate(-90 60 60)" />
                  <circle cx="60" cy="60" r="36" fill="none" stroke="rgba(245,158,11,0.18)" strokeWidth="12" />
                  <circle cx="60" cy="60" r="36" fill="none" stroke="#f59e0b" strokeWidth="12" strokeDasharray="226" strokeDashoffset="50" strokeLinecap="round" transform="rotate(-90 60 60)" />
                  <circle cx="60" cy="60" r="20" fill="none" stroke="rgba(34,197,94,0.18)" strokeWidth="12" />
                  <circle cx="60" cy="60" r="20" fill="none" stroke="#22c55e" strokeWidth="12" strokeDasharray="126" strokeDashoffset="40" strokeLinecap="round" transform="rotate(-90 60 60)" />
                </svg>
                <div className="min-w-0">
                  <p className="font-[family-name:var(--font-display)] text-[22px] font-extrabold leading-none">3</p>
                  <p className="text-[9px] text-gray-500 uppercase tracking-wider mt-0.5">Due today</p>
                  <p className="text-[10px] text-gray-500 mt-1.5">
                    <span className="font-semibold text-gray-900">5</span> active
                    <span className="mx-1 text-gray-300">·</span>
                    <span className="font-semibold text-gray-900">12</span> done
                  </p>
                </div>
              </div>
            </div>

            {/* Due today list */}
            <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-gray-400 mb-1.5">Due today</p>
            <div className="space-y-1.5 flex-1">
              {tasks.map((t) => (
                <div key={t.task} className="flex items-center gap-2 bg-gray-50 rounded-lg px-2.5 py-2 ring-1 ring-black/[0.04]">
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${t.priority === 'high' ? 'bg-[#E54D2E]' : 'bg-amber-400'}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold text-gray-900 truncate">{t.task}</p>
                    <p className="text-[9px] text-gray-400 truncate">{t.meta}</p>
                  </div>
                  <div className="w-4 h-4 rounded-full border border-gray-200" />
                </div>
              ))}
            </div>

            {/* Add task pill at bottom */}
            <div className="mt-2 flex items-center gap-2 rounded-full bg-[#E54D2E] px-3 py-2 shadow-[0_10px_30px_-5px_rgba(229,77,46,0.5)]">
              <svg viewBox="0 0 24 24" className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-[10px] font-bold text-white tracking-tight">Add task</span>
              <div className="ml-auto flex items-center gap-0.5">
                <span className="w-1 h-1 rounded-full bg-white/70" />
                <span className="w-1 h-1 rounded-full bg-white/50" />
                <span className="w-1 h-1 rounded-full bg-white/30" />
              </div>
            </div>

            {/* Home indicator */}
            <div className="mt-3 mx-auto w-20 h-1 rounded-full bg-gray-900/80" />
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroDashboardMock() {
  return (
    <div className="relative bg-white rounded-2xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.35)] ring-1 ring-black/5 overflow-hidden text-left">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-[#E54D2E] flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <span className="font-[family-name:var(--font-display)] text-sm font-extrabold tracking-tight text-gray-900">Pulse Pro</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg text-xs text-gray-400">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            Search...
            <span className="ml-4 text-[10px] text-gray-300 border border-gray-200 rounded px-1">⌘K</span>
          </div>
          <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-[10px] font-bold text-[#E54D2E]">JD</div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="hidden md:flex flex-col w-44 border-r border-gray-100 py-3 px-3 gap-0.5 shrink-0">
          <div className="flex items-center gap-2 px-2 py-1.5 bg-orange-50 rounded-md text-xs font-semibold text-[#E54D2E]">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" /></svg>
            Dashboard
          </div>
          {[
            { label: 'Projects', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z' },
            { label: 'Tasks', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
            { label: 'Clients', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
            { label: 'Invoices', icon: 'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-gray-500">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d={item.icon} /></svg>
              {item.label}
            </div>
          ))}
        </div>

        {/* Main content */}
        <div className="flex-1 p-4 md:p-5 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-[family-name:var(--font-display)] text-sm font-extrabold tracking-tight text-gray-900">Good morning, Jordan</p>
              <p className="text-[11px] text-gray-400 mt-0.5">You have 3 tasks due today</p>
            </div>
            <div className="flex gap-2">
              <div className="px-2.5 py-1 bg-[#E54D2E] text-white rounded-md text-[10px] font-semibold shadow-sm shadow-[#E54D2E]/40">+ Add Task</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Activity rings — Fonz palette: coral / amber / green (no blue) */}
            <div className="lg:col-span-2 bg-gradient-to-br from-[#fff8f5] to-[#ffeee6] rounded-xl p-4 ring-1 ring-orange-100/60">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-3">Activity</p>
              <div className="flex items-center justify-center py-2">
                <svg viewBox="0 0 120 120" className="w-24 h-24">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(229,77,46,0.18)" strokeWidth="8" />
                  <circle cx="60" cy="60" r="52" fill="none" stroke="#E54D2E" strokeWidth="8" strokeDasharray="327" strokeDashoffset="98" strokeLinecap="round" transform="rotate(-90 60 60)" />
                  <circle cx="60" cy="60" r="40" fill="none" stroke="rgba(245,158,11,0.18)" strokeWidth="8" />
                  <circle cx="60" cy="60" r="40" fill="none" stroke="#f59e0b" strokeWidth="8" strokeDasharray="251" strokeDashoffset="50" strokeLinecap="round" transform="rotate(-90 60 60)" />
                  <circle cx="60" cy="60" r="28" fill="none" stroke="rgba(34,197,94,0.18)" strokeWidth="8" />
                  <circle cx="60" cy="60" r="28" fill="none" stroke="#22c55e" strokeWidth="8" strokeDasharray="176" strokeDashoffset="88" strokeLinecap="round" transform="rotate(-90 60 60)" />
                  <text x="60" y="58" textAnchor="middle" className="fill-gray-900" fontSize="20" fontWeight="800">3</text>
                  <text x="60" y="72" textAnchor="middle" className="fill-gray-400" fontSize="8">due this week</text>
                </svg>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {[
                  { n: '5', l: 'Active' },
                  { n: '12', l: 'Done' },
                  { n: '3', l: 'Due' },
                ].map((s) => (
                  <div key={s.l} className="text-center">
                    <p className="font-[family-name:var(--font-display)] text-base font-extrabold tracking-tight text-gray-900">{s.n}</p>
                    <p className="text-[9px] text-gray-400 uppercase tracking-wider">{s.l}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tasks + Health */}
            <div className="lg:col-span-3 bg-gray-50 rounded-xl p-4 ring-1 ring-black/[0.03]">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-3">Due Today</p>
              <div className="space-y-2">
                {[
                  { task: 'Finalize brand guidelines', project: 'Acme Rebrand', priority: 'high' },
                  { task: 'Review wireframes', project: 'CloudSync App', priority: 'medium' },
                  { task: 'Send invoice #1042', project: 'Bloom Studio', priority: 'high' },
                ].map((item) => (
                  <div key={item.task} className="flex items-center justify-between bg-white rounded-md px-3 py-2 ring-1 ring-black/[0.04]">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.priority === 'high' ? 'bg-[#E54D2E]' : 'bg-amber-400'}`} />
                      <span className="text-[11px] text-gray-800 font-medium truncate">{item.task}</span>
                    </div>
                    <span className="text-[9px] text-gray-400 ml-2 shrink-0">{item.project}</span>
                  </div>
                ))}
              </div>

              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mt-4 mb-2">Project Health</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: 'Acme Rebrand', status: 'green', tasks: '8/12' },
                  { name: 'CloudSync App', status: 'amber', tasks: '3/9' },
                  { name: 'Bloom Studio', status: 'green', tasks: '15/18' },
                  { name: 'Meridian Site', status: 'red', tasks: '1/7' },
                ].map((p) => (
                  <div key={p.name} className="flex items-center gap-2 bg-white rounded-md px-3 py-2 ring-1 ring-black/[0.04]">
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      p.status === 'green' ? 'bg-emerald-400' : p.status === 'amber' ? 'bg-amber-400' : 'bg-[#E54D2E]'
                    }`} />
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold text-gray-800 truncate">{p.name}</p>
                      <p className="text-[9px] text-gray-400">{p.tasks} tasks</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Base gradient — light in light mode, dark in dark mode */}
      <div className="relative bg-gradient-to-b from-white via-white via-[75%] to-[#f5f5f7] dark:from-[#1a1a1a] dark:via-[#1a1a1a] dark:to-background pt-28 pb-20 md:pb-28">
        {/* Ambient coral blobs — atmospheric mesh-gradient feel */}
        <div className="pointer-events-none absolute top-[15%] -left-20 w-[520px] h-[520px] rounded-full bg-[#E54D2E] opacity-[0.18] blur-[140px]" />
        <div className="pointer-events-none absolute top-[35%] -right-32 w-[620px] h-[620px] rounded-full bg-[#F0613E] opacity-[0.12] blur-[160px]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.35)_100%)] opacity-0 dark:opacity-100" />

        <div className="relative max-w-6xl mx-auto px-4 md:px-8 w-full">
          <div className="text-center max-w-3xl mx-auto">
            <ScrollReveal delay={0}>
              <RotatingBadge />
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <h1 className="mt-6 font-[family-name:var(--font-display)] text-[44px] md:text-6xl lg:text-7xl font-extrabold text-gray-900 dark:text-white leading-[1.02] tracking-[-0.04em]">
                Think less.{' '}
                <span className="italic text-[#F0613E]">Run smoother.</span>
              </h1>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <p className="text-base md:text-lg text-gray-600 dark:text-white/55 mt-6 max-w-xl mx-auto leading-relaxed">
                The calm command center for your projects, tasks, and clients.
                Add your first task in five seconds. No project boards, no learning curve.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <div className="mt-10 flex gap-3 flex-wrap justify-center">
                <Link
                  href="/sign-up"
                  className="group inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-[#E54D2E] text-white font-semibold shadow-[0_16px_40px_-8px_rgba(229,77,46,0.55)] hover:bg-[#D4431F] hover:shadow-[0_20px_50px_-8px_rgba(229,77,46,0.75)] transition-all duration-200"
                >
                  Start for free
                  <svg className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.25}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <a
                  href="#pricing"
                  className="inline-flex items-center justify-center px-8 py-3.5 rounded-full border border-black/15 bg-black/[0.03] dark:border-white/15 dark:bg-white/[0.03] backdrop-blur-sm text-gray-900 dark:text-white font-semibold hover:border-black/30 hover:bg-black/[0.06] dark:hover:border-white/30 dark:hover:bg-white/[0.06] transition-all duration-200"
                >
                  See pricing
                </a>
              </div>
            </ScrollReveal>
          </div>

          {/* Dual-mock showcase: desktop dashboard + floating phone */}
          <ScrollReveal delay={400}>
            <div className="relative mt-16 md:mt-20">
              {/* Desktop dashboard — primary centerpiece */}
              <div className="relative mx-auto max-w-5xl">
                <HeroDashboardMock />
                {/* Phone mock — floats over right edge on md+, hidden on mobile */}
                <div className="hidden md:block absolute -right-4 lg:-right-10 -bottom-14 lg:-bottom-16 z-10 origin-bottom-right rotate-[4deg]">
                  <HeroPhoneMock />
                </div>
              </div>
              {/* Reflection/grounding glow under mocks */}
              <div className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 w-[60%] h-12 bg-[#E54D2E] opacity-30 blur-[60px]" />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
