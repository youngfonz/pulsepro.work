'use client'

import { useState, useEffect } from 'react'

const ONBOARDING_KEY_PREFIX = 'pulse-onboarding-complete'

const steps = [
  {
    title: 'Add your first task',
    description:
      'Press N anywhere to capture a task instantly. Type what you need to do, hit Enter. No setup required — just start.',
    visual: 'quickadd',
  },
  {
    title: 'Organize when you\u2019re ready',
    description:
      'Group tasks into projects and assign them to clients — or don\u2019t. Quick tasks work great on their own. Structure is optional.',
    visual: 'organize',
  },
  {
    title: 'Shortcuts that save time',
    description:
      'Use \u2318K to search and navigate anywhere. Press N to quick-add tasks. Speak tasks using the mic icon. Everything is built for speed.',
    visual: 'shortcuts',
  },
  {
    title: 'You\u2019re all set',
    description:
      'Your dashboard shows what\u2019s due, what\u2019s overdue, and what needs attention. Start adding tasks and let Pulse Pro keep you on track.',
    visual: 'ready',
  },
]

export function OnboardingOverlay({ userId }: { userId: string }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [visible, setVisible] = useState(false)

  const storageKey = `${ONBOARDING_KEY_PREFIX}-${userId}`

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem(storageKey)) {
      setVisible(true)
    }
  }, [storageKey])

  if (!visible) return null

  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === steps.length - 1
  const step = steps[currentStep]

  const handleNext = () => {
    if (isLastStep) {
      localStorage.setItem(storageKey, 'true')
      setVisible(false)
    } else {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleClose = () => {
    localStorage.setItem(storageKey, 'true')
    setVisible(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-background border border-border rounded-2xl shadow-2xl w-full max-w-[420px] overflow-hidden relative">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-muted hover:bg-muted-foreground/20 flex items-center justify-center transition-colors"
        >
          <svg className="w-3.5 h-3.5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Visual preview area */}
        <div className="relative h-[220px] overflow-hidden bg-muted/50">
          <div className="relative h-full flex items-center justify-center p-6">
            {step.visual === 'quickadd' && <QuickAddVisual />}
            {step.visual === 'organize' && <OrganizeVisual />}
            {step.visual === 'shortcuts' && <ShortcutsVisual />}
            {step.visual === 'ready' && <ReadyVisual />}
          </div>
        </div>

        {/* Content */}
        <div className="px-8 pt-6 pb-2 text-center">
          <h2 className="text-xl font-semibold text-foreground tracking-tight">
            {step.title}
          </h2>
          <p className="text-sm text-muted-foreground mt-2.5 leading-relaxed">
            {step.description}
          </p>
        </div>

        {/* Footer: dots + navigation */}
        <div className="px-6 pt-4 pb-5 relative flex items-center justify-center">
          {/* Back button — absolute left */}
          {isFirstStep ? (
            <div className="absolute left-6 w-16" />
          ) : (
            <button
              onClick={handleBack}
              className="absolute left-6 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Back
            </button>
          )}

          {/* Step indicator — truly centered */}
          <div className="flex flex-col items-center gap-1.5">
            <div className="flex items-center gap-2">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all ${
                    i === currentStep
                      ? 'w-2 bg-primary'
                      : 'w-2 bg-muted-foreground/25'
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] text-muted-foreground">{currentStep + 1} of {steps.length}</span>
          </div>

          {/* Continue/Done button — absolute right */}
          <button
            onClick={handleNext}
            className="absolute right-6 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground px-5 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            {isLastStep ? 'Get started' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Visual Components for each step ─── */

function QuickAddVisual() {
  return (
    <div className="w-full max-w-[320px] bg-background rounded-lg shadow-lg overflow-hidden border border-border">
      {/* Mock quick-add input */}
      <div className="flex items-center gap-3 px-4 border-b border-border">
        <svg className="w-4 h-4 text-muted-foreground flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        <div className="flex-1 py-3">
          <span className="text-sm text-foreground">Buy groceries due tomorrow</span>
          <span className="animate-pulse text-primary">|</span>
        </div>
      </div>
      {/* Bottom bar */}
      <div className="flex items-center justify-between px-4 py-2.5">
        <span className="text-[10px] text-muted-foreground">No project</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">
            Natural language parsing
          </span>
          <div className="px-2.5 py-1 bg-primary text-primary-foreground rounded text-[10px] font-medium">
            Add
          </div>
        </div>
      </div>
      {/* Footer hint */}
      <div className="px-4 py-1.5 border-t border-border flex items-center gap-3">
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <kbd className="px-1 py-0.5 bg-muted border border-border rounded text-[9px]">N</kbd>
          open quick-add
        </span>
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <kbd className="px-1 py-0.5 bg-muted border border-border rounded text-[9px]">&crarr;</kbd>
          add task
        </span>
      </div>
    </div>
  )
}

function OrganizeVisual() {
  return (
    <div className="w-full max-w-[320px] bg-background rounded-lg shadow-lg overflow-hidden border border-border">
      {/* Header */}
      <div className="px-3 py-2 border-b border-border">
        <span className="text-[10px] font-semibold text-foreground">Your tasks</span>
      </div>
      {/* Tasks list */}
      <div className="p-3 space-y-1.5">
        {/* Standalone tasks */}
        <div className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider mb-1">Quick tasks</div>
        {[
          { title: 'Buy groceries', tag: null },
          { title: 'Call dentist', tag: null },
        ].map((t) => (
          <div key={t.title} className="flex items-center gap-2 py-1.5 px-2 bg-muted/50 rounded">
            <div className="w-3.5 h-3.5 rounded border border-border flex-shrink-0" />
            <span className="text-[10px] text-foreground font-medium flex-1">{t.title}</span>
          </div>
        ))}
        {/* Project tasks */}
        <div className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider mt-3 mb-1">Acme Rebrand</div>
        {[
          { title: 'Finalize homepage copy', priority: 'High' },
          { title: 'Review wireframes', priority: 'Med' },
        ].map((t) => (
          <div key={t.title} className="flex items-center gap-2 py-1.5 px-2 bg-muted/50 rounded">
            <div className="w-3.5 h-3.5 rounded border border-border flex-shrink-0" />
            <span className="text-[10px] text-foreground font-medium flex-1">{t.title}</span>
            <span className={`text-[8px] font-semibold px-1.5 py-0.5 rounded ${
              t.priority === 'High' ? 'text-red-500 bg-red-50' : 'text-amber-600 bg-amber-50'
            }`}>
              {t.priority}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ShortcutsVisual() {
  return (
    <div className="w-full max-w-[300px] space-y-3">
      {[
        { keys: ['N'], label: 'Quick-add a task', desc: 'From anywhere in the app' },
        { keys: ['\u2318', 'K'], label: 'Search & navigate', desc: 'Find anything instantly' },
        { keys: ['\u23CE'], label: 'Create task', desc: 'While in quick-add modal' },
      ].map((shortcut) => (
        <div key={shortcut.label} className="flex items-center gap-3 bg-background rounded-lg border border-border px-4 py-3">
          <div className="flex items-center gap-1">
            {shortcut.keys.map((key) => (
              <kbd key={key} className="min-w-[28px] h-7 flex items-center justify-center bg-muted border border-border rounded text-xs font-medium text-foreground px-1.5">
                {key}
              </kbd>
            ))}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-foreground">{shortcut.label}</div>
            <div className="text-[10px] text-muted-foreground">{shortcut.desc}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function ReadyVisual() {
  return (
    <div className="w-full max-w-[320px] bg-background rounded-lg shadow-lg overflow-hidden border border-border">
      {/* Mini nav */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
        <div className="w-5 h-5 rounded bg-foreground flex items-center justify-center">
          <span className="text-[8px] font-bold text-background">P</span>
        </div>
        <span className="text-[10px] font-semibold text-foreground">Dashboard</span>
      </div>
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 p-3">
        {[
          { label: 'Active', value: '3', color: 'bg-primary' },
          { label: 'Due soon', value: '1', color: 'bg-amber-500' },
          { label: 'Done', value: '5', color: 'bg-emerald-500' },
        ].map((s) => (
          <div key={s.label} className="bg-muted/50 rounded-md p-2">
            <div className="text-[15px] font-bold text-foreground">{s.value}</div>
            <div className="text-[8px] text-muted-foreground mt-0.5">{s.label}</div>
            <div className={`h-0.5 w-6 ${s.color} rounded-full mt-1.5 opacity-60`} />
          </div>
        ))}
      </div>
      {/* Task rows */}
      <div className="px-3 pb-3 space-y-1.5">
        {[
          { name: 'Buy groceries', status: 'Due tomorrow', dot: 'bg-amber-500' },
          { name: 'Finalize homepage copy', status: 'Acme Rebrand', dot: 'bg-primary' },
          { name: 'Call dentist', status: 'Quick task', dot: 'bg-muted-foreground' },
        ].map((p) => (
          <div key={p.name} className="flex items-center gap-2 py-1.5 px-2 bg-muted/50 rounded">
            <div className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
            <span className="text-[10px] font-medium text-foreground flex-1">{p.name}</span>
            <span className="text-[9px] text-muted-foreground">{p.status}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
