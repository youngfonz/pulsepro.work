import { MarketingNav } from '@/components/marketing/MarketingNav'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'
import { auth } from '@clerk/nextjs/server'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Knowledge Base — Pulse Pro',
  description: 'Learn how to use Pulse Pro. Guides for task management, project tracking, client organization, integrations, and more.',
}

function Section({ title, id, children }: { title: string; id: string; children: React.ReactNode }) {
  return (
    <details id={id} className="group border border-border rounded-xl overflow-hidden">
      <summary className="flex items-center justify-between px-5 py-4 cursor-pointer select-none hover:bg-muted/50 transition-colors">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        <svg
          className="w-4 h-4 text-muted-foreground transition-transform group-open:rotate-180"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      <div className="px-5 pb-5 text-sm text-muted-foreground space-y-4 border-t border-border pt-4">
        {children}
      </div>
    </details>
  )
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-block px-1.5 py-0.5 text-xs font-mono font-medium bg-muted border border-border rounded text-foreground">
      {children}
    </kbd>
  )
}

function Badge({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'pro' | 'team' }) {
  const styles = {
    default: 'bg-muted text-muted-foreground',
    pro: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    team: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300',
  }
  return (
    <span className={`inline-block text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${styles[variant]}`}>
      {children}
    </span>
  )
}

