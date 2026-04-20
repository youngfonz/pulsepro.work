import type { Reporter, TestCase, TestResult, FullResult } from '@playwright/test/reporter'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

/**
 * Reporter that extracts task IDs from spec titles (patterns like "t37"
 * or "t37-t39" or "t37, t39, t41") and emits public/qa-results.json keyed
 * by task id so the external-tester-guide.html can auto-tick items.
 *
 * Aggregation rules across multiple tests that reference the same task id:
 *   - If any test for that id FAILED  → status: 'fail'
 *   - Else if any PASSED              → status: 'pass'
 *   - Else if any SKIPPED             → status: 'skip'
 *   - Else                            → status: 'unknown'
 */

type TaskStatus = 'pass' | 'fail' | 'skip' | 'unknown'

interface TaskEntry {
  status: TaskStatus
  tests: Array<{
    title: string
    file: string
    status: 'passed' | 'failed' | 'timedOut' | 'skipped' | 'interrupted'
    durationMs: number
    error?: string
  }>
}

export default class GuideReporter implements Reporter {
  private tasks: Record<string, TaskEntry> = {}
  private startedAt = Date.now()
  private outputPath: string

  constructor(options?: { outputFile?: string }) {
    this.outputPath = options?.outputFile || 'public/qa-results.json'
  }

  onTestEnd(test: TestCase, result: TestResult) {
    const ids = extractTaskIds(test.title)
    if (!ids.length) return

    const fullTitle = test.titlePath().slice(1).join(' > ')
    const file = test.location?.file ?? ''

    for (const id of ids) {
      const existing = this.tasks[id] ?? { status: 'unknown', tests: [] }
      existing.tests.push({
        title: fullTitle,
        file: shortFile(file),
        status: result.status,
        durationMs: result.duration,
        error: result.error?.message?.slice(0, 500),
      })
      existing.status = aggregateStatus(existing.tests)
      this.tasks[id] = existing
    }
  }

  async onEnd(full: FullResult) {
    const counts = { total: 183, pass: 0, fail: 0, skip: 0, unknown: 0, unseen: 0 }
    for (let i = 1; i <= 183; i++) {
      const id = `t${i}`
      const entry = this.tasks[id]
      if (!entry) counts.unseen += 1
      else counts[entry.status] += 1
    }

    const payload = {
      generatedAt: new Date().toISOString(),
      runStatus: full.status, // 'passed' | 'failed' | 'timedout' | 'interrupted'
      durationMs: Date.now() - this.startedAt,
      baseUrl: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3001',
      counts,
      tasks: this.tasks,
    }

    try {
      mkdirSync(dirname(this.outputPath), { recursive: true })
      writeFileSync(this.outputPath, JSON.stringify(payload, null, 2))
      console.log(`\n[qa-reporter] wrote ${this.outputPath}`)
      console.log(
        `[qa-reporter] tasks: ${counts.pass} pass / ${counts.fail} fail / ${counts.skip} skip / ${counts.unseen} unseen (not automated) / 183 total`
      )
    } catch (err) {
      console.error(`[qa-reporter] failed to write ${this.outputPath}:`, err)
    }
  }
}

/**
 * Extract task IDs from a test title. Accepts:
 *   "t37: ..."
 *   "t37-t39: ..."
 *   "t37, t39, t41: ..."
 *   "t37 and t38 and t39: ..."
 */
function extractTaskIds(title: string): string[] {
  const prefix = title.split(/:\s/)[0] // everything before the first ":"
  const rangeMatches = [...prefix.matchAll(/t(\d+)-t(\d+)/gi)]
  const ids = new Set<string>()
  for (const m of rangeMatches) {
    const start = parseInt(m[1], 10)
    const end = parseInt(m[2], 10)
    for (let i = start; i <= end; i++) ids.add(`t${i}`)
  }
  // Strip range notation so we don't double-count, then pull singletons
  const stripped = prefix.replace(/t\d+-t\d+/gi, ' ')
  for (const m of stripped.matchAll(/\bt(\d+)\b/gi)) {
    ids.add(`t${m[1]}`)
  }
  return Array.from(ids)
}

function aggregateStatus(tests: TaskEntry['tests']): TaskStatus {
  const hasFail = tests.some((t) => t.status === 'failed' || t.status === 'timedOut' || t.status === 'interrupted')
  if (hasFail) return 'fail'
  const hasPass = tests.some((t) => t.status === 'passed')
  if (hasPass) return 'pass'
  const hasSkip = tests.some((t) => t.status === 'skipped')
  if (hasSkip) return 'skip'
  return 'unknown'
}

function shortFile(fullPath: string): string {
  const idx = fullPath.indexOf('/tests/')
  return idx >= 0 ? fullPath.slice(idx + 1) : fullPath
}
