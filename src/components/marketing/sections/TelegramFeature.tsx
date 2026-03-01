'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ScrollReveal } from '../ScrollReveal';

import type { ReactNode } from 'react';

const chatMessages: { from: string; content: ReactNode }[] = [
  { from: 'user', content: 'tasks' },
  {
    from: 'bot',
    content: (
      <>
        <strong>Pending Tasks</strong><br /><br />
        1. Finalize homepage copy<br />
        <em className="opacity-50">Morris Design Co</em><br /><br />
        2. Send invoice to client<br />
        <em className="opacity-50">Acme Rebrand</em><br /><br />
        Reply <strong>done N</strong> to mark one complete.
      </>
    ),
  },
  { from: 'user', content: 'done 1' },
  {
    from: 'bot',
    content: (
      <>Done! &ldquo;<strong>Finalize homepage copy</strong>&rdquo; marked complete.</>
    ),
  },
];

const features = [
  {
    id: 'insights',
    badge: 'AI Insights',
    badgeColor: 'bg-violet-500/10 text-violet-500',
    title: 'Your projects, analyzed.',
    description:
      'AI scans your projects, deadlines, and task patterns to surface what needs attention \u2014 no digging through data.',
    bullets: [
      'Flags overdue tasks and at-risk projects',
      'Spots deadline clusters before they pile up',
      'Highlights progress so you know what\u2019s working',
    ],
  },
  {
    id: 'email',
    badge: 'Email to Task',
    badgeColor: 'bg-amber-500/10 text-amber-500',
    title: 'Forward an email. Get a task.',
    description:
      'Every account gets a unique task inbox. Forward any email and it becomes a task automatically \u2014 subject becomes the title, body becomes the description.',
    bullets: [
      'Unique inbox address per account',
      'Subject line becomes the task title',
      'Works with any email client or app',
    ],
  },
  {
    id: 'siri',
    badge: 'Siri & Voice',
    badgeColor: 'bg-primary/10 text-primary',
    title: 'Say it. It\u2019s captured.',
    description:
      'Use Siri or Apple Shortcuts to create tasks from your phone, watch, or Mac. Or click the mic in-app to speak tasks directly \u2014 no typing required.',
    bullets: [
      'Siri and Apple Shortcuts on any Apple device',
      'In-browser mic for hands-free task capture',
      'Natural language parsing for priority and dates',
    ],
  },
  {
    id: 'shortcuts',
    badge: 'Keyboard',
    badgeColor: 'bg-foreground/10 text-foreground',
    title: 'Two keys. Zero friction.',
    description:
      'Press N to capture a task instantly from anywhere in the app. Hit \u2318K to search, navigate, or create \u2014 all without touching the mouse.',
    bullets: [
      'N key opens quick-add from any screen',
      '\u2318K searches everything and creates inline',
      'Natural language parsing for dates and priority',
    ],
  },
  {
    id: 'telegram',
    badge: 'Telegram',
    badgeColor: 'bg-[#2AABEE]/10 text-[#2AABEE]',
    title: 'Manage tasks from Telegram.',
    description:
      'Check your task list, mark things done, and create new tasks \u2014 all without leaving Telegram. Perfect for when you\u2019re on the go.',
    bullets: [
      'View pending tasks and deadlines',
      'Mark tasks complete with a message',
      'Create new tasks from any chat',
    ],
  },
];

