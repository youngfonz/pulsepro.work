import { ScrollReveal } from '../ScrollReveal';

const features = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: '6 ways to capture tasks',
    description: 'Press N, Cmd+K, voice, Siri, Telegram, or email. However you work, tasks get captured.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
        <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    ),
    title: 'Projects, tasks & clients',
    description: 'List view, Kanban board, calendar. Health scores and time tracking built in.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
        <path d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
      </svg>
    ),
    title: 'Professional invoicing',
    description: 'Create invoices, import time entries, email clients, and share a print-ready link.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
        <path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    ),
    title: 'Voice input & AI insights',
    description: 'Speak to create tasks, projects, and clients. AI surfaces what needs your attention.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: 'Team collaboration',
    description: 'Share projects with your team. Four roles from Viewer to Owner. No per-seat fees.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Never miss a deadline',
    description: 'Daily email and Telegram reminders. Calendar view. Priority sorting across everything.',
  },
];

function StaticPhoneMock() {
  const invoices = [
    { num: '#1042', client: 'Bloom Studio', amount: '$2,640', status: 'paid', color: 'bg-emerald-500' },
    { num: '#1041', client: 'Acme Rebrand', amount: '$4,200', status: 'sent', color: 'bg-amber-400' },
    { num: '#1040', client: 'CloudSync App', amount: '$1,800', status: 'draft', color: 'bg-gray-300' },
  ];
  return (
    <div className="w-[210px] shrink-0">
      <div className="relative rounded-[2.25rem] bg-[#0d0d0d] p-2 shadow-[0_30px_60px_-20px_rgba(229,77,46,0.35),0_18px_40px_-12px_rgba(0,0,0,0.4)]">
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[70px] h-[18px] rounded-full bg-black z-10" />
        <div className="rounded-[1.75rem] bg-white overflow-hidden">
          {/* Status bar */}
          <div className="flex items-center justify-between px-5 pt-7 pb-0.5">
            <span className="text-[9px] font-semibold text-gray-900 tabular-nums">9:41</span>
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3 text-gray-900" fill="currentColor" viewBox="0 0 24 24"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3a4.237 4.237 0 00-6 0zm-4-4l2 2a7.074 7.074 0 0110 0l2-2C15.14 9.14 8.87 9.14 5 13z" /></svg>
              <svg className="w-3 h-3 text-gray-900" fill="currentColor" viewBox="0 0 24 24"><path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z" /></svg>
            </div>
          </div>

          <div className="px-4 pt-1.5 pb-2 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-gray-900 font-[family-name:var(--font-display)]">Invoices</p>
              <p className="text-[8px] text-gray-400 mt-0.5">3 this month</p>
            </div>
            <div className="w-5 h-5 rounded-full bg-[#E54D2E] flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
          </div>

          {/* Totals card */}
          <div className="mx-4 bg-gradient-to-br from-[#fff8f5] to-[#ffeee6] rounded-lg p-3 ring-1 ring-orange-100/60">
            <p className="text-[8px] text-gray-500 uppercase tracking-wider">Outstanding</p>
            <p className="text-[18px] font-extrabold text-gray-900 font-[family-name:var(--font-display)] tabular-nums leading-tight mt-0.5">$6,000</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="text-[8px] text-emerald-600 font-semibold">$2,640 paid</span>
              <span className="text-gray-300 text-[8px]">·</span>
              <span className="text-[8px] text-gray-500">Apr</span>
            </div>
          </div>

          {/* Invoice list */}
          <div className="px-4 pt-3 pb-2">
            <p className="text-[8px] font-medium text-gray-400 mb-1.5 tracking-wide uppercase">Recent</p>
            <div className="space-y-1.5">
              {invoices.map((inv) => (
                <div key={inv.num} className="bg-white rounded-md ring-1 ring-gray-100 px-2.5 py-1.5 flex items-center gap-1.5">
                  <div className={`w-1 h-1 rounded-full shrink-0 ${inv.color}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] text-gray-900 font-semibold truncate">{inv.num} · {inv.client}</p>
                    <p className="text-[7px] text-gray-400 capitalize">{inv.status}</p>
                  </div>
                  <span className="text-[9px] text-gray-900 font-semibold tabular-nums">{inv.amount}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-around px-3 py-2 mt-1 border-t border-gray-100">
            {[
              { label: 'Home', active: false },
              { label: 'Projects', active: false },
              { label: 'Invoices', active: true },
              { label: 'More', active: false },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center gap-0.5">
                <div className={`w-3 h-3 rounded-full ${item.active ? 'bg-[#E54D2E]' : 'bg-gray-200'}`} />
                <span className={`text-[7px] ${item.active ? 'text-[#E54D2E] font-medium' : 'text-gray-400'}`}>{item.label}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-center pb-1.5">
            <div className="w-16 h-0.5 rounded-full bg-gray-200" />
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardMock() {
  const projects = [
    { name: 'Acme Rebrand', client: 'Acme Inc.', progress: 67, tasks: '8/12', deadline: 'Apr 28', status: 'on-track' },
    { name: 'CloudSync App', client: 'CloudSync', progress: 33, tasks: '3/9', deadline: 'May 12', status: 'at-risk' },
    { name: 'Bloom Studio', client: 'Bloom Co.', progress: 83, tasks: '15/18', deadline: 'Apr 22', status: 'on-track' },
    { name: 'Meridian Site', client: 'Meridian', progress: 14, tasks: '1/7', deadline: 'Apr 19', status: 'overdue' },
  ];
  const statusColor = {
    'on-track': 'bg-emerald-400',
    'at-risk': 'bg-amber-400',
    'overdue': 'bg-[#E54D2E]',
  } as const;
  const statusText = {
    'on-track': 'On track',
    'at-risk': 'At risk',
    'overdue': 'Overdue',
  } as const;
  return (
    <div className="bg-white rounded-2xl ring-1 ring-black/5 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.18),0_14px_30px_-8px_rgba(229,77,46,0.2)] overflow-hidden text-left">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-[#E54D2E] flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <span className="text-sm font-semibold text-gray-900 tracking-tight font-[family-name:var(--font-display)]">Pulse Pro</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg text-xs text-gray-400 ring-1 ring-gray-100">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            Search...
            <span className="ml-4 text-[10px] text-gray-300 border border-gray-200 rounded px-1">⌘K</span>
          </div>
          <div className="w-7 h-7 rounded-full bg-[#E54D2E]/10 flex items-center justify-center text-[10px] font-semibold text-[#E54D2E]">JD</div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="hidden md:flex flex-col w-44 border-r border-gray-100 py-3 px-3 gap-0.5 shrink-0">
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-gray-500">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4" /></svg>
            Dashboard
          </div>
          <div className="flex items-center gap-2 px-2 py-1.5 bg-[#E54D2E]/8 rounded-md text-xs font-medium text-[#E54D2E]">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
            Projects
          </div>
          {[
            { label: 'Tasks', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
            { label: 'Clients', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
            { label: 'Calendar', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
            { label: 'Invoices', icon: 'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z' },
            { label: 'Bookmarks', icon: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-gray-500">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d={item.icon} /></svg>
              {item.label}
            </div>
          ))}
        </div>

        {/* Main content — Projects view */}
        <div className="flex-1 p-4 md:p-5 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-gray-900 tracking-tight font-[family-name:var(--font-display)]">Projects</p>
              <p className="text-[11px] text-gray-400 mt-0.5">4 active · 12 completed</p>
            </div>
            <div className="flex gap-2">
              <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 ring-1 ring-gray-200 text-gray-600 rounded-md text-[10px] font-medium">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                Filter
              </div>
              <div className="px-2.5 py-1 bg-[#E54D2E] text-white rounded-md text-[10px] font-medium shadow-[0_4px_10px_-3px_rgba(229,77,46,0.5)]">+ New Project</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {projects.map((p) => (
              <div key={p.name} className="rounded-xl p-4 ring-1 ring-black/[0.04] bg-white hover:ring-[#E54D2E]/30 transition-all">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-gray-900 truncate tracking-tight">{p.name}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{p.client}</p>
                  </div>
                  <span className="ml-2 flex items-center gap-1 shrink-0">
                    <span className={`w-1.5 h-1.5 rounded-full ${statusColor[p.status as keyof typeof statusColor]}`} />
                    <span className="text-[9px] text-gray-500 font-medium uppercase tracking-wider">{statusText[p.status as keyof typeof statusText]}</span>
                  </span>
                </div>

                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[9px] text-gray-500 font-medium tabular-nums">{p.tasks} tasks</span>
                    <span className="text-[9px] text-gray-900 font-semibold tabular-nums">{p.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${p.status === 'overdue' ? 'bg-[#E54D2E]' : p.status === 'at-risk' ? 'bg-amber-400' : 'bg-emerald-400'}`}
                      style={{ width: `${p.progress}%` }}
                    />
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[9px] text-gray-400 inline-flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    Due {p.deadline}
                  </span>
                  <div className="flex -space-x-1.5">
                    <div className="w-4 h-4 rounded-full bg-orange-100 ring-2 ring-white flex items-center justify-center text-[7px] font-bold text-[#E54D2E]">JD</div>
                    <div className="w-4 h-4 rounded-full bg-emerald-100 ring-2 ring-white flex items-center justify-center text-[7px] font-bold text-emerald-600">SK</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Features() {
  return (
    <section id="features" className="relative py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-md px-3.5 py-1.5 text-[11px] font-medium tracking-[0.14em] uppercase text-foreground/70">
            <span className="size-1.5 rounded-full bg-[#E54D2E]" />
            Everything you need
          </div>
          <h2 className="mt-6 text-4xl md:text-5xl font-semibold text-foreground tracking-[-0.03em] font-[family-name:var(--font-display)]">
            Built for how you <span className="italic font-light">actually</span> work.
          </h2>
          <p className="mt-4 text-base md:text-lg text-muted-foreground">
            No Gantt charts. No sprint planning. No learning curve. Just the tools you need.
          </p>
        </div>

        <ScrollReveal delay={0}>
          <div className="mt-14 md:mt-20 flex flex-col lg:flex-row items-center lg:items-end justify-center gap-8 lg:gap-10">
            <div className="w-full lg:flex-1 min-w-0">
              <DashboardMock />
            </div>
            <div className="hidden lg:block">
              <StaticPhoneMock />
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-16 md:mt-20">
            {features.map((feature, idx) => (
              <div
                key={feature.title}
                className="group relative rounded-2xl p-6 bg-white dark:bg-[#2d2d2f] ring-1 ring-black/5 dark:ring-white/5 hover:ring-[#E54D2E]/30 hover:shadow-[0_18px_40px_-12px_rgba(229,77,46,0.25)] transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div className="size-10 rounded-xl bg-gradient-to-br from-[#E54D2E] to-[#F0613E] text-white flex items-center justify-center shadow-[0_6px_20px_-4px_rgba(229,77,46,0.45)]">
                    {feature.icon}
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground/50 tabular-nums tracking-wider mt-1">
                    0{idx + 1}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mt-5 tracking-tight font-[family-name:var(--font-display)]">{feature.title}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
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
