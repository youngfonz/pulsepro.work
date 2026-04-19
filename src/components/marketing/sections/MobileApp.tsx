'use client';

import { useState, useEffect } from 'react';
import { ScrollReveal } from '../ScrollReveal';

const mobileFeatures = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Dashboard with activity rings',
    description: 'Track projects, completed tasks, and upcoming deadlines at a glance.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    title: 'Swipe to complete tasks',
    description: 'Swipe right to mark tasks done with haptic feedback. Fast, natural, satisfying.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
        <path d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
      </svg>
    ),
    title: 'Create & send invoices',
    description: 'Build invoices, add line items, and email clients — all from your phone.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
        <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    ),
    title: 'Project tracking with tabs',
    description: 'Overview, tasks, time entries, and budget — organized in swipeable tabs.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    title: 'Global search',
    description: 'Find any project, task, or client instantly. Same powerful search, pocket-sized.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
        <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Calendar',
    description: 'View deadlines and schedule from anywhere. Never miss a due date on the go.',
  },
];

const screenLabels = ['Dashboard', 'Tasks', 'Invoices', 'Projects'];

function DashboardScreen() {
  return (
    <>
      <div className="px-5 pt-2 pb-3">
        <p className="text-[13px] font-semibold text-gray-900">Good morning</p>
        <p className="text-[10px] text-gray-400 mt-0.5">3 tasks due today</p>
      </div>
      <div className="mx-5 bg-gray-50 rounded-xl p-4">
        <div className="flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-20 h-20">
            <circle cx="50" cy="50" r="44" fill="none" stroke="#fecdd3" strokeWidth="7" />
            <circle cx="50" cy="50" r="44" fill="none" stroke="#f43f5e" strokeWidth="7" strokeDasharray="276" strokeDashoffset="83" strokeLinecap="round" transform="rotate(-90 50 50)" />
            <circle cx="50" cy="50" r="34" fill="none" stroke="#bfdbfe" strokeWidth="7" />
            <circle cx="50" cy="50" r="34" fill="none" stroke="#3b82f6" strokeWidth="7" strokeDasharray="214" strokeDashoffset="43" strokeLinecap="round" transform="rotate(-90 50 50)" />
            <circle cx="50" cy="50" r="24" fill="none" stroke="#bbf7d0" strokeWidth="7" />
            <circle cx="50" cy="50" r="24" fill="none" stroke="#22c55e" strokeWidth="7" strokeDasharray="151" strokeDashoffset="75" strokeLinecap="round" transform="rotate(-90 50 50)" />
          </svg>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-3">
          <div className="text-center">
            <p className="text-[11px] font-semibold text-gray-900">5</p>
            <p className="text-[8px] text-gray-400">Active</p>
          </div>
          <div className="text-center">
            <p className="text-[11px] font-semibold text-gray-900">12</p>
            <p className="text-[8px] text-gray-400">Done</p>
          </div>
          <div className="text-center">
            <p className="text-[11px] font-semibold text-gray-900">3</p>
            <p className="text-[8px] text-gray-400">Due</p>
          </div>
        </div>
      </div>
      <div className="px-5 pt-4 pb-2">
        <p className="text-[10px] font-medium text-gray-400 mb-2">Due Today</p>
        <div className="space-y-2">
          {[
            { task: 'Finalize brand guidelines', project: 'Acme Rebrand', dot: 'bg-red-400' },
            { task: 'Review wireframes', project: 'CloudSync', dot: 'bg-amber-400' },
            { task: 'Send invoice #1042', project: 'Bloom Studio', dot: 'bg-red-400' },
          ].map((item) => (
            <div key={item.task} className="bg-white rounded-lg border border-gray-100 px-3 py-2">
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${item.dot}`} />
                <span className="text-[10px] text-gray-800 font-medium">{item.task}</span>
              </div>
              <span className="text-[8px] text-gray-400 ml-3.5">{item.project}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function TasksScreen() {
  return (
    <>
      <div className="px-5 pt-2 pb-3 flex items-center justify-between">
        <p className="text-[13px] font-semibold text-gray-900">Tasks</p>
        <div className="px-2 py-0.5 bg-[#E54D2E] text-white rounded-md text-[9px] font-medium">+ New</div>
      </div>
      <div className="px-5 pb-2">
        <div className="flex gap-1.5 mb-3">
          {['All', 'Today', 'Upcoming'].map((tab, i) => (
            <div key={tab} className={`px-2.5 py-1 rounded-full text-[9px] font-medium ${i === 1 ? 'bg-[#E54D2E] text-white' : 'bg-gray-100 text-gray-500'}`}>{tab}</div>
          ))}
        </div>
        <div className="space-y-2">
          <div className="relative">
            <div className="absolute inset-y-0 right-0 w-16 bg-emerald-500 rounded-r-lg flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
            <div className="relative bg-white rounded-lg border border-gray-100 px-3 py-2 -translate-x-8">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                <span className="text-[10px] text-gray-800 font-medium">Finalize brand guidelines</span>
              </div>
              <span className="text-[8px] text-gray-400 ml-3.5">Acme Rebrand</span>
            </div>
          </div>
          {[
            { task: 'Review wireframes', project: 'CloudSync', dot: 'bg-amber-400', done: false },
            { task: 'Update API docs', project: 'DevPortal', dot: 'bg-primary/70', done: false },
            { task: 'Design onboarding flow', project: 'Bloom Studio', dot: 'bg-amber-400', done: false },
            { task: 'Fix checkout bug', project: 'ShopFront', dot: 'bg-red-400', done: true },
            { task: 'Weekly standup notes', project: 'Internal', dot: 'bg-gray-300', done: true },
          ].map((item) => (
            <div key={item.task} className="bg-white rounded-lg border border-gray-100 px-3 py-2">
              <div className="flex items-center gap-2">
                {item.done ? (
                  <svg className="w-3 h-3 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                ) : (
                  <div className={`w-1.5 h-1.5 rounded-full ${item.dot}`} />
                )}
                <span className={`text-[10px] font-medium ${item.done ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{item.task}</span>
              </div>
              <span className="text-[8px] text-gray-400 ml-3.5">{item.project}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function InvoiceScreen() {
  return (
    <>
      <div className="px-5 pt-2 pb-3 flex items-center justify-between">
        <p className="text-[13px] font-semibold text-gray-900">Invoice #1042</p>
        <div className="px-2 py-0.5 bg-emerald-500 text-white rounded-md text-[9px] font-medium">Send</div>
      </div>
      <div className="mx-5 bg-gray-50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[10px] font-medium text-gray-500">Bill to</p>
            <p className="text-[11px] font-semibold text-gray-900">Bloom Studio</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-medium text-gray-500">Date</p>
            <p className="text-[11px] text-gray-700">Mar 7, 2026</p>
          </div>
        </div>
        <div className="border-t border-gray-200 pt-3 space-y-2">
          {[
            { item: 'Brand identity design', hrs: '12h', amount: '$1,440' },
            { item: 'Logo variations', hrs: '4h', amount: '$480' },
            { item: 'Style guide document', hrs: '6h', amount: '$720' },
          ].map((line) => (
            <div key={line.item} className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-800 font-medium">{line.item}</p>
                <p className="text-[8px] text-gray-400">{line.hrs} @ $120/hr</p>
              </div>
              <span className="text-[10px] font-medium text-gray-900">{line.amount}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-200 mt-3 pt-3 flex items-center justify-between">
          <span className="text-[11px] font-semibold text-gray-900">Total</span>
          <span className="text-[14px] font-bold text-gray-900">$2,640</span>
        </div>
      </div>
      <div className="px-5 pt-4 pb-2">
        <p className="text-[10px] font-medium text-gray-400 mb-2">Status</p>
        <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-100 px-3 py-2.5">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span className="text-[10px] text-gray-800 font-medium">Pending</span>
          <span className="text-[8px] text-gray-400 ml-auto">Due in 14 days</span>
        </div>
        <div className="flex gap-2 mt-3">
          <div className="flex-1 text-center py-2 bg-white rounded-lg border border-gray-100 text-[9px] font-medium text-gray-600">Preview</div>
          <div className="flex-1 text-center py-2 bg-[#E54D2E] rounded-lg text-[9px] font-medium text-white">Email Client</div>
        </div>
      </div>
    </>
  );
}

function ProjectScreen() {
  return (
    <>
      <div className="px-5 pt-2 pb-1">
        <div className="flex items-center gap-2">
          <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          <p className="text-[13px] font-semibold text-gray-900">Acme Rebrand</p>
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-[9px] text-gray-500">On track</span>
          <span className="text-[9px] text-gray-300 mx-1">|</span>
          <span className="text-[9px] text-gray-500">8 of 12 tasks done</span>
        </div>
      </div>
      <div className="px-5 pt-2 pb-1">
        <div className="flex gap-1">
          {['Overview', 'Tasks', 'Time', 'Budget'].map((tab, i) => (
            <div key={tab} className={`px-2.5 py-1 rounded-full text-[9px] font-medium ${i === 0 ? 'bg-[#E54D2E] text-white' : 'bg-gray-100 text-gray-500'}`}>{tab}</div>
          ))}
        </div>
      </div>
      <div className="px-5 pt-3 pb-2">
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-[10px] font-medium text-gray-500 mb-2">Progress</p>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-[#E54D2E] rounded-full" style={{ width: '67%' }} />
          </div>
          <p className="text-[9px] text-gray-400 mt-1">67% complete</p>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-[9px] text-gray-400">Hours logged</p>
            <p className="text-[14px] font-bold text-gray-900 mt-0.5">34.5h</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-[9px] text-gray-400">Budget used</p>
            <p className="text-[14px] font-bold text-gray-900 mt-0.5">$4,140</p>
          </div>
        </div>
        <p className="text-[10px] font-medium text-gray-500 mt-3 mb-2">Recent tasks</p>
        <div className="space-y-1.5">
          {[
            { task: 'Color palette final', done: true },
            { task: 'Typography system', done: true },
            { task: 'Logo lockups', done: false },
            { task: 'Brand book draft', done: false },
          ].map((t) => (
            <div key={t.task} className="flex items-center gap-2 bg-white rounded-lg border border-gray-100 px-3 py-1.5">
              {t.done ? (
                <svg className="w-3 h-3 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              ) : (
                <div className="w-3 h-3 rounded border border-gray-300 shrink-0" />
              )}
              <span className={`text-[10px] font-medium ${t.done ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{t.task}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

const screens = [DashboardScreen, TasksScreen, InvoiceScreen, ProjectScreen];

export function PhoneMock() {
  const [activeScreen, setActiveScreen] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveScreen((prev) => (prev + 1) % screens.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const Screen = screens[activeScreen];
  const navItems = [
    { label: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4', screenIdx: 0 },
    { label: 'Projects', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z', screenIdx: 3 },
    { label: 'Tasks', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', screenIdx: 1 },
    { label: 'More', icon: 'M4 6h16M4 12h16M4 18h16', screenIdx: -1 },
  ];

  return (
    <div className="relative mx-auto w-[280px] sm:w-[300px]">
      <div className="rounded-[2.5rem] border-[3px] border-foreground/15 bg-white overflow-hidden shadow-2xl">
        {/* Status bar */}
        <div className="flex items-center justify-between px-6 pt-3 pb-1">
          <span className="text-[10px] font-semibold text-gray-900">9:41</span>
          <div className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-gray-900" fill="currentColor" viewBox="0 0 24 24"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3a4.237 4.237 0 00-6 0zm-4-4l2 2a7.074 7.074 0 0110 0l2-2C15.14 9.14 8.87 9.14 5 13z" /></svg>
            <svg className="w-3.5 h-3.5 text-gray-900" fill="currentColor" viewBox="0 0 24 24"><path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z" /></svg>
          </div>
        </div>

        {/* Screen content — fixed height prevents layout shift between screens */}
        <div className="h-[340px] overflow-hidden">
          <Screen />
        </div>

        {/* Bottom nav */}
        <div className="flex items-center justify-around px-4 py-3 mt-2 border-t border-gray-100">
          {navItems.map((item) => {
            const isActive = item.screenIdx === activeScreen;
            return (
              <div key={item.label} className="flex flex-col items-center gap-0.5">
                <svg className={`w-4 h-4 ${isActive ? 'text-[#E54D2E]' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d={item.icon} /></svg>
                <span className={`text-[8px] ${isActive ? 'text-[#E54D2E] font-medium' : 'text-gray-400'}`}>{item.label}</span>
              </div>
            );
          })}
        </div>

        {/* Home indicator */}
        <div className="flex justify-center pb-2">
          <div className="w-24 h-1 rounded-full bg-gray-200" />
        </div>
      </div>

      {/* Screen indicator dots */}
      <div className="flex items-center justify-center gap-1.5 mt-4">
        {screenLabels.map((label, i) => (
          <button
            key={label}
            onClick={() => setActiveScreen(i)}
            className={`transition-all duration-200 rounded-full ${i === activeScreen ? 'w-5 h-1.5 bg-primary' : 'w-1.5 h-1.5 bg-foreground/20 hover:bg-foreground/40'}`}
          />
        ))}
      </div>
    </div>
  );
}

export function MobileApp() {
  return (
    <section id="mobile-app" className="relative z-0 py-20 md:py-28 bg-[#f5f5f7] dark:bg-[#1d1d1f]">
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 mb-6">
            <svg className="w-4 h-4 text-primary" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span className="text-sm font-medium text-primary">Now on mobile</span>
          </div>
          <h2 className="text-3xl font-semibold text-foreground tracking-tight font-[family-name:var(--font-display)]">
            Your projects, wherever you are.
          </h2>
          <p className="text-base text-muted-foreground mt-3 max-w-xl mx-auto">
            The full Pulse Pro experience in your pocket. Manage tasks, send invoices, and track projects from your phone.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <ScrollReveal delay={0} direction="left">
            <PhoneMock />
          </ScrollReveal>

          <ScrollReveal delay={100} direction="right">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
              {mobileFeatures.map((feature) => (
                <div key={feature.title} className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
