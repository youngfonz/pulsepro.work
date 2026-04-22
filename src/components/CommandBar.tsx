'use client'

import { useState, useEffect, useRef, useCallback, useTransition, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { globalSearch, type SearchResult } from '@/actions/search'
import { createTask } from '@/actions/tasks'
import { createClient } from '@/actions/clients'
import { parseTaskFromVoice, parseClientFromVoice } from '@/lib/voice'

const NAV_ITEMS = [
  { title: 'Dashboard', href: '/dashboard', icon: 'home' },
  { title: 'Projects', href: '/projects', icon: 'project' },
  { title: 'Tasks', href: '/tasks', icon: 'task' },
  { title: 'Calendar', href: '/calendar', icon: 'calendar' },
  { title: 'Bookmarks', href: '/bookmarks', icon: 'bookmark' },
  { title: 'Clients', href: '/clients', icon: 'client' },
  { title: 'Invoices', href: '/invoices', icon: 'invoice' },
  { title: 'Settings', href: '/settings', icon: 'settings' },
]

const QUICK_ACTIONS = [
  { title: 'New Project', href: '/projects/new', icon: 'plus' },
  { title: 'New Client', href: '/clients/new', icon: 'plus' },
  { title: 'Add Task', href: '/tasks?add=true', icon: 'plus' },
  { title: 'Add Bookmark', href: '/bookmarks?add=true', icon: 'plus' },
  { title: 'New Invoice', href: '/invoices/new', icon: 'plus' },
]

function TypeIcon({ type, className = 'w-4 h-4' }: { type: string; className?: string }) {
  switch (type) {
    case 'project':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      )
    case 'task':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    case 'client':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    case 'bookmark':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      )
    case 'home':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    case 'calendar':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    case 'invoice':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
        </svg>
      )
    case 'settings':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    case 'plus':
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      )
    default:
      return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )
  }
}

interface FlatItem {
  id: string
  title: string
  subtitle?: string
  href: string
  type: string
  section: string
}