export function TelegramFeature() {
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(null);

  const cycle = useCallback(() => {
    setVisible(false);
    timeoutRef.current = setTimeout(() => {
      setActive((prev) => (prev + 1) % features.length);
      setVisible(true);
    }, 350);
  }, []);

  const startInterval = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(cycle, 6000);
  }, [cycle]);

  useEffect(() => {
    startInterval();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [startInterval]);

  const handleTab = (i: number) => {
    if (i === active) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setVisible(false);
    timeoutRef.current = setTimeout(() => {
      setActive(i);
      setVisible(true);
    }, 350);
    startInterval();
  };

  const feature = features[active];

  return (
    <section className="py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Section heading */}
        <ScrollReveal delay={0}>
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              Work smarter from anywhere
            </h2>
            <p className="text-base md:text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
              AI-powered insights, email, Siri, keyboard shortcuts, and Telegram — five ways to stay on top without breaking your flow.
            </p>
          </div>
        </ScrollReveal>

        {/* Tabs */}
        <ScrollReveal delay={100}>
          <div className="flex justify-center mb-14">
            <div className="inline-flex flex-wrap justify-center gap-1 bg-muted/50 rounded-2xl sm:rounded-full p-1">
              {features.map((f, i) => (
                <button
                  key={f.id}
                  onClick={() => handleTab(i)}
                  className={`text-sm font-medium px-3.5 py-1.5 rounded-full transition-all duration-200 whitespace-nowrap ${
                    i === active
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {f.badge}
                </button>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <div
          className="transition-opacity duration-300"
          style={{ opacity: visible ? 1 : 0 }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: description */}
            <div>
              <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6 ${feature.badgeColor}`}
              >
                {feature.id === 'shortcuts' && (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                )}
                {feature.id === 'email' && (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                )}
                {feature.id === 'siri' && (
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 3a2 2 0 110 4 2 2 0 010-4zm3.5 5.5c0 .828-.56 1.5-1.25 1.5h-4.5c-.69 0-1.25-.672-1.25-1.5S9.06 9 9.75 9h4.5c.69 0 1.25.672 1.25 1.5zM9 14h6v1.5c0 1.657-1.343 3-3 3s-3-1.343-3-3V14z" />
                  </svg>
                )}
                {feature.id === 'telegram' && <TelegramIcon className="w-4 h-4" />}
                {feature.id === 'insights' && (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                )}
                {feature.badge}
              </div>

              <h3 className="text-3xl font-semibold text-foreground tracking-tight">
                {feature.title}
              </h3>
              <p className="text-base text-muted-foreground mt-3 max-w-lg">
                {feature.description}
              </p>

              <div className="mt-8 flex flex-col gap-3">
                {feature.bullets.map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: visual */}
            <div>
              {feature.id === 'shortcuts' && <ShortcutsMock />}
              {feature.id === 'email' && <EmailMock />}
              {feature.id === 'siri' && <SiriMock />}
              {feature.id === 'telegram' && <TelegramMock />}
              {feature.id === 'insights' && <InsightsMock />}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ShortcutsMock() {
  return (
    <div className="space-y-4">
      {/* Quick-add mock */}
      <div className="bg-card rounded-xl overflow-hidden shadow-2xl border border-border">
        <div className="flex items-center gap-3 px-4 border-b border-border">
          <svg className="w-4 h-4 text-muted-foreground flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <div className="flex-1 py-3">
            <span className="text-sm text-card-foreground">Buy groceries due tomorrow</span>
            <span className="animate-pulse text-primary ml-0.5">|</span>
          </div>
          <kbd className="px-2 py-1 bg-muted border border-border rounded text-[10px] font-medium text-muted-foreground">N</kbd>
        </div>
        <div className="flex items-center justify-between px-4 py-2.5">
          <span className="text-[11px] text-muted-foreground">No project (quick task)</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-emerald-500 font-medium">due: tomorrow</span>
            <div className="px-3 py-1 bg-primary text-primary-foreground rounded text-[11px] font-medium">Add</div>
          </div>
        </div>
      </div>

      {/* Command bar mock */}
      <div className="bg-card rounded-xl overflow-hidden shadow-2xl border border-border">
        <div className="flex items-center gap-3 px-4 border-b border-border">
          <svg className="w-4 h-4 text-muted-foreground flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <div className="flex-1 py-3">
            <span className="text-sm text-card-foreground">add task Review wireframes high priority</span>
          </div>
          <kbd className="px-2 py-1 bg-muted border border-border rounded text-[10px] font-medium text-muted-foreground">&crarr;</kbd>
        </div>
        <div className="px-4 py-3">
          <div className="flex items-center gap-3 px-3 py-2.5 bg-muted rounded-lg">
            <div className="w-7 h-7 rounded-md flex items-center justify-center bg-primary/10 text-primary flex-shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-card-foreground">Review wireframes</p>
              <p className="text-[10px] text-muted-foreground">high priority</p>
            </div>
            <kbd className="px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground bg-background border border-border rounded">Enter</kbd>
          </div>
        </div>
        <div className="px-4 py-2 border-t border-border flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 bg-muted border border-border rounded text-[10px]">&crarr;</kbd>
            create
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded text-[10px]">esc</kbd>
            close
          </span>
        </div>
      </div>
    </div>
  );
}

function EmailMock() {
  return (
    <div className="bg-card rounded-xl overflow-hidden shadow-2xl border border-border">
      {/* Email header */}
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 text-xs font-semibold flex-shrink-0">
            FW
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-card-foreground">Forwarded message</p>
            <p className="text-xs text-muted-foreground truncate">From: sarah@acme.co</p>
          </div>
        </div>
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1">To:</p>
          <p className="text-sm text-card-foreground font-mono">tasks@in.pulsepro.co</p>
        </div>
      </div>

      {/* Email body */}
      <div className="px-5 py-4">
        <p className="text-sm font-medium text-card-foreground">Re: Brand guidelines feedback</p>
        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
          Hey, can you revise the color palette? The client wants warmer tones. Updated brief attached.
        </p>
      </div>

      {/* Arrow divider */}
      <div className="flex items-center justify-center py-2">
        <div className="flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full">
          <svg className="w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
          <span className="text-xs font-medium text-primary">Becomes a task</span>
        </div>
      </div>

      {/* Task result */}
      <div className="px-5 py-4 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded border-2 border-primary flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-card-foreground">Re: Brand guidelines feedback</p>
            <p className="text-xs text-muted-foreground mt-0.5">Quick task</p>
          </div>
          <span className="text-[10px] text-emerald-500 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full">New</span>
        </div>
      </div>
    </div>
  );
}

function SiriMock() {
  return (
    <div className="bg-card rounded-xl overflow-hidden shadow-2xl border border-border p-6">
      {/* Siri waveform */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full bg-gradient-to-b from-[#6366f1] to-[#ec4899] opacity-20 animate-pulse" />
          <div className="absolute inset-2 rounded-full bg-gradient-to-b from-[#6366f1] to-[#ec4899] opacity-30" />
          <div className="absolute inset-4 rounded-full bg-gradient-to-b from-[#818cf8] to-[#f472b6] opacity-50" />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-8 h-8 text-white drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Conversation */}
      <div className="space-y-4">
        <div className="text-center">
          <p className="text-lg font-medium text-card-foreground">
            &ldquo;Add a task to Pulse Pro: review brand guidelines by Friday&rdquo;
          </p>
        </div>

        <div className="border-t border-border pt-4">
          <div className="flex items-center gap-3 bg-muted/50 rounded-lg p-3">
            <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-card-foreground">Task created</p>
              <p className="text-xs text-muted-foreground mt-0.5">&ldquo;Review brand guidelines&rdquo; &mdash; due Friday</p>
            </div>
          </div>
        </div>
      </div>

      {/* Two options */}
      <div className="mt-5 pt-4 border-t border-border space-y-2.5">
        <div className="flex items-center gap-3 bg-muted/50 rounded-lg p-3">
          <div className="w-10 h-10 rounded-xl bg-foreground flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-background" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-card-foreground">Add to Pulse Pro</p>
            <p className="text-[10px] text-muted-foreground">Apple Shortcuts &middot; iPhone, Mac, Watch</p>
          </div>
          <svg className="w-4 h-4 text-muted-foreground flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
        <div className="flex items-center gap-3 bg-muted/50 rounded-lg p-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-card-foreground">Click mic to speak</p>
            <p className="text-[10px] text-muted-foreground">In-browser &middot; Any modern browser</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
        </div>
      </div>
    </div>
  );
}

function TelegramMock() {
  return (
    <div className="bg-card rounded-xl overflow-hidden shadow-2xl border border-border">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <div className="w-9 h-9 rounded-full bg-[#2AABEE] flex items-center justify-center flex-shrink-0">
          <TelegramIcon className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="text-sm font-medium text-card-foreground">Pulse Pro Bot</div>
          <div className="text-xs text-muted-foreground">bot</div>
        </div>
      </div>

      <div className="p-4 space-y-3 min-h-[300px]">
        {chatMessages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
                msg.from === 'user'
                  ? 'bg-[#2AABEE] text-white rounded-br-sm'
                  : 'bg-muted text-card-foreground rounded-bl-sm'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 px-4 py-3 border-t border-border">
        <div className="flex-1 bg-muted rounded-full px-4 py-2 text-sm text-muted-foreground">
          Message...
        </div>
        <div className="w-8 h-8 rounded-full bg-[#2AABEE] flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function InsightsMock() {
  return (
    <div className="bg-card rounded-xl overflow-hidden shadow-2xl border border-border">
      <div className="flex items-center gap-2 px-5 py-3 border-b border-border">
        <svg className="w-4 h-4 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
        </svg>
        <span className="text-sm font-medium text-card-foreground">Insights</span>
        <span className="text-[10px] text-muted-foreground ml-auto">Updated 2 min ago</span>
      </div>

      <div className="divide-y divide-border">
        {[
          { dot: 'bg-rose-500', text: 'Acme Rebrand has 3 overdue tasks \u2014 prioritize before Friday' },
          { dot: 'bg-amber-500', text: "Morris Design Co hasn\u2019t been updated in 12 days" },
          { dot: 'bg-blue-500', text: '2 high-priority tasks due tomorrow \u2014 start with wireframes' },
        ].map((insight) => (
          <div
            key={insight.text}
            className="flex items-center gap-3 px-5 py-4 hover:bg-muted/50 transition-colors"
          >
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${insight.dot}`} />
            <p className="text-sm text-card-foreground flex-1">{insight.text}</p>
            <svg className="w-4 h-4 text-muted-foreground flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        ))}
      </div>

      <div className="px-5 py-3 border-t border-border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
          </svg>
          3 projects analyzed
        </div>
      </div>
    </div>
  );
}

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}
