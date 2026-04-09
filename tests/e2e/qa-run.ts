import { chromium } from 'playwright'
import path from 'path'
import os from 'os'

const BASE = process.env.PLAYWRIGHT_BASE_URL || 'https://www.pulsepro.work'
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const USER_DATA = path.join(os.homedir(), 'Library/Application Support/Google/Chrome')

interface Result { name: string; status: 'PASS' | 'FAIL' | 'SKIP'; detail?: string }
const results: Result[] = []

function pass(name: string, detail?: string) { results.push({ name, status: 'PASS', detail }); console.log(`  ✅ ${name}`) }
function fail(name: string, detail?: string) { results.push({ name, status: 'FAIL', detail }); console.log(`  ❌ ${name} — ${detail}`) }
function skip(name: string, detail?: string) { results.push({ name, status: 'SKIP', detail }); console.log(`  ⏭️  ${name} — ${detail}`) }

async function run() {
  console.log('\n🔒 Pulse Pro QA — Full Checklist\n')
  console.log(`Target: ${BASE}`)
  console.log(`Using your Chrome profile for auth\n`)

  const context = await chromium.launchPersistentContext(USER_DATA, {
    headless: false,
    channel: 'chrome',
    args: ['--profile-directory=Default'],
    viewport: { width: 1280, height: 800 },
  })

  const page = await context.newPage()

  // ── Marketing / Public Pages ──────────────────────────────────────────
  console.log('📄 Marketing & Public Pages')
  for (const p of ['/', '/about', '/contact', '/privacy', '/terms', '/kb']) {
    try {
      const res = await page.goto(`${BASE}${p}`, { waitUntil: 'networkidle', timeout: 15000 })
      if (res && res.status() < 400) pass(`${p} loads`)
      else fail(`${p} loads`, `status ${res?.status()}`)
    } catch (e: any) { fail(`${p} loads`, e.message) }
  }

  // Check pricing on landing page
  try {
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 15000 })
    const body = await page.textContent('body')
    if (body?.includes('$12') && body?.includes('$29')) pass('Pricing shows $12 Pro / $29 Team')
    else fail('Pricing shows $12 Pro / $29 Team', 'Missing price values')
  } catch (e: any) { fail('Pricing check', e.message) }

  // ── Auth redirect ─────────────────────────────────────────────────────
  console.log('\n🔐 Auth')
  try {
    // Open an incognito page for unauthenticated test
    const incognitoContext = await chromium.launchPersistentContext('', { headless: true, channel: 'chrome' })
    const incognitoPage = await incognitoContext.newPage()
    await incognitoPage.goto(`${BASE}/dashboard`, { timeout: 10000 })
    await incognitoPage.waitForTimeout(3000)
    if (incognitoPage.url().includes('sign-in') || incognitoPage.url().includes('clerk')) {
      pass('Unauthenticated /dashboard → redirects to sign-in')
    } else {
      fail('Unauthenticated /dashboard → redirects to sign-in', `landed on ${incognitoPage.url()}`)
    }
    await incognitoContext.close()
  } catch (e: any) { fail('Auth redirect', e.message) }

  // ── Dashboard ─────────────────────────────────────────────────────────
  console.log('\n📊 Dashboard')
  try {
    await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle', timeout: 20000 })
    await page.waitForTimeout(3000)

    if (page.url().includes('/dashboard')) pass('Dashboard loads')
    else fail('Dashboard loads', `redirected to ${page.url()}`)

    const circles = await page.locator('svg circle').count()
    if (circles >= 3) pass(`Activity rings render (${circles} SVG circles)`)
    else fail('Activity rings render', `only ${circles} circles found`)

    const body = await page.textContent('body') || ''
    if (/project|upcoming|health/i.test(body)) pass('Dashboard sections visible')
    else fail('Dashboard sections visible', 'Missing key sections')
  } catch (e: any) { fail('Dashboard', e.message) }

  // ── Projects ──────────────────────────────────────────────────────────
  console.log('\n📁 Projects')
  try {
    const start = Date.now()
    await page.goto(`${BASE}/projects`, { waitUntil: 'networkidle', timeout: 15000 })
    const elapsed = Date.now() - start
    if (elapsed < 10000) pass(`Projects loads (${elapsed}ms)`)
    else fail('Projects loads', `took ${elapsed}ms`)

    await page.waitForTimeout(2000)
    const body = await page.textContent('body') || ''
    if (/healthy|at risk|critical|completed|no projects/i.test(body)) pass('Health labels visible')
    else fail('Health labels visible', 'No health indicators found')

    const projectLink = page.locator('a[href*="/projects/c"]').first()
    if (await projectLink.count() > 0) {
      await projectLink.click()
      await page.waitForTimeout(3000)
      const detailBody = await page.textContent('body') || ''
      if (/tasks|bookmarks|time|files|team/i.test(detailBody)) pass('Project detail tabs work')
      else fail('Project detail tabs', 'Missing tab names')
    } else skip('Project detail tabs', 'No projects to click')
  } catch (e: any) { fail('Projects', e.message) }

  // ── Tasks ─────────────────────────────────────────────────────────────
  console.log('\n✅ Tasks')
  try {
    await page.goto(`${BASE}/tasks`, { waitUntil: 'networkidle', timeout: 15000 })
    await page.waitForTimeout(2000)
    if (page.url().includes('/tasks')) pass('Tasks page loads')
    else fail('Tasks page loads', `at ${page.url()}`)
  } catch (e: any) { fail('Tasks page', e.message) }

  // Quick Add (N key)
  try {
    await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle', timeout: 15000 })
    await page.waitForTimeout(2000)
    await page.keyboard.press('n')
    await page.waitForTimeout(500)
    const quickAdd = page.locator('input[placeholder*="What needs to be done"]')
    if (await quickAdd.isVisible({ timeout: 3000 })) {
      pass('Quick Add (N key) opens')
      await page.keyboard.press('Escape')
    } else fail('Quick Add (N key)', 'Input not visible')
  } catch (e: any) { fail('Quick Add', e.message) }

  // Cmd+K
  try {
    await page.waitForTimeout(500)
    await page.keyboard.press('Meta+k')
    await page.waitForTimeout(500)
    const searchInput = page.locator('input[placeholder*="Search"]')
    if (await searchInput.isVisible({ timeout: 3000 })) {
      pass('Cmd+K command bar opens')
      await page.keyboard.press('Escape')
    } else fail('Cmd+K command bar', 'Search input not visible')
  } catch (e: any) { fail('Cmd+K', e.message) }

  // Task detail with comments
  try {
    await page.goto(`${BASE}/tasks`, { waitUntil: 'networkidle', timeout: 15000 })
    await page.waitForTimeout(2000)
    const taskLink = page.locator('a[href*="/tasks/c"]').first()
    if (await taskLink.count() > 0) {
      await taskLink.click()
      await page.waitForTimeout(3000)
      const body = await page.textContent('body') || ''
      if (/comment/i.test(body)) pass('Task detail has comment section')
      else fail('Task detail comments', 'No comment section found')
    } else skip('Task detail', 'No tasks to click')
  } catch (e: any) { fail('Task detail', e.message) }

  // ── Clients ───────────────────────────────────────────────────────────
  console.log('\n👥 Clients')
  try {
    await page.goto(`${BASE}/clients`, { waitUntil: 'networkidle', timeout: 15000 })
    await page.waitForTimeout(2000)
    if (page.url().includes('/clients')) pass('Clients page loads')
    else fail('Clients page loads', `at ${page.url()}`)
  } catch (e: any) { fail('Clients', e.message) }

  // ── Invoices ──────────────────────────────────────────────────────────
  console.log('\n💰 Invoices')
  try {
    await page.goto(`${BASE}/invoices`, { waitUntil: 'networkidle', timeout: 15000 })
    await page.waitForTimeout(2000)
    if (page.url().includes('/invoices')) pass('Invoices page loads')
    else fail('Invoices page loads', `at ${page.url()}`)
  } catch (e: any) { fail('Invoices', e.message) }

  // ── Calendar ──────────────────────────────────────────────────────────
  console.log('\n📅 Calendar')
  try {
    await page.goto(`${BASE}/calendar`, { waitUntil: 'networkidle', timeout: 15000 })
    await page.waitForTimeout(2000)
    const month = new Date().toLocaleString('default', { month: 'long' })
    const body = await page.textContent('body') || ''
    if (body.includes(month)) pass(`Calendar shows ${month}`)
    else fail('Calendar current month', `"${month}" not found`)
  } catch (e: any) { fail('Calendar', e.message) }

  // ── Bookmarks ─────────────────────────────────────────────────────────
  console.log('\n🔖 Bookmarks')
  try {
    await page.goto(`${BASE}/bookmarks`, { waitUntil: 'networkidle', timeout: 15000 })
    await page.waitForTimeout(2000)
    if (page.url().includes('/bookmarks')) pass('Bookmarks page loads')
    else fail('Bookmarks page loads', `at ${page.url()}`)
  } catch (e: any) { fail('Bookmarks', e.message) }

  // ── Settings & Billing ────────────────────────────────────────────────
  console.log('\n⚙️  Settings & Billing')
  try {
    await page.goto(`${BASE}/settings`, { waitUntil: 'networkidle', timeout: 15000 })
    await page.waitForTimeout(2000)
    const body = await page.textContent('body') || ''
    if (/free|pro|team|plan|billing/i.test(body)) pass('Settings shows plan info')
    else fail('Settings plan info', 'No plan information found')

    if (/telegram/i.test(body)) pass('Settings shows Telegram integration')
    else fail('Telegram integration', 'Not found on settings page')
  } catch (e: any) { fail('Settings', e.message) }

  // ── Sidebar Navigation ────────────────────────────────────────────────
  console.log('\n🧭 Sidebar Navigation')
  const routes = ['/dashboard', '/projects', '/tasks', '/clients', '/calendar', '/bookmarks', '/invoices', '/settings']
  for (const route of routes) {
    try {
      await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle', timeout: 15000 })
      await page.waitForTimeout(1500)
      if (page.url().includes(route) && !page.url().includes('sign-in')) pass(`${route} accessible`)
      else fail(`${route} accessible`, `redirected to ${page.url()}`)
    } catch (e: any) { fail(`${route}`, e.message) }
  }

  // ── Summary ───────────────────────────────────────────────────────────
  await context.close()

  const passed = results.filter(r => r.status === 'PASS').length
  const failed = results.filter(r => r.status === 'FAIL').length
  const skipped = results.filter(r => r.status === 'SKIP').length

  console.log('\n' + '═'.repeat(50))
  console.log(`\n📋 RESULTS: ${passed} passed, ${failed} failed, ${skipped} skipped out of ${results.length} tests\n`)

  if (failed > 0) {
    console.log('❌ FAILURES:')
    results.filter(r => r.status === 'FAIL').forEach(r => console.log(`   ${r.name}: ${r.detail}`))
  }

  if (failed === 0) console.log('🎉 All tests passed! Ready for soft launch.\n')
  else console.log('\n⚠️  Fix failures before launch.\n')

  process.exit(failed > 0 ? 1 : 0)
}

run().catch(e => { console.error('Fatal:', e); process.exit(1) })