export default async function KnowledgeBasePage() {
  let isAuthenticated = false
  try {
    const session = await auth()
    isAuthenticated = !!session.userId
  } catch {
    // auth() may fail — default to unauthenticated
  }

  const sectionLinks = [
    ['#getting-started', 'Getting Started'],
    ['#quick-capture', 'Quick Capture'],
    ['#tasks', 'Tasks'],
    ['#projects', 'Projects'],
    ['#clients', 'Clients'],
    ['#bookmarks', 'Bookmarks'],
    ['#dashboard', 'Dashboard'],
    ['#search', 'Search'],
    ['#invoicing', 'Invoicing'],
    ['#collaboration', 'Collaboration'],
    ['#integrations', 'Integrations'],
    ['#billing', 'Billing & Plans'],
    ['#shortcuts', 'Shortcuts'],
  ]

  return (
    <div className={isAuthenticated ? '' : 'min-h-screen bg-background'}>
      {!isAuthenticated && <MarketingNav />}

      <div>
        <main id="main-content" className={isAuthenticated ? 'max-w-3xl mx-auto px-4 md:px-8 py-6' : 'max-w-4xl mx-auto px-4 md:px-8 py-20'}>
          <div className={isAuthenticated ? 'mb-8' : 'mb-12'}>
            <h1 className={`font-bold text-foreground ${isAuthenticated ? 'text-2xl mb-2' : 'text-3xl mb-3'}`}>Knowledge Base</h1>
            <p className={isAuthenticated ? 'text-sm text-muted-foreground' : 'text-muted-foreground'}>
              Everything you need to know about using Pulse Pro.{!isAuthenticated && ' Click any section to expand it.'}
            </p>
          </div>

          {/* Section nav pills */}
          <nav className={isAuthenticated ? 'mb-6 flex flex-wrap gap-2' : 'mb-10 flex flex-wrap gap-2'}>
            {sectionLinks.map(([href, label]) => (
              <a key={href} href={href} className="text-xs font-medium px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">{label}</a>
            ))}
          </nav>

          <div className="space-y-3">

          {/* 1. Getting Started */}
          <Section title="Getting Started" id="getting-started">
            <p className="text-foreground font-medium">Get up and running in under 2 minutes.</p>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">1. Create your account</h3>
              <p>
                Sign up with your email or Google account. You&apos;ll be redirected straight to your dashboard — no email verification step required.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">2. Quick onboarding</h3>
              <p>
                A 4-step overlay shows you the essentials: quick capture, organization, keyboard shortcuts, and you&apos;re ready to go. Click through it or dismiss it — it won&apos;t come back once you close it.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">3. Create your first client</h3>
              <p>
                Go to <strong>Clients</strong> in the sidebar and click <strong>New Client</strong>. Add their name, company, email, and phone — or just the name to start. You can also use voice input: click the mic icon and say something like &quot;John Smith from Acme Corp email john@acme.com&quot;.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">4. Create your first project</h3>
              <p>
                Go to <strong>Projects</strong> and click <strong>New Project</strong>. Every project belongs to a client. You can create a new client inline from the project form if you haven&apos;t added one yet. Set a priority, due date, and budget if applicable.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">5. Add tasks</h3>
              <p>
                The fastest way: press <Kbd>N</Kbd> anywhere to open quick-add. Type a title, pick a project (or leave it as a standalone quick task), and hit Enter. Done.
              </p>
            </div>
          </Section>

          {/* 2. Quick Capture */}
          <Section title="Quick Capture — 6 Ways to Add Tasks" id="quick-capture">
            <p className="text-foreground font-medium">Pulse Pro gives you 6 ways to capture tasks so nothing falls through the cracks.</p>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">1. Press N — Quick Add</h3>
              <p>
                Press <Kbd>N</Kbd> from any page to open the quick-add overlay. The title field is auto-focused — just start typing. Pick a project from the dropdown or leave it blank for a standalone task. Your last-used project is remembered automatically.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">2. Cmd+K — Command Bar</h3>
              <p>
                Press <Kbd>Cmd+K</Kbd> (or <Kbd>Ctrl+K</Kbd> on Windows) to open the command bar. Type <code>add task Design homepage</code> to create a task instantly. You can also type <code>add client John Smith</code> to create a client. The command bar also doubles as a search — type anything to find projects, tasks, clients, or bookmarks.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">3. Voice Input</h3>
              <p>
                Click the mic icon on any form (task, project, or client) and speak naturally. Pulse Pro understands phrases like &quot;Design homepage high priority due next Friday&quot; and extracts the title, priority, and date automatically. It also handles budget, email, phone, and company for projects and clients.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">4. Telegram Bot <Badge variant="pro">Pro</Badge></h3>
              <p>
                Link your Telegram account in Settings, then send <code>/add Buy new domain</code> to create a task. You can also target a project: <code>/add Acme Website: Buy new domain</code>. See <a href="#integrations" className="text-primary underline">Integrations</a> for all commands.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">5. Email-to-Task <Badge variant="pro">Pro</Badge></h3>
              <p>
                In Settings, generate your unique email address. Forward any email to it and a task is created from the subject line. Add <code>[Project Name]</code> to the subject to assign it to a specific project. The email body becomes the task description.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">6. Siri / API <Badge variant="pro">Pro</Badge></h3>
              <p>
                Generate an API token in Settings, then follow the step-by-step Apple Shortcuts guide to create a &quot;Add Pulse Task&quot; shortcut. Once set up, say &quot;Hey Siri, Add Pulse Task&quot; to create tasks hands-free from any Apple device. The guide walks through each tap &mdash; from creating the shortcut to connecting your voice input to the task title. Developers can also use <code>POST /api/v1/tasks</code> with a Bearer token from any automation tool.
              </p>
            </div>
          </Section>

          {/* 3. Tasks */}
          <Section title="Tasks" id="tasks">
            <p className="text-foreground font-medium">Tasks are the core unit of work in Pulse Pro.</p>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Creating tasks</h3>
              <p>
                Every task has a title (required) and optional fields: description, notes, priority (high/medium/low), start date, due date, and project. Tasks without a project are called &quot;quick tasks&quot; — they appear in your task list with a &quot;Quick task&quot; label.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Editing and completing</h3>
              <p>
                Click any task to open its detail view. Edit the title, description, notes, priority, dates, or project. Click the checkbox to mark it complete — it flips to &quot;done&quot; status. Click again to reopen it.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Attachments</h3>
              <p>
                You can attach images and files to any task. Images display inline in the task detail view. Files store metadata (name, type, size) and are downloadable. You can also add inline comments for notes and updates.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Filtering and sorting</h3>
              <p>
                Filter tasks by status (all, pending, completed), priority (high, medium, low), project, date, or search text. Sort by due date, newest, oldest, name, project, client, or priority — both ascending and descending.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Views</h3>
              <p>
                <strong>List view:</strong> Default view with all your filters and sorts.<br />
                <strong>Kanban board:</strong> Three columns — To Do, In Progress, Done. Drag tasks between columns to update their status.<br />
                <strong>Calendar:</strong> Monthly grid showing tasks by their start or due date.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Free plan limits</h3>
              <p>
                Free accounts can create up to 50 tasks. When you hit the limit, you&apos;ll see an upgrade prompt. Pro and Team plans have unlimited tasks.
              </p>
            </div>
          </Section>

          {/* 4. Projects */}
          <Section title="Projects" id="projects">
            <p className="text-foreground font-medium">Projects group tasks under a client with deadlines, budgets, and health tracking.</p>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Creating projects</h3>
              <p>
                Every project belongs to a client. When creating a project, select an existing client or create one inline (toggle &quot;New client&quot; in the form). Set the name, description, status, priority, due date, and budget. You can also use voice input — say something like &quot;Acme Website redesign high priority due March 15 budget 5000&quot;.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Status workflow</h3>
              <p>
                Projects have four statuses: <strong>Not Started</strong>, <strong>In Progress</strong>, <strong>On Hold</strong>, and <strong>Completed</strong>. Update the status as work progresses.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Health scores</h3>
              <p>
                Each project gets an automatic health score from 0 to 100. The score considers overdue tasks (-40 pts max), project staleness (-20 pts), deadline risk (-20 pts), and completion progress (+10 pts). Projects are labeled <strong>Healthy</strong> (70+), <strong>At Risk</strong> (40-69), or <strong>Critical</strong> (0-39).
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Time tracking</h3>
              <p>
                Add time entries to any project — log hours, a description, and the date. Time entries show up in the project detail view.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Filtering and sorting</h3>
              <p>
                Search by name or description. Filter by status, priority, or client. Sort by newest, oldest, name, client, due date, priority, or status.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Deleting projects</h3>
              <p>
                Deleting a project also deletes all its tasks, images, time entries, and collaborator access records. Standalone quick tasks (not assigned to any project) are never affected.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Free plan limits</h3>
              <p>
                Free accounts can create up to 3 projects. Pro and Team plans have unlimited projects.
              </p>
            </div>
          </Section>

          {/* 5. Clients */}
          <Section title="Clients" id="clients">
            <p className="text-foreground font-medium">Clients are the top-level organizer — every project belongs to a client.</p>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Managing clients</h3>
              <p>
                Create clients with a name, email, phone, company, logo (image upload), status (active/inactive), and notes. You can also create clients via voice input or from the <Kbd>Cmd+K</Kbd> command bar by typing <code>add client [name]</code>.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Client list</h3>
              <p>
                Search clients by name, email, or company. Filter by status (all, active, inactive). Sort by name, company, newest, oldest, or project count. The sidebar shows a badge with your total client count.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Deleting clients</h3>
              <p>
                Deleting a client cascades to all their projects, and all tasks under those projects. This is permanent — make sure you want to remove everything before confirming.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Free plan limits</h3>
              <p>
                Free accounts can create 1 client. Pro and Team plans have unlimited clients.
              </p>
            </div>
          </Section>

          {/* 6. Bookmarks */}
          <Section title="Bookmarks" id="bookmarks">
            <p className="text-foreground font-medium">Save links, videos, and references alongside your projects.</p>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Saving bookmarks</h3>
              <p>
                Bookmarks are a special type of task with a URL. Save any link and Pulse Pro categorizes it as YouTube, Twitter/X, or Website. Thumbnails are extracted automatically. You can add tags for organization and optionally assign a bookmark to a project.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Browsing bookmarks</h3>
              <p>
                Bookmarks have their own page in the sidebar. Filter by type, project, or search text. Sort by newest, oldest, title, or project. Bookmarks without a project show &quot;Quick task&quot; as their label.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Search</h3>
              <p>
                Bookmarks are included in the global <Kbd>Cmd+K</Kbd> search — search by title or URL to find any saved link.
              </p>
            </div>
          </Section>

          {/* 7. Dashboard */}
          <Section title="Dashboard" id="dashboard">
            <p className="text-foreground font-medium">Your command center — see everything at a glance.</p>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Stats overview</h3>
              <p>
                Six stat cards at the top: total clients, active clients, total projects, active projects, total tasks, and pending tasks. Below that, you&apos;ll see tasks due this week, projects due this week, and overdue items grouped by project.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Project health</h3>
              <p>
                The health section shows all active projects with their health score and color-coded status. Completed projects appear separately (up to 3 shown).
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Smart insights <Badge variant="pro">Pro</Badge></h3>
              <p>
                AI-powered insights surface what needs your attention: high-priority tasks due soon, stale projects (not updated in 10+ days), and other alerts. Color-coded red, amber, blue, and green. Insights are cached and refresh on demand.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Recent activity</h3>
              <p>
                See your most recently viewed projects, tasks, and bookmarks — the 8 most recent items sorted by last update.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Customization</h3>
              <p>
                Drag sections to reorder your dashboard layout. Hide sections you don&apos;t need. Your layout preferences are saved automatically and persist across sessions. Click &quot;Reset layout&quot; to go back to defaults.
              </p>
            </div>
          </Section>

          {/* 8. Search */}
          <Section title="Search" id="search">
            <p className="text-foreground font-medium">Find anything across your entire workspace instantly.</p>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Global search</h3>
              <p>
                Press <Kbd>Cmd+K</Kbd> and start typing. Pulse Pro searches across projects, tasks, clients, and bookmarks simultaneously. Results appear as you type (minimum 2 characters). Up to 5 results per category are shown, sorted by most recently updated.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Keyboard navigation</h3>
              <p>
                Use <Kbd>↑</Kbd> <Kbd>↓</Kbd> arrow keys to move between results. Press <Kbd>Enter</Kbd> to open the selected result. Press <Kbd>Esc</Kbd> to close the command bar.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Quick actions</h3>
              <p>
                When the search field is empty, the command bar shows quick actions: create a new task, project, or client, and navigation shortcuts to all main pages.
              </p>
            </div>
          </Section>

          {/* 9. Invoicing */}
          <Section title="Invoicing" id="invoicing">
            <p className="text-foreground font-medium">Create professional invoices and send them to clients in seconds.</p>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Creating invoices</h3>
              <p>
                Go to <strong>Invoices</strong> in the sidebar and click <strong>Create Invoice</strong>. Select a client (required) and optionally link a project. Set the due date, add line items with descriptions, quantities, and rates, and the totals calculate automatically. You can also set a tax rate percentage.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Importing time entries</h3>
              <p>
                If you select a project that has an hourly rate set, an &quot;Import Time Entries&quot; button appears. Click it to auto-populate line items from your tracked time entries — each entry becomes a line item with the hours as quantity and the project&apos;s hourly rate.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Business info</h3>
              <p>
                The &quot;From&quot; section lets you enter your business name, email, and address. This info is saved to your browser and auto-fills on future invoices so you only enter it once.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Invoice lifecycle</h3>
              <p>
                Invoices have four statuses: <strong>Draft</strong> (editable, not yet sent), <strong>Sent</strong> (emailed to client), <strong>Paid</strong> (marked as received), and <strong>Overdue</strong> (past due date). You can edit or delete draft invoices. Once sent, you can resend, mark as paid, or copy the share link.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Sending invoices</h3>
              <p>
                Click &quot;Send Invoice&quot; to email the invoice directly to your client. The email includes the invoice number, amount due, due date, and a &quot;View Invoice&quot; button that links to a professional, print-ready public page. The client does not need an account to view it.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Share link</h3>
              <p>
                Every invoice gets a unique shareable URL. Copy it with the &quot;Copy Share Link&quot; button and send it via any channel. The public page is clean, professional, and optimized for printing. Paid invoices show a &quot;PAID&quot; watermark.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Filtering and sorting</h3>
              <p>
                Filter invoices by status (draft, sent, paid, overdue) or client. Search by invoice number or client name. Sort by date, amount, or number.
              </p>
            </div>
          </Section>

          {/* 10. Collaboration */}
          <Section title="Collaboration" id="collaboration">
            <p className="text-foreground font-medium">Work on projects together with your team. <Badge variant="pro">Pro</Badge> <Badge variant="team">Team</Badge></p>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Who is this for?</h3>
              <p>
                Collaboration is for <strong>internal teams</strong> — people who work together and all have Pulse Pro accounts. For example, an agency owner sharing projects with their designers, copywriters, and project managers. This is not for sharing with external clients — clients receive invoice share links instead (see <a href="#invoicing" className="text-primary underline">Invoicing</a>).
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">How to add team members</h3>
              <p>
                Open any project and click the <strong>Team</strong> tab. Click <strong>Add team member</strong>, pick someone from the dropdown, choose their role, and click Add. The dropdown shows people in your organization — everyone must have a Pulse Pro account first.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Roles explained</h3>
              <p>
                <strong>Viewer</strong> — Can see the project, tasks, and Kanban board but cannot change anything. Good for people who need visibility without editing, like a junior team member reviewing work.<br />
                <strong>Editor</strong> — Can create tasks, mark them complete, add notes, and upload files. Cannot invite or remove people. Good for contractors or team members doing the work.<br />
                <strong>Manager</strong> — Everything an Editor can do, plus they can add and remove Viewers and Editors. Good for a project manager who runs the day-to-day.<br />
                <strong>Owner</strong> — The person who created the project. Full control — can do everything including deleting the project and managing Managers. Cannot be changed.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">What team members see</h3>
              <p>
                Shared projects show up in their project list, task list, calendar, dashboard, and search — just like their own projects. They can tell shared projects apart because they didn&apos;t create them.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Removing access</h3>
              <p>
                Owners and Managers can remove any team member by clicking the X next to their name in the Team tab. Access is revoked immediately — the project disappears from their workspace.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Collaborator limits</h3>
              <p>
                <strong>Free plan:</strong> No collaboration — upgrade to share projects.<br />
                <strong>Pro plan ($12/mo):</strong> Up to 3 team members per project.<br />
                <strong>Team plan ($29/mo):</strong> Up to 10 team members per project.
              </p>
            </div>
          </Section>

          {/* 10. Integrations */}
          <Section title="Integrations" id="integrations">
            <p className="text-foreground font-medium">Connect Pulse Pro to your existing tools. <Badge variant="pro">Pro</Badge></p>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Telegram Bot</h3>
              <p>
                Link your Telegram account in <strong>Settings &gt; Telegram</strong>. You&apos;ll get a verification code to send to the bot. Once linked, use these commands:
              </p>
              <ul className="list-none space-y-1 pl-0">
                <li><code>/tasks</code> — List all pending tasks</li>
                <li><code>/today</code> — Show tasks due today</li>
                <li><code>/overdue</code> — Show overdue tasks</li>
                <li><code>/bookmarks</code> — List saved bookmarks</li>
                <li><code>/done 3</code> — Mark task #3 as complete</li>
                <li><code>/add Buy domain</code> — Create a task</li>
                <li><code>/add Acme: Buy domain</code> — Create a task under a project</li>
                <li><code>/help</code> — Show all commands</li>
              </ul>
              <p>
                You can also enable daily reminders — the bot sends you overdue and due-today counts each morning.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Email-to-Task</h3>
              <p>
                In <strong>Settings &gt; Email</strong>, generate your unique email address. Forward any email to it and a task is created from the subject line. The email body (cleaned of HTML) becomes the task description (max 2,000 characters).
              </p>
              <p>
                To assign to a project, include <code>[Project Name]</code> in the subject — for example: <code>[Acme Website] Update contact page</code>.
              </p>
              <p>
                You can regenerate your email address at any time — the old address stops working immediately.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">REST API</h3>
              <p>
                In <strong>Settings &gt; API</strong>, generate a Bearer token. Use it to create and list tasks programmatically:
              </p>
              <ul className="list-none space-y-1 pl-0">
                <li><code>POST /api/v1/tasks</code> — Create a task (fields: title, project, priority, dueDate, description)</li>
                <li><code>GET /api/v1/tasks</code> — List tasks (params: status, limit)</li>
              </ul>
              <p>
                A curl example and Apple Shortcuts setup guide are provided in the settings card. You can revoke or regenerate your token at any time.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Daily Reminders</h3>
              <p>
                Pro users receive a daily email summary with overdue and due-today tasks, color-coded by priority. If you&apos;ve linked Telegram and enabled reminders, you&apos;ll also get a Telegram message each morning.
              </p>
            </div>
          </Section>

          {/* 11. Billing & Plans */}
          <Section title="Billing & Plans" id="billing">
            <p className="text-foreground font-medium">Simple pricing, no surprises.</p>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Free plan</h3>
              <p>
                3 projects, 50 tasks, 1 client. No collaborators, no integrations. Full access to task management, Kanban board, calendar, search, and dashboard.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Pro plan — $12/mo</h3>
              <p>
                Unlimited projects, tasks, and clients. Up to 3 collaborators per project. All integrations (Telegram, email-to-task, API, Siri). AI-powered insights. Daily email reminders. No per-seat fees.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Team plan — $29/mo</h3>
              <p>
                Everything in Pro, plus up to 10 collaborators per project. Flat rate — no per-seat pricing.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Upgrading</h3>
              <p>
                When you hit a free plan limit, you&apos;ll see an upgrade prompt that links directly to checkout. You can also upgrade from <strong>Settings &gt; Billing</strong>. Checkout is handled securely by Polar.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Managing your subscription</h3>
              <p>
                In <strong>Settings &gt; Billing</strong>, you&apos;ll see your current plan, usage bars (projects, tasks, clients), and period end date. Click &quot;Manage subscription&quot; to open the Polar billing portal where you can update payment methods or cancel.
              </p>
              <p>
                Usage bars turn amber when you hit 80% of any limit.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Cancellation</h3>
              <p>
                Cancel anytime from the Polar portal. Your Pro features remain active until the end of your billing period. After that, your plan reverts to Free and limits are re-enforced — but your existing data is never deleted. You can re-subscribe at any time to restore Pro features instantly.
              </p>
            </div>
          </Section>

          {/* 12. Keyboard Shortcuts */}
          <Section title="Keyboard Shortcuts" id="shortcuts">
            <p className="text-foreground font-medium">Navigate faster with keyboard shortcuts.</p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-4 font-semibold text-foreground">Shortcut</th>
                    <th className="text-left py-2 font-semibold text-foreground">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr><td className="py-2 pr-4"><Kbd>N</Kbd></td><td className="py-2">Open quick-add (create task)</td></tr>
                  <tr><td className="py-2 pr-4"><Kbd>Cmd+K</Kbd></td><td className="py-2">Open command bar (search + actions)</td></tr>
                  <tr><td className="py-2 pr-4"><Kbd>↑</Kbd> <Kbd>↓</Kbd></td><td className="py-2">Navigate search results</td></tr>
                  <tr><td className="py-2 pr-4"><Kbd>Enter</Kbd></td><td className="py-2">Select highlighted result or submit form</td></tr>
                  <tr><td className="py-2 pr-4"><Kbd>Esc</Kbd></td><td className="py-2">Close overlay, command bar, or dialog</td></tr>
                </tbody>
              </table>
            </div>
          </Section>

        </div>

        <div className={`mt-12 text-sm text-muted-foreground ${isAuthenticated ? '' : 'text-center'}`}>
          <p>
            Can&apos;t find what you&apos;re looking for? <a href="/contact" className="text-primary underline">Contact us</a> and we&apos;ll help.
          </p>
        </div>
      </main>
      </div>
      {!isAuthenticated && <MarketingFooter />}
    </div>
  )
}