export function CommandBar() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPending, startTransition] = useTransition()
  const [createSuccess, setCreateSuccess] = useState<string | null>(null)
  const [createError, setCreateError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)

  // Detect creation mode from query prefix
  const createMode = useMemo(() => {
    const trimmed = query.trim()
    const taskMatch = trimmed.match(/^(?:add|new)\s+task\s+(.*)/i)
    if (taskMatch && taskMatch[1].trim()) {
      return { type: 'task' as const, input: taskMatch[1].trim(), parsed: parseTaskFromVoice(taskMatch[1].trim()) }
    }
    const clientMatch = trimmed.match(/^(?:add|new)\s+client\s+(.*)/i)
    if (clientMatch && clientMatch[1].trim()) {
      return { type: 'client' as const, input: clientMatch[1].trim(), parsed: parseClientFromVoice(clientMatch[1].trim()) }
    }
    return null
  }, [query])

  const handleCreate = useCallback(() => {
    if (!createMode) return
    setCreateError(null)
    startTransition(async () => {
      try {
        if (createMode.type === 'task') {
          const parsed = createMode.parsed as ReturnType<typeof parseTaskFromVoice>
          const formData = new FormData()
          formData.append('title', parsed.title)
          if (parsed.priority) formData.append('priority', parsed.priority)
          if (parsed.dueDate) formData.append('dueDate', parsed.dueDate)
          if (parsed.description) formData.append('description', parsed.description)
          await createTask(null, formData)
          setCreateSuccess(`Task "${parsed.title}" created`)
        } else {
          const parsed = createMode.parsed as ReturnType<typeof parseClientFromVoice>
          const formData = new FormData()
          formData.append('name', parsed.name)
          if (parsed.email) formData.append('email', parsed.email)
          if (parsed.phone) formData.append('phone', parsed.phone)
          if (parsed.company) formData.append('company', parsed.company)
          await createClient(formData)
          setCreateSuccess(`Client "${parsed.name}" created`)
        }
        router.refresh()
        setTimeout(() => {
          setIsOpen(false)
          setCreateSuccess(null)
        }, 800)
      } catch (err) {
        setCreateError(err instanceof Error ? err.message : 'Failed to create. Please try again.')
      }
    })
  }, [createMode, router])

  // Build flat list of all items for keyboard navigation
  const flatItems: FlatItem[] = []

  if (createMode) {
    // Don't show search results or navigation in create mode
  } else if (query.trim().length >= 2) {
    // Search results grouped by type
    const grouped: Record<string, SearchResult[]> = {}
    for (const r of results) {
      if (!grouped[r.type]) grouped[r.type] = []
      grouped[r.type].push(r)
    }
    const typeLabels: Record<string, string> = {
      project: 'Projects',
      task: 'Tasks',
      client: 'Clients',
      bookmark: 'Bookmarks',
    }
    for (const [type, items] of Object.entries(grouped)) {
      for (const item of items) {
        flatItems.push({
          id: item.id,
          title: item.title,
          subtitle: item.subtitle,
          href: item.href,
          type: item.type,
          section: typeLabels[type] || type,
        })
      }
    }
  } else {
    // Show quick actions and navigation when no search
    for (const action of QUICK_ACTIONS) {
      flatItems.push({
        id: `action-${action.href}`,
        title: action.title,
        href: action.href,
        type: action.icon,
        section: 'Quick Actions',
      })
    }
    for (const nav of NAV_ITEMS) {
      flatItems.push({
        id: `nav-${nav.href}`,
        title: nav.title,
        href: nav.href,
        type: nav.icon,
        section: 'Navigation',
      })
    }
  }

  // Open/close with keyboard shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setQuery('')
      setResults([])
      setActiveIndex(0)
      setCreateSuccess(null)
      setCreateError(null)
    }
  }, [isOpen])

  // Search with debounce (skip in create mode)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (createMode || query.trim().length < 2) {
      setResults([])
      setActiveIndex(0)
      return
    }

    debounceRef.current = setTimeout(() => {
      startTransition(async () => {
        const data = await globalSearch(query)
        setResults(data)
        setActiveIndex(0)
      })
    }, 200)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, createMode])

  // Reset active index when results change
  useEffect(() => {
    setActiveIndex(0)
  }, [flatItems.length])

  const navigate = useCallback(
    (href: string) => {
      setIsOpen(false)
      // For bookmark external URLs, open in new tab
      if (href.startsWith('http')) {
        window.open(href, '_blank', 'noopener,noreferrer')
      } else {
        router.push(href)
      }
    },
    [router]
  )

  function handleKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex((prev) => Math.min(prev + 1, flatItems.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex((prev) => Math.max(prev - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (createMode) {
          handleCreate()
        } else if (flatItems[activeIndex]) {
          navigate(flatItems[activeIndex].href)
        }
        break
      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        break
    }
  }

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return
    const activeEl = listRef.current.querySelector('[data-active="true"]')
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' })
    }
  }, [activeIndex])

  if (!isOpen) return null

  // Group flat items by section for display
  const sections: { label: string; items: (FlatItem & { flatIndex: number })[] }[] = []
  let currentSection = ''
  let flatIndex = 0

  for (const item of flatItems) {
    if (item.section !== currentSection) {
      currentSection = item.section
      sections.push({ label: item.section, items: [] })
    }
    sections[sections.length - 1].items.push({ ...item, flatIndex })
    flatIndex++
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[101] flex items-start justify-center pt-[15vh] px-4" onClick={() => setIsOpen(false)}>
        <div className="w-full max-w-lg bg-background border border-border rounded-xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 border-b border-border">
            <svg
              className="w-5 h-5 text-muted-foreground flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search, or try: add task Buy groceries"
              className="flex-1 py-3.5 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-sm"
            />
            {isPending && (
              <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
            )}
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground bg-muted border border-border rounded">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div ref={listRef} className="max-h-[50vh] overflow-y-auto py-2">
            {/* Inline creation mode */}
            {createSuccess ? (
              <div className="px-4 py-6 text-center">
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm font-medium text-foreground">{createSuccess}</span>
                </div>
              </div>
            ) : createMode ? (
              <div className="px-4 py-3">
                <div className="px-4 py-1.5 mb-2">
                  <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                    {createMode.type === 'task' ? 'Create Task' : 'Create Client'}
                  </span>
                </div>
                <button
                  onClick={handleCreate}
                  disabled={isPending}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left bg-muted rounded-lg transition-colors hover:bg-muted/80"
                >
                  <div className="w-8 h-8 rounded-md flex items-center justify-center bg-primary/10 text-primary flex-shrink-0">
                    <TypeIcon type={createMode.type === 'task' ? 'task' : 'client'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {createMode.type === 'task'
                        ? (createMode.parsed as ReturnType<typeof parseTaskFromVoice>).title
                        : (createMode.parsed as ReturnType<typeof parseClientFromVoice>).name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {createMode.type === 'task' && (
                        <>
                          {(createMode.parsed as ReturnType<typeof parseTaskFromVoice>).priority && (
                            <span className="text-[10px] text-muted-foreground">
                              {(createMode.parsed as ReturnType<typeof parseTaskFromVoice>).priority} priority
                            </span>
                          )}
                          {(createMode.parsed as ReturnType<typeof parseTaskFromVoice>).dueDate && (
                            <span className="text-[10px] text-muted-foreground">
                              due {(createMode.parsed as ReturnType<typeof parseTaskFromVoice>).dueDate}
                            </span>
                          )}
                          {!(createMode.parsed as ReturnType<typeof parseTaskFromVoice>).priority &&
                            !(createMode.parsed as ReturnType<typeof parseTaskFromVoice>).dueDate && (
                            <span className="text-[10px] text-muted-foreground">Quick task</span>
                          )}
                        </>
                      )}
                      {createMode.type === 'client' && (
                        <>
                          {(createMode.parsed as ReturnType<typeof parseClientFromVoice>).email && (
                            <span className="text-[10px] text-muted-foreground">
                              {(createMode.parsed as ReturnType<typeof parseClientFromVoice>).email}
                            </span>
                          )}
                          {(createMode.parsed as ReturnType<typeof parseClientFromVoice>).company && (
                            <span className="text-[10px] text-muted-foreground">
                              {(createMode.parsed as ReturnType<typeof parseClientFromVoice>).company}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  {isPending ? (
                    <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                  ) : (
                    <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground bg-background border border-border rounded">
                      Enter
                    </kbd>
                  )}
                </button>
                {createError && (
                  <p className="mt-2 px-4 text-xs text-destructive">{createError}</p>
                )}
              </div>
            ) : null}

            {!createMode && query.trim().length >= 2 && !isPending && flatItems.length === 0 && (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No results for &ldquo;{query}&rdquo;
                </p>
              </div>
            )}

            {!createMode && sections.map((section) => (
              <div key={section.label}>
                <div className="px-4 py-1.5">
                  <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                    {section.label}
                  </span>
                </div>
                {section.items.map((item) => (
                  <button
                    key={item.id}
                    data-active={item.flatIndex === activeIndex}
                    onClick={() => navigate(item.href)}
                    onMouseEnter={() => setActiveIndex(item.flatIndex)}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors ${
                      item.flatIndex === activeIndex
                        ? 'bg-muted text-foreground'
                        : 'text-foreground hover:bg-muted/50'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 ${
                        item.flatIndex === activeIndex
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <TypeIcon type={item.type} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      {item.subtitle && (
                        <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
                      )}
                    </div>
                    {item.flatIndex === activeIndex && (
                      <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground bg-background border border-border rounded">
                        Enter
                      </kbd>
                    )}
                  </button>
                ))}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-border flex items-center justify-between">
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              {createMode ? (
                <>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 bg-muted border border-border rounded text-[10px]">&crarr;</kbd>
                    create
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded text-[10px]">esc</kbd>
                    close
                  </span>
                </>
              ) : (
                <>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 bg-muted border border-border rounded text-[10px]">&uarr;</kbd>
                    <kbd className="px-1 py-0.5 bg-muted border border-border rounded text-[10px]">&darr;</kbd>
                    navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 bg-muted border border-border rounded text-[10px]">&crarr;</kbd>
                    open
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded text-[10px]">esc</kbd>
                    close
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export function CommandBarTrigger({
  isCollapsed,
  onClick,
}: {
  isCollapsed: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2.5 w-full px-3 py-1.5 text-sm font-medium text-sidebar-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors rounded ${
        isCollapsed ? 'justify-center' : ''
      }`}
      title={isCollapsed ? 'Search (⌘K)' : undefined}
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      {!isCollapsed && (
        <>
          <span className="flex-1 text-left">Search</span>
          <kbd className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded border border-border">
            ⌘K
          </kbd>
        </>
      )}
    </button>
  )
}
