'use client';

import { ScrollReveal } from '../ScrollReveal';

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: '6 ways to capture tasks',
    description: 'Press N, Cmd+K, voice, Siri, Telegram, or email. However you work, tasks get captured.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
        <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    ),
    title: 'Projects, tasks & clients',
    description: 'List view, Kanban board, calendar. Health scores and time tracking built in.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
        <path d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
      </svg>
    ),
    title: 'Professional invoicing',
    description: 'Create invoices, import time entries, email clients, and share a print-ready link.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
        <path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    ),
    title: 'Voice input & AI insights',
    description: 'Speak to create tasks, projects, and clients. AI surfaces what needs your attention.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: 'Team collaboration',
    description: 'Share projects with your team. Four roles from Viewer to Owner. No per-seat fees.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Never miss a deadline',
    description: 'Daily email and Telegram reminders. Calendar view. Priority sorting across everything.',
  },
];

function StaticPhoneMock() {
  return (
    <div className="w-[200px] shrink-0">
      <div className="rounded-[2rem] border-[3px] border-foreground/15 bg-white overflow-hidden shadow-2xl">
        {/* Status bar */}
        <div className="flex items-center justify-between px-5 pt-2.5 pb-0.5">
          <span className="text-[9px] font-semibold text-gray-900">9:41</span>
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3 text-gray-900" fill="currentColor" viewBox="0 0 24 24"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3a4.237 4.237 0 00-6 0zm-4-4l2 2a7.074 7.074 0 0110 0l2-2C15.14 9.14 8.87 9.14 5 13z" /></svg>
            <svg className="w-3 h-3 text-gray-900" fill="currentColor" viewBox="0 0 24 24"><path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z" /></svg>
          </div>
        </div>

        {/* Dashboard content */}
        <div className="px-4 pt-1.5 pb-2">
          <p className="text-[11px] font-semibold text-gray-900">Good morning</p>
          <p className="text-[8px] text-gray-400 mt-0.5">3 tasks due today</p>
        </div>
        <div className="mx-4 bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-16 h-16">
              <circle cx="50" cy="50" r="44" fill="none" stroke="#fecdd3" strokeWidth="7" />
              <circle cx="50" cy="50" r="44" fill="none" stroke="#f43f5e" strokeWidth="7" strokeDasharray="276" strokeDashoffset="83" strokeLinecap="round" transform="rotate(-90 50 50)" />
              <circle cx="50" cy="50" r="34" fill="none" stroke="#bfdbfe" strokeWidth="7" />
              <circle cx="50" cy="50" r="34" fill="none" stroke="#3b82f6" strokeWidth="7" strokeDasharray="214" strokeDashoffset="43" strokeLinecap="round" transform="rotate(-90 50 50)" />
              <circle cx="50" cy="50" r="24" fill="none" stroke="#bbf7d0" strokeWidth="7" />
              <circle cx="50" cy="50" r="24" fill="none" stroke="#22c55e" strokeWidth="7" strokeDasharray="151" strokeDashoffset="75" strokeLinecap="round" transform="rotate(-90 50 50)" />
            </svg>
          </div>
          <div className="grid grid-cols-3 gap-1 mt-2">
            <div className="text-center">
              <p className="text-[10px] font-semibold text-gray-900">5</p>
              <p className="text-[7px] text-gray-400">Active</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-semibold text-gray-900">12</p>
              <p className="text-[7px] text-gray-400">Done</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-semibold text-gray-900">3</p>
              <p className="text-[7px] text-gray-400">Due</p>
            </div>
          </div>
        </div>

        {/* Task list */}
        <div className="px-4 pt-3 pb-2">
          <p className="text-[8px] font-medium text-gray-400 mb-1.5">Due Today</p>
          <div className="space-y-1.5">
            {[
              { task: 'Finalize brand guidelines', dot: 'bg-red-400' },
              { task: 'Review wireframes', dot: 'bg-amber-400' },
              { task: 'Send invoice #1042', dot: 'bg-red-400' },
            ].map((item) => (
              <div key={item.task} className="bg-white rounded-md border border-gray-100 px-2.5 py-1.5">
                <div className="flex items-center gap-1.5">
                  <div className={`w-1 h-1 rounded-full ${item.dot}`} />
                  <span className="text-[9px] text-gray-800 font-medium">{item.task}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom nav */}
        <div className="flex items-center justify-around px-3 py-2 mt-1 border-t border-gray-100">
          {[
            { label: 'Home', active: true },
            { label: 'Projects', active: false },
            { label: 'Tasks', active: false },
            { label: 'More', active: false },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-0.5">
              <div className={`w-3 h-3 rounded-full ${item.active ? 'bg-blue-600' : 'bg-gray-200'}`} />
              <span className={`text-[7px] ${item.active ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>{item.label}</span>
            </div>
          ))}
        </div>

        {/* Home indicator */}
        <div className="flex justify-center pb-1.5">
          <div className="w-16 h-0.5 rounded-full bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

function DashboardMock() {
  return (
    <div className="bg-white rounded-xl border border-black/10 shadow-lg overflow-hidden text-left">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <span className="text-sm font-semibold text-gray-900">Pulse Pro</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg text-xs text-gray-400">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            Search...
            <span className="ml-4 text-[10px] text-gray-300 border border-gray-200 rounded px-1">⌘K</span>
          </div>
          <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-semibold text-blue-600">JD</div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="hidden md:flex flex-col w-44 border-r border-gray-100 py-3 px-3 gap-0.5 shrink-0">
          <div className="flex items-center gap-2 px-2 py-1.5 bg-blue-50 rounded-md text-xs font-medium text-blue-700">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" /></svg>
            Dashboard
          </div>
          {[
            { label: 'Projects', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z' },
            { label: 'Tasks', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
            { label: 'Clients', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
            { label: 'Calendar', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
            { label: 'Bookmarks', icon: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-gray-500">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d={item.icon} /></svg>
              {item.label}
            </div>
          ))}
        </div>

        {/* Main content */}
        <div className="flex-1 p-4 md:p-5 min-w-0">
          {/* Greeting */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-gray-900">Good morning, Jordan</p>
              <p className="text-[11px] text-gray-400 mt-0.5">You have 3 tasks due today</p>
            </div>
            <div className="flex gap-2">
              <div className="px-2.5 py-1 bg-blue-600 text-white rounded-md text-[10px] font-medium">+ Add Task</div>
              <div className="hidden sm:block px-2.5 py-1 border border-gray-200 text-gray-600 rounded-md text-[10px] font-medium">+ Add Project</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Activity rings */}
            <div className="lg:col-span-2 bg-gray-50 rounded-lg p-4">
              <p className="text-[11px] font-medium text-gray-500 mb-3">Activity</p>
              <div className="flex items-center justify-center py-2">
                <svg viewBox="0 0 120 120" className="w-24 h-24">
                  {/* Outer ring - Projects */}
                  <circle cx="60" cy="60" r="52" fill="none" stroke="#fecdd3" strokeWidth="8" />
                  <circle cx="60" cy="60" r="52" fill="none" stroke="#f43f5e" strokeWidth="8" strokeDasharray="327" strokeDashoffset="98" strokeLinecap="round" transform="rotate(-90 60 60)" />
                  {/* Middle ring - Done */}
                  <circle cx="60" cy="60" r="40" fill="none" stroke="#bfdbfe" strokeWidth="8" />
                  <circle cx="60" cy="60" r="40" fill="none" stroke="#3b82f6" strokeWidth="8" strokeDasharray="251" strokeDashoffset="50" strokeLinecap="round" transform="rotate(-90 60 60)" />
                  {/* Inner ring - Due */}
                  <circle cx="60" cy="60" r="28" fill="none" stroke="#bbf7d0" strokeWidth="8" />
                  <circle cx="60" cy="60" r="28" fill="none" stroke="#22c55e" strokeWidth="8" strokeDasharray="176" strokeDashoffset="88" strokeLinecap="round" transform="rotate(-90 60 60)" />
                  <text x="60" y="57" textAnchor="middle" className="text-lg font-bold fill-gray-900" fontSize="18">3</text>
                  <text x="60" y="70" textAnchor="middle" className="fill-gray-400" fontSize="8">due this week</text>
                </svg>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2">
                <div className="text-center">
                  <p className="text-xs font-semibold text-gray-900">5</p>
                  <p className="text-[9px] text-gray-400">Active</p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold text-gray-900">12</p>
                  <p className="text-[9px] text-gray-400">Done</p>
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold text-gray-900">3</p>
                  <p className="text-[9px] text-gray-400">Due</p>
                </div>
              </div>
            </div>

            {/* Upcoming */}
            <div className="lg:col-span-3 bg-gray-50 rounded-lg p-4">
              <p className="text-[11px] font-medium text-gray-500 mb-3">Due Today</p>
              <div className="space-y-2">
                {[
                  { task: 'Finalize brand guidelines', project: 'Acme Rebrand', priority: 'high' },
                  { task: 'Review wireframes', project: 'CloudSync App', priority: 'medium' },
                  { task: 'Send invoice #1042', project: 'Bloom Studio', priority: 'high' },
                ].map((item) => (
                  <div key={item.task} className="flex items-center justify-between bg-white rounded-md px-3 py-2 border border-gray-100">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.priority === 'high' ? 'bg-red-400' : 'bg-amber-400'}`} />
                      <span className="text-[11px] text-gray-800 font-medium truncate">{item.task}</span>
                    </div>
                    <span className="text-[9px] text-gray-400 ml-2 shrink-0">{item.project}</span>
                  </div>
                ))}
              </div>

              <p className="text-[11px] font-medium text-gray-500 mt-4 mb-2">Project Health</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: 'Acme Rebrand', status: 'green', tasks: '8/12' },
                  { name: 'CloudSync App', status: 'amber', tasks: '3/9' },
                  { name: 'Bloom Studio', status: 'green', tasks: '15/18' },
                  { name: 'Meridian Site', status: 'red', tasks: '1/7' },
                ].map((p) => (
                  <div key={p.name} className="flex items-center gap-2 bg-white rounded-md px-3 py-2 border border-gray-100">
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      p.status === 'green' ? 'bg-emerald-400' : p.status === 'amber' ? 'bg-amber-400' : 'bg-red-400'
                    }`} />
                    <div className="min-w-0">
                      <p className="text-[10px] font-medium text-gray-800 truncate">{p.name}</p>
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

export function Features() {
  return (
    <section id="features" className="py-20 md:py-28 bg-muted/30">
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-semibold text-foreground tracking-tight">
            Built for how you actually work.
          </h2>
          <p className="text-base text-muted-foreground mt-3 max-w-xl mx-auto">
            No Gantt charts. No sprint planning. No learning curve. Just the tools you need.
          </p>
        </div>

        <ScrollReveal delay={0}>
          <div className="mt-12 flex flex-col lg:flex-row items-center lg:items-end justify-center gap-6 lg:gap-8">
            <div className="w-full lg:flex-1 min-w-0">
              <DashboardMock />
            </div>
            <div className="hidden lg:block">
              <StaticPhoneMock />
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="border border-border border-t-2 border-t-primary rounded-xl p-6 bg-card hover:shadow-lg transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-base font-semibold mt-4">{feature.title}</h3>
                <p className="text-sm text-muted-foreground mt-1.5">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
