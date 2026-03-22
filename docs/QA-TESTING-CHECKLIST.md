# Pulse Pro QA/QC Testing Checklist

**Date created:** 2026-02-22
**Test against:** Production (pulsepro.work)
**Goal:** Physically verify every feature before official launch

---

## How to Use This Checklist

Test as three distinct personas in order:
1. **New User** — fresh sign-up, free plan, zero data
2. **Admin (Pro User)** — upgraded plan, real data, full feature access
3. **Super Admin** — admin panel, system-level checks

Mark each item: PASS / FAIL / SKIP (with reason)

---

## PERSONA 1: COMPLETE NEW USER (Free Plan)

### 1.1 Marketing Page (Logged Out)

- [ ] Visit pulsepro.work — marketing page loads, no errors
- [ ] Hero section: headline, subheadline, CTA buttons render correctly
- [ ] StatsImpact section: numbers/metrics display
- [ ] Features section: dashboard mock + static iPhone mock render side by side (desktop)
- [ ] Features section: static phone mock hidden on mobile viewport
- [ ] Features section: 6 feature cards render below mocks
- [ ] Mobile App section: "Your projects, wherever you are" heading renders
  - [ ] Rotating phone mock displays 4 screens (Dashboard, Tasks, Invoice, Project)
  - [ ] Screens rotate every 4 seconds (instant swap, no dark flash)
  - [ ] Dot indicators below phone mock are clickable
  - [ ] Bottom nav highlights active screen
  - [ ] 6 mobile feature items render to the right (desktop) or below (mobile)
- [ ] "Work smarter from anywhere" section: all 5 tabs work
  - [ ] AI Insights tab — mock displays correctly
  - [ ] Email to Task tab — email mock displays
  - [ ] Siri & Voice tab — Siri orb + shortcuts card displays
  - [ ] Keyboard tab — N key + Cmd+K mocks display
  - [ ] Telegram tab — bot conversation mock displays
  - [ ] Auto-cycling works (tabs rotate every 6 seconds, instant swap)
  - [ ] Manual tab switching works (no dark flash during transitions)
- [ ] Testimonials section renders
- [ ] Why Switch section: all competitor cards (Asana, Monday, Trello, ClickUp, Apple Notes)
- [ ] Pricing section: Free vs Pro comparison table
  - [ ] Free tier shows correct limits (3 projects, 50 tasks, 1 client)
  - [ ] Pro tier shows correct features (unlimited, integrations, AI)
  - [ ] CTA buttons work
- [ ] FAQ section: all questions expand/collapse
  - [ ] "Do I need to set up projects first?" FAQ exists
  - [ ] "Who is Pulse Pro for?" includes personal/solo use
- [ ] Final CTA section renders with button
- [ ] Navigation: all nav links work (Features, Pricing, FAQ anchors)
- [ ] Navigation: nav bar has solid background (no transparency), text always readable
- [ ] Navigation: nav bar stays above all section content when scrolling (z-index)
- [ ] Footer: all footer links work
- [ ] Footer: copyright year is dynamic (current year, not hardcoded)
- [ ] Mobile responsive: test on phone-sized viewport
  - [ ] Nav collapses properly
  - [ ] All sections stack correctly
  - [ ] Tab bar wraps on mobile

### 1.2 Legal & Info Pages

- [ ] /about — page loads
- [ ] /privacy — page loads
- [ ] /terms — page loads
- [ ] /contact — page loads

### 1.3 Sign Up Flow

- [ ] /sign-up — Clerk sign-up form renders (no horizontal scroll)
- [ ] Sign up with email — account created
- [ ] Sign up with Google OAuth — works
- [ ] After sign-up, redirected to /dashboard
- [ ] /sign-in — Clerk sign-in form renders (no horizontal scroll)

### 1.4 Onboarding (First-Time User)

- [ ] Onboarding overlay appears on first dashboard visit
- [ ] Step 1: "Add your first task" — N key visual displays
- [ ] Step 2: "Organize when ready" — projects explanation
- [ ] Step 3: "Shortcuts" — Cmd+K, N, Enter keys shown
- [ ] Step 4: "You're all set" — dashboard preview
- [ ] Next/Back buttons work through all steps
- [ ] Close button (X) dismisses overlay
- [ ] Overlay does NOT reappear after dismissal
- [ ] No AI gradient backgrounds (should be clean, professional)

### 1.5 Dashboard (Empty State)

- [ ] Dashboard loads with zero data
- [ ] Stats show 0/0 across the board
- [ ] No errors or broken UI with empty data
- [ ] "Good morning/afternoon/evening" greeting displays

### 1.6 Quick Task Creation (Zero Setup)

- [ ] Press N key — quick-add modal opens
- [ ] Type a task title, press Enter — task created (no project required)
- [ ] Task appears in /tasks page
- [ ] Press Cmd+K — command bar opens
- [ ] Type "add task Buy groceries" — creation preview shows
- [ ] Press Enter — task created
- [ ] Type "add task Fix bug high priority due tomorrow" — priority + date parsed
- [ ] Task created with correct priority and due date

### 1.7 Tasks Page (Free Plan)

- [ ] /tasks — page loads, shows created tasks
- [ ] Standalone tasks display with "Quick task" label (no project)
- [ ] Click a task — task detail page loads
- [ ] Edit task title — saves
- [ ] Edit task description — saves
- [ ] Edit task notes — saves
- [ ] Set priority (low/medium/high) — saves
- [ ] Set due date — saves
- [ ] Set start date — saves
- [ ] Mark task complete (checkbox) — toggles
- [ ] Mark task incomplete — toggles back
- [ ] Delete task — removed
- [ ] Add comment to task — saves
- [ ] Delete comment — removed
- [ ] Add image to task — uploads and displays
- [ ] Remove image — removed
- [ ] Add file to task — uploads and displays
- [ ] Remove file — removed
- [ ] Filter by status (pending/completed) — filters correctly
- [ ] Filter by priority (high/medium/low) — filters correctly
- [ ] Sort by due date — sorts correctly
- [ ] Sort by priority — sorts correctly
- [ ] Sort by newest/oldest — sorts correctly
- [ ] "Add Task" button opens dialog
- [ ] AddTaskDialog: create task with project = none — works
- [ ] Natural language in task title field — parses priority + date

### 1.8 Client Management (Free Plan)

- [ ] /clients — page loads (empty state)
- [ ] Create first client (name, email, phone, company)
- [ ] Client appears in list
- [ ] Click client — detail page loads with projects
- [ ] Edit client — saves
- [ ] Voice input on client form — mic icon visible
  - [ ] Click mic, speak client details — fields auto-populate
  - [ ] "email john@test.com" → email field fills
  - [ ] "company Acme" → company field fills
  - [ ] "phone 555-1234" → phone field fills
- [ ] Search clients — works
- [ ] Filter by status (active/inactive) — works
- [ ] Sort clients — all sort options work

### 1.9 Project Management (Free Plan)

- [ ] /projects — page loads (empty state)
- [ ] /projects/new — create project form loads
- [ ] Client dropdown shows created client
- [ ] "+ New client" option in dropdown — inline creation works
  - [ ] Type new client name, submit project — both client and project created
  - [ ] Cancel inline creation — returns to dropdown
- [ ] Voice input on project form — parses name, description, priority, date, budget
- [ ] Create project (name, description, status, priority, due date, budget)
- [ ] Project appears in list
- [ ] Click project — detail page loads
- [ ] Kanban board: todo / in_progress / done columns display
- [ ] Drag task between columns — status updates
- [ ] Add task to project from project detail page
- [ ] Project health score displays
- [ ] Add time entry (hours, description, date) — saves
- [ ] Delete time entry — removed
- [ ] Add project image — uploads
- [ ] Remove project image — removed
- [ ] Edit project details — saves
- [ ] Delete project — removed (confirm dialog)
- [ ] Filter projects by status — works
- [ ] Filter projects by priority — works
- [ ] Filter projects by client — works
- [ ] Sort projects — all options work
- [ ] Search projects — works

### 1.10 Bookmarks (Free Plan)

- [ ] /bookmarks — page loads (empty state)
- [ ] Create bookmark with URL — metadata extracted (thumbnail, title)
- [ ] YouTube URL — thumbnail and type detected
- [ ] Twitter/X URL — type detected
- [ ] Regular website URL — OG metadata extracted
- [ ] Add tags to bookmark — saves
- [ ] Filter bookmarks by project — works
- [ ] Filter by type (youtube/twitter/website) — works
- [ ] Search bookmarks — works
- [ ] Sort bookmarks — works

### 1.11 Calendar (Free Plan)

- [ ] /calendar — month view loads
- [ ] Tasks with due dates appear on correct dates
- [ ] Standalone tasks (no project) show as "Quick task"
- [ ] Navigate to next month — updates
- [ ] Navigate to previous month — updates
- [ ] Click a date — shows tasks due that day

### 1.12 Search & Navigation

- [ ] Cmd+K — command bar opens
- [ ] Search for a task by name — result appears
- [ ] Search for a project — result appears
- [ ] Search for a client — result appears
- [ ] Search for a bookmark — result appears
- [ ] Click result — navigates to correct page
- [ ] Arrow keys navigate results
- [ ] Enter opens selected result
- [ ] Esc closes command bar
- [ ] Quick actions section: Dashboard, Projects, Tasks, Calendar, Bookmarks, Clients, Settings
- [ ] Each quick action navigates correctly
- [ ] Placeholder text: 'Search or type "add task..." to create'

### 1.13 Free Plan Limits

- [ ] Create projects up to limit (3) — works
- [ ] Create 4th project — upgrade prompt appears
- [ ] Create tasks up to limit (50) — works
- [ ] Create 51st task — upgrade prompt appears
- [ ] Create clients up to limit (1) — works
- [ ] Create 2nd client — upgrade prompt appears
- [ ] Upgrade prompt has link to checkout

### 1.14 Settings (Free Plan)

- [ ] /settings — page loads
- [ ] Billing card: shows "Free" plan
- [ ] Telegram card: shows "Upgrade to Pro" button
- [ ] Email to Task card: shows "Upgrade to Pro" button
- [ ] Siri & Shortcuts card: shows "Upgrade to Pro" button
- [ ] Appearance: dark mode toggle works
- [ ] Appearance: light mode toggle works
- [ ] About: version and tech stack display

### 1.15 Dark Mode

- [ ] Toggle dark mode in settings
- [ ] Dashboard renders correctly in dark mode
- [ ] Tasks page renders correctly
- [ ] Project detail renders correctly
- [ ] Marketing page respects dark mode
- [ ] Marketing page: nav bar text readable in dark mode over all sections
- [ ] Marketing page: no dark flash during phone mock rotation or tab switching
- [ ] All text is readable, no contrast issues
- [ ] Toggle back to light mode — works

### 1.16 Mobile Responsiveness

- [ ] Dashboard: stats and sections stack on mobile
- [ ] Tasks page: table/list adapts to mobile
- [ ] Project detail: tabs and Kanban work on mobile
- [ ] Command bar: usable on mobile
- [ ] Quick-add (N key): works on mobile (if applicable)
- [ ] Settings: all cards stack properly
- [ ] Navigation: sidebar collapses or adapts

---

## PERSONA 2: ADMIN (Pro User)

### 2.1 Upgrade to Pro

- [ ] Click upgrade button/link — Polar checkout loads
- [ ] Complete checkout — subscription activated
- [ ] Redirected back to app
- [ ] Settings > Billing: shows "Pro" plan
- [ ] Settings > Billing: "Manage subscription" link to Polar portal works
- [ ] Free plan limits removed (can create unlimited projects/tasks/clients)

### 2.2 Telegram Bot Integration

- [ ] Settings > Telegram: "Link Telegram" button appears (not upgrade prompt)
- [ ] Click "Link Telegram" — verification code generated (LINK-XXXXXX format)
- [ ] Code displayed with copy button
- [ ] "Code expires in 10 minutes" message shown
- [ ] Open Telegram, find bot, send /start — welcome message received
- [ ] Send verification code — "Account linked!" confirmation
- [ ] Settings: green dot "Telegram linked" status shows
- [ ] Toggle daily reminders ON — saves
- [ ] Toggle daily reminders OFF — saves
- [ ] Telegram: send `tasks` — task list returned
- [ ] Telegram: send `today` — today's tasks returned
- [ ] Telegram: send `overdue` — overdue tasks returned
- [ ] Telegram: send `bookmarks` — bookmarks returned
- [ ] Telegram: send `add Buy milk` — standalone task created
- [ ] Telegram: send `add ProjectName: Fix logo` — task assigned to project
- [ ] Telegram: send `done 1` — task marked complete
- [ ] Telegram: send `help` — command list returned
- [ ] Unlink Telegram — confirms, status clears
- [ ] After unlinking, Telegram commands show "not linked" message

### 2.3 Email-to-Task Integration

- [ ] Settings > Email to Task: "Generate Email Address" button appears
- [ ] Click generate — email address displayed ({token}@in.pulsepro.work)
- [ ] Copy button works — address copied to clipboard
- [ ] "How it works" instructions display
- [ ] Forward a real email to the address — task created
  - [ ] Task title = email subject (stripped of Re:/Fwd: prefixes)
  - [ ] Task description = email body + sender info
- [ ] Send email with `[ProjectName]` in subject — task assigned to matching project
- [ ] Send email without project tag — standalone task created
- [ ] Regenerate address — new address generated
  - [ ] Old address stops working
  - [ ] New address works

### 2.4 Siri & Shortcuts API

- [ ] Settings > Siri & Shortcuts: "Generate API Token" button appears
- [ ] Click generate — token displayed (pp_... format)
- [ ] Token masked by default (pp_xxx***)
- [ ] Show/hide toggle works
- [ ] Copy button works
- [ ] Apple Shortcuts setup instructions display
- [ ] curl example displays
- [ ] Test POST endpoint:
  ```
  curl -X POST https://pulsepro.work/api/v1/tasks \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"title": "Test from API"}'
  ```
  - [ ] Returns 201 with task object
- [ ] Test with priority: `{"title": "Urgent", "priority": "high"}` — correct priority
- [ ] Test with due date: `{"title": "Soon", "dueDate": "2026-03-01"}` — correct date
- [ ] Test with project: `{"title": "Logo", "project": "ProjectName"}` — assigned correctly
- [ ] Test with description: `{"title": "Test", "description": "Details here"}` — saved
- [ ] Test GET endpoint:
  ```
  curl https://pulsepro.work/api/v1/tasks \
    -H "Authorization: Bearer YOUR_TOKEN"
  ```
  - [ ] Returns task list
- [ ] GET with status filter: `?status=todo` — filters correctly
- [ ] GET with limit: `?limit=5` — returns max 5
- [ ] Test invalid token — returns 401
- [ ] Test missing title — returns 400
- [ ] Test missing Authorization header — returns 401
- [ ] Regenerate token — old token stops working, new token works
- [ ] Revoke token — all API access disabled
- [ ] After revoke, "Generate API Token" button reappears

### 2.5 AI Insights (Pro)

- [ ] Dashboard: Smart Insights panel displays
- [ ] Insights are relevant to current data (overdue tasks, stale projects, etc.)
- [ ] "Generate" button triggers AI analysis (if available)
- [ ] Cached insights load quickly on subsequent visits
- [ ] Rule-based fallback works when AI unavailable

### 2.6 Project Collaboration (Pro)

- [ ] Open a project — Team tab visible
- [ ] Share project with another user (by user ID or email)
  - [ ] Set role: Viewer — shared user can view only
  - [ ] Set role: Editor — shared user can edit tasks
  - [ ] Set role: Manager — shared user can manage project
- [ ] Revoke access — user removed from project
- [ ] Collaborator limit: can add up to 3 (Pro plan)
- [ ] Adding 4th collaborator — shows limit message
- [ ] Shared user sees project in their project list
- [ ] Shared user permissions match their role

### 2.7 Dashboard (With Data)

- [ ] Stats: all counts accurate (clients, projects, tasks)
- [ ] Overdue tasks section: grouped by project, correct count
- [ ] Standalone overdue tasks display correctly (no project group)
- [ ] Tasks due this week: correct tasks shown
- [ ] Projects due this week: correct projects shown
- [ ] Recently viewed: shows last 8 accessed items
- [ ] Project health cards: scores match expectations
  - [ ] Healthy projects (>70 score) show green
  - [ ] At-risk projects (40-70) show yellow/amber
  - [ ] Critical projects (<40) show red
  - [ ] Completed projects labeled correctly
- [ ] Dashboard section drag-to-reorder works
- [ ] Reorder persists on refresh

### 2.8 Daily Reminder Email

- [ ] With Telegram reminders ON: receive Telegram summary
- [ ] Email reminder: overdue tasks listed with days-overdue count
- [ ] Email reminder: due-today tasks listed
- [ ] Email reminder: color-coded by priority (red=high, orange=medium, gray=low)
- [ ] Email reminder: links to tasks work
- [ ] Standalone tasks display as "Quick task" in email

### 2.9 Voice Input (All Forms)

- [ ] Task form: voice input parses title + priority + due date
  - [ ] "Review wireframes high priority due Friday" → all fields populated
- [ ] Client form: voice input parses name + email + phone + company
  - [ ] "John Smith email john@test.com company Acme phone 555-1234" → all fields populated
- [ ] Project form: voice input parses name + description + priority + date + budget
- [ ] Mic permission request appears on first use
- [ ] Permission denied: graceful fallback, no crash

### 2.10 Comprehensive Task Workflow

- [ ] Create task via N key (standalone)
- [ ] Create task via Cmd+K inline
- [ ] Create task via AddTaskDialog (with project)
- [ ] Create task via Telegram bot
- [ ] Create task via email forward
- [ ] Create task via API (curl/Siri)
- [ ] All 6 creation methods produce valid tasks
- [ ] All tasks visible in /tasks page
- [ ] All tasks searchable in Cmd+K
- [ ] Tasks with due dates appear in calendar

### 2.11 Bulk Operations & Edge Cases

- [ ] Create 100+ tasks — performance acceptable
- [ ] Create 20+ projects — list loads quickly
- [ ] Long task title (200+ chars) — truncates properly in lists
- [ ] Long description — displays with scroll/truncation
- [ ] Special characters in titles (quotes, brackets, emoji) — no errors
- [ ] HTML in task description — sanitized, no XSS
- [ ] Empty search query — shows quick actions, no error
- [ ] Search with special characters — no crash

---

## PERSONA 3: SUPER ADMIN

### 3.1 Admin Panel

- [ ] /admin — admin page loads (verify access control)
- [ ] /admin/users — user list displays
- [ ] User data visible: names, plans, status
- [ ] Non-admin users cannot access /admin pages (redirected or 403)

### 3.2 API Security

- [ ] /api/v1/tasks without auth header — returns 401
- [ ] /api/v1/tasks with invalid token — returns 401
- [ ] /api/webhook/email without valid token in address — returns 400/404
- [ ] /api/webhook/telegram without secret header — returns 401
- [ ] /api/cron/daily-reminder without CRON_SECRET — returns 401
- [ ] All authenticated routes reject unauthenticated requests
- [ ] All Pro-only features return 403 for free users via API

### 3.3 Middleware & Routing

- [ ] Public routes accessible without auth:
  - [ ] / (marketing)
  - [ ] /about, /privacy, /terms, /contact
  - [ ] /sign-in, /sign-up
  - [ ] /api/webhook/polar
  - [ ] /api/webhook/telegram
  - [ ] /api/webhook/email
  - [ ] /api/v1/* (uses own auth)
  - [ ] /api/cron/daily-reminder
  - [ ] /api/og
- [ ] Protected routes redirect to sign-in when not authenticated:
  - [ ] /dashboard
  - [ ] /tasks
  - [ ] /projects
  - [ ] /clients
  - [ ] /calendar
  - [ ] /bookmarks
  - [ ] /settings
  - [ ] /admin

### 3.4 Data Integrity

- [ ] Delete a client — cascades to projects
- [ ] Delete a project — cascades to tasks, images, time entries, access records
- [ ] Delete a task — cascades to images, files, comments
- [ ] Standalone tasks (no project) survive project deletion
- [ ] User data isolation: User A cannot see User B's data
- [ ] Shared project data: shared user sees only their shared projects

### 3.5 Subscription Enforcement

- [ ] Free user hits project limit — blocked with upgrade prompt
- [ ] Free user hits task limit — blocked with upgrade prompt
- [ ] Free user hits client limit — blocked with upgrade prompt
- [ ] Free user tries Telegram integration — shows upgrade
- [ ] Free user tries email-to-task — shows upgrade
- [ ] Free user tries API access — shows upgrade
- [ ] Pro user: all limits removed
- [ ] Subscription expiry: verify behavior when plan lapses

### 3.6 Performance

- [ ] Marketing page: loads under 3 seconds
- [ ] Dashboard: loads under 2 seconds (with data)
- [ ] Tasks page with 100+ tasks: loads under 3 seconds
- [ ] Search: results appear within 500ms
- [ ] Command bar: opens instantly
- [ ] Quick-add (N key): opens instantly
- [ ] Calendar: month renders under 1 second

### 3.7 SEO & Meta

- [ ] /sitemap.xml — accessible
- [ ] /robots.txt — accessible
- [ ] Marketing page: proper meta title and description
- [ ] OG image (/api/og) — generates correctly
- [ ] Social sharing preview works

### 3.8 Error Handling

- [ ] 404 page: visit /nonexistent — proper error page
- [ ] Invalid task ID: /tasks/invalid — handles gracefully
- [ ] Invalid project ID: /projects/invalid — handles gracefully
- [ ] Network error during form submit — user sees error, no data loss
- [ ] Server action failure — error message displayed, not a crash

### 3.9 Cross-Browser

- [ ] Chrome (desktop) — full test pass
- [ ] Safari (desktop) — full test pass
- [ ] Firefox (desktop) — full test pass
- [ ] Safari (iOS) — core flows work
- [ ] Chrome (Android) — core flows work

---

## PERSONA 4: MOBILE APP (iOS / Expo Go)

**Test device:** iPhone (Expo Go)
**Branch:** youngfonz/ios-capacitor
**Auth:** Clerk (email/password + Google OAuth)

### 4.1 App Launch & Splash Screen

- [ ] App opens in Expo Go without crash
- [ ] Splash screen displays Pulse Pro logo
- [ ] Splash screen text renders in black (not white) on light background
- [ ] App transitions from splash to auth or dashboard smoothly

### 4.2 Authentication

- [ ] Login screen renders — "Pulse Pro" title, subtitle, email/password fields
- [ ] Sign in with email + password — works, redirects to dashboard
- [ ] Sign in with Google OAuth — OAuth flow opens, redirects back via `pulsepro://` scheme
- [ ] Google OAuth error handling — cancel dismisses without error, real errors show message
- [ ] Sign up screen renders — navigable from login via "Don't have an account?" link
- [ ] Sign up with email — account created, redirected to dashboard
- [ ] Sign up with Google OAuth — works
- [ ] Error messages display correctly (wrong password, invalid email, etc.)
- [ ] Loading states show during auth (button text changes, ActivityIndicator)
- [ ] Sign out — works (from Settings or dashboard error state)

### 4.3 Bottom Tab Navigation

- [ ] 5 tabs visible: Dashboard, Projects, Tasks, Calendar, More
- [ ] Each tab icon renders correctly (LayoutDashboard, FolderKanban, CheckSquare, Calendar, MoreHorizontal)
- [ ] Active tab highlights with primary color
- [ ] Tab switching is instant with fade animation
- [ ] Tab labels display correctly (font size 11)

### 4.4 Dashboard

- [ ] Greeting displays correctly ("Good morning/afternoon/evening" based on time)
- [ ] Date displays correctly (e.g., "Friday, March 7")
- [ ] Special greetings work: "Happy Friday" (Fri afternoon), "New week, let's go" (Mon morning)
- [ ] User avatar shows initials in primary-colored circle
- [ ] Search button (magnifying glass) visible next to avatar
- [ ] Tapping avatar navigates to Settings (via More tab)
- [ ] Pull-to-refresh works — data reloads
- [ ] Loading state: ActivityIndicator + "Loading dashboard..." text
- [ ] Error state: title, message, "Pull down to retry" hint
- [ ] "Sign Out & Re-Login" button shows on auth errors

#### 4.4.1 Dashboard — Activity Rings

- [ ] Activity rings card renders with 3 concentric rings (Projects, Tasks, Clients)
- [ ] Rings have gradient colors (red, blue, green)
- [ ] Ring progress reflects actual data ratios
- [ ] Center shows pending task count with animated number
- [ ] Tapping center navigates to Tasks tab
- [ ] Legend row: Projects (active/total), Completed (done/total), Clients (active/total)
- [ ] Tapping legend items navigates to respective tabs

#### 4.4.2 Dashboard — Stats Cards

- [ ] 3 stat cards: Projects, Tasks, Clients
- [ ] Numbers animate up on load (AnimatedNumber)
- [ ] Each card shows active count + "X total" subtitle
- [ ] Tapping each card navigates to correct section

#### 4.4.3 Dashboard — Insights

- [ ] Insights card renders when data available
- [ ] Color-coded dots (red, amber, blue, green) display per insight
- [ ] Insight messages display correctly

#### 4.4.4 Dashboard — Overdue Tasks

- [ ] Overdue tasks section appears when overdue tasks exist
- [ ] Each row shows task title + project name (or "Quick task")
- [ ] Tapping a row navigates to TaskDetail

#### 4.4.5 Dashboard — Recently Viewed

- [ ] Recently viewed card shows up to 5 items
- [ ] Items show type icon (FolderKanban/CheckSquare/Users) in colored circle
- [ ] Name and subtitle display correctly
- [ ] Type label (project/task/client) shows on right
- [ ] Tapping navigates to correct detail screen

#### 4.4.6 Dashboard — Project Health

- [ ] Project health card renders with health badges
- [ ] Health labels: Healthy (green), At Risk (yellow), Critical (red), Done
- [ ] Project name and client name display
- [ ] Meta text: overdue count or completed/total ratio
- [ ] Tapping navigates to ProjectDetail

#### 4.4.7 Dashboard — Speed Dial FAB

- [ ] Floating action button visible on dashboard
- [ ] Tapping opens speed dial with 3 options
- [ ] "New Task" — opens CreateTask screen (modal, slide from bottom)
- [ ] "New Project" — opens CreateProject screen (modal)
- [ ] "New Client" — opens CreateClient screen (modal)
- [ ] Speed dial doesn't clip behind tab bar
- [ ] Backdrop darkens when speed dial is open

#### 4.4.8 Dashboard — Animated Entries

- [ ] Dashboard sections animate in with staggered delays
- [ ] Animations are smooth, no jank

### 4.5 Tasks List

- [ ] Tasks list loads with all tasks from API
- [ ] Header "+" button visible — navigates to CreateTask
- [ ] Empty state: "All clear" title + "No tasks yet. Tap + to create one."
- [ ] Pull-to-refresh works

#### 4.5.1 Tasks — Filter Chips

- [ ] Status filter chips: All, Active, Done
- [ ] Tapping "Active" shows only non-done tasks
- [ ] Tapping "Done" shows only completed tasks
- [ ] Priority filter chips: Any, High (red dot), Medium (orange dot), Low (green dot)
- [ ] Priority filter correctly filters tasks
- [ ] Sort chips: Newest, Due Date, Priority
- [ ] "Newest" sorts by creation date descending
- [ ] "Due Date" sorts by due date ascending (no-date tasks at bottom)
- [ ] "Priority" sorts high > medium > low
- [ ] Dividers separate filter groups visually
- [ ] Filter chips scroll horizontally if they overflow
- [ ] Haptic feedback (selection) on filter/sort changes
- [ ] "No matches" empty state when filters return 0 results

#### 4.5.2 Tasks — Task Row

- [ ] Each row shows: checkbox, title, project name (or "Quick task"), priority dot
- [ ] Due date displays when set
- [ ] Overdue dates render in red
- [ ] Completed tasks show checkmark icon + strikethrough title
- [ ] Tapping checkbox toggles task status with haptic feedback + bounce animation
- [ ] Tapping row navigates to TaskDetail

#### 4.5.3 Tasks — Swipe to Complete

- [ ] Swipe right reveals green "Done" action
- [ ] Swiping a completed task shows "Reopen"
- [ ] Completing swipe toggles the task
- [ ] Swipe action has fade-in opacity animation

### 4.6 Task Detail

- [ ] Task detail loads with spinner, then shows full task
- [ ] "Task not found" message for invalid IDs
- [ ] Pull-to-refresh works
- [ ] Recently viewed tracking: task appears in dashboard "Recently Viewed"

#### 4.6.1 Task Detail — Toggle Completion

- [ ] "Mark Complete" button (green border, green text)
- [ ] Tapping toggles to done with haptic feedback
- [ ] Button changes to "Mark Incomplete" (muted style) when done
- [ ] Title gets strikethrough when completed

#### 4.6.2 Task Detail — Edit Mode

- [ ] "Edit" button in header
- [ ] Tapping "Edit" shows editable title input + description input
- [ ] Header changes to "Cancel" + "Save" buttons
- [ ] "Save" persists changes via API
- [ ] "Cancel" reverts without saving
- [ ] Empty title shows validation alert
- [ ] "Saving..." text during mutation

#### 4.6.3 Task Detail — Status & Priority

- [ ] Status chips: To Do, In Progress, Done
- [ ] Active status chip is filled with status color
- [ ] Tapping changes status with haptic feedback
- [ ] Priority chips: Low, Medium, High
- [ ] Active priority chip is filled with priority color
- [ ] Tapping changes priority with haptic feedback

#### 4.6.4 Task Detail — Due Date

- [ ] Due date displays when set
- [ ] "Tap to set a due date" placeholder when not set
- [ ] Tapping opens inline YYYY-MM-DD text input
- [ ] "Set" button saves the date
- [ ] "Clear" button removes the due date
- [ ] Invalid format shows alert

#### 4.6.5 Task Detail — Description & Notes

- [ ] Description section shows text or "No description" placeholder
- [ ] In edit mode: multiline description input
- [ ] Notes section shows when notes exist

#### 4.6.6 Task Detail — Comments

- [ ] Comment count shows in section title
- [ ] Existing comments render with text + date
- [ ] "Add a comment..." input at bottom
- [ ] "Post" button sends comment
- [ ] Button disabled when input empty or submitting
- [ ] New comment appears after posting
- [ ] Keyboard avoiding works on iOS

#### 4.6.7 Task Detail — Delete

- [ ] "Delete Task" button at bottom (red border, destructive style)
- [ ] Confirmation alert with Cancel/Delete options
- [ ] Delete removes task and navigates back
- [ ] "Deleting..." text during mutation

### 4.7 Create Task

- [ ] Modal slides up from bottom with "New Task" title
- [ ] Close (X) button in header dismisses modal
- [ ] Title field required
- [ ] Task creates successfully and navigates back
- [ ] New task appears in tasks list after creation

### 4.8 Projects List

- [ ] Projects list loads from API
- [ ] Project rows display name, client, status badge
- [ ] Tapping a project navigates to ProjectDetail
- [ ] Create project button available
- [ ] Pull-to-refresh works
- [ ] Empty state message when no projects

### 4.9 Project Detail

- [ ] Project detail loads with name, client name, status badge, priority badge
- [ ] Pull-to-refresh works
- [ ] Recently viewed tracking: project appears in dashboard
- [ ] "Project not found" for invalid IDs

#### 4.9.1 Project Detail — Tab Bar

- [ ] 4 tabs: Overview, Tasks (count), Time, Budget
- [ ] Active tab has primary color underline
- [ ] Tab switching works

#### 4.9.2 Project Detail — Overview Tab

- [ ] Due date displays when set
- [ ] Description section with title and text
- [ ] Stats row: Tasks Done (completed/total), Tracked (hours), Budget ($)
- [ ] Stats render in bordered cards

#### 4.9.3 Project Detail — Tasks Tab

- [ ] Full task list with status dot, title, due date, priority dot
- [ ] Completed tasks show strikethrough
- [ ] Tapping a task navigates to TaskDetail (cross-tab navigation to TasksTab)
- [ ] "No tasks for this project yet." empty state

#### 4.9.4 Project Detail — Time Tab

- [ ] Time summary bar: clock icon, total hours, earnings (if hourly rate set)
- [ ] Time entry rows: hours, description, date
- [ ] "No time entries yet." empty state

#### 4.9.5 Project Detail — Budget Tab

- [ ] Budget card: Budget amount (or "Not set"), Hourly Rate (or "Not set")
- [ ] When hourly rate + hours exist: Time Billed, Earned, Remaining
- [ ] Remaining shows green when positive, red when over budget

### 4.10 Create Project

- [ ] Modal with "New Project" title and close button
- [ ] Project creates successfully and navigates back

### 4.11 Calendar

- [ ] Calendar screen loads
- [ ] Tasks with due dates appear on correct dates
- [ ] Navigation between months works

### 4.12 More Menu

- [ ] 4 menu items: Clients, Invoices, Bookmarks, Settings
- [ ] Each item has correct icon (Users, FileText, Bookmark, Settings)
- [ ] Tapping each navigates to correct screen
- [ ] Back navigation works from all sub-screens

### 4.13 Clients

- [ ] Clients list loads from API
- [ ] Client rows display name and details
- [ ] Tapping navigates to ClientDetail
- [ ] ClientDetail shows client info + related projects
- [ ] Pull-to-refresh works
- [ ] Empty state when no clients

### 4.14 Create Client

- [ ] Modal with "New Client" title and close button
- [ ] Client creates successfully and navigates back

### 4.15 Invoices List

- [ ] Invoices list loads from API
- [ ] Header "+" button visible — navigates to CreateInvoice
- [ ] Each row shows: invoice number, status badge, client name, due date, total
- [ ] Status badge color-coded (draft/sent/paid/overdue)
- [ ] Tapping navigates to InvoiceDetail
- [ ] Pull-to-refresh works
- [ ] "No invoices yet. Tap + to create one." empty state

### 4.16 Invoice Detail

- [ ] Invoice number (large, bold)
- [ ] Status badge with correct color
- [ ] Client name and optional project name
- [ ] Due date displayed
- [ ] From section: name and email when set
- [ ] Line items: description, quantity x rate, amount
- [ ] Totals: subtotal, tax (if > 0), grand total
- [ ] Notes section when present
- [ ] "Paid on [date]" shown for paid invoices

#### 4.16.1 Invoice Detail — Actions

- [ ] "Send Invoice" button visible for draft invoices
- [ ] Tapping shows confirmation alert with invoice number + client name
- [ ] Sending shows ActivityIndicator, success triggers haptic
- [ ] "Mark as Paid" button visible for sent/overdue invoices
- [ ] Tapping shows confirmation alert
- [ ] Marking paid shows ActivityIndicator, success triggers haptic
- [ ] No action buttons for already-paid invoices
- [ ] Error alerts on failure

### 4.17 Create Invoice

- [ ] Modal with "New Invoice" title and close button
- [ ] KeyboardAvoidingView works on iOS

#### 4.17.1 Create Invoice — Client Selection

- [ ] Client chips render for all clients
- [ ] Tapping selects client (highlighted with primary color)
- [ ] Selecting client resets project selection

#### 4.17.2 Create Invoice — Project Selection

- [ ] Project chips appear after client selected (filtered by client)
- [ ] "None" option available
- [ ] Only shows if filtered projects exist

#### 4.17.3 Create Invoice — Due Date

- [ ] Defaults to 30 days from today
- [ ] Tapping opens DateTimePicker
- [ ] Selected date displays correctly

#### 4.17.4 Create Invoice — From Info

- [ ] From Name and From Email fields side by side
- [ ] Email field has email keyboard type

#### 4.17.5 Create Invoice — Line Items

- [ ] Starts with 1 line item
- [ ] "+" button adds new line items with haptic
- [ ] Each item: description, quantity, rate fields
- [ ] Trash icon removes line items (min 1 required)
- [ ] Quantity and rate have decimal-pad keyboard

#### 4.17.6 Create Invoice — Totals

- [ ] Live subtotal calculates as items change
- [ ] Tax rate field (%) with decimal-pad keyboard
- [ ] Tax amount shows when tax > 0
- [ ] Grand total updates in real-time

#### 4.17.7 Create Invoice — Validation & Submit

- [ ] Missing client — alert "Missing Client"
- [ ] No valid line items — alert "Missing Items"
- [ ] Notes field (optional, multiline)
- [ ] "Create Invoice" button submits
- [ ] "Creating..." text during mutation
- [ ] Button disabled during submission
- [ ] Success: haptic feedback + navigate back
- [ ] Error: alert with message

### 4.18 Search

- [ ] Search screen accessible from dashboard search button
- [ ] Search bar renders with placeholder "Search projects, tasks, clients..."
- [ ] Initial state: "Search Pulse Pro" title + instruction text
- [ ] Typing < 2 chars shows instruction (minimum 2 characters)
- [ ] Typing 2+ chars triggers search with loading indicator
- [ ] Results grouped by type with color-coded icons:
  - [ ] Projects — FolderKanban (primary blue)
  - [ ] Tasks — CheckSquare (green)
  - [ ] Clients — Users (orange/warning)
  - [ ] Bookmarks — Bookmark (purple)
- [ ] Each result shows title, subtitle, status/priority dot
- [ ] Tapping result navigates to correct detail screen
- [ ] "No results" message when nothing matches
- [ ] Keyboard stays open while scrolling results (`keyboardShouldPersistTaps`)
- [ ] Back button returns to dashboard

### 4.19 Bookmarks

- [ ] Bookmarks screen loads from More menu
- [ ] Bookmark list renders from API
- [ ] Pull-to-refresh works

### 4.20 Settings

- [ ] Settings screen accessible from More menu
- [ ] Sign out functionality works
- [ ] Settings content loads

### 4.21 Navigation & UX Polish

- [ ] All detail screens: slide-from-right animation
- [ ] All modal screens: slide-from-bottom animation
- [ ] Detail screens: fade-from-bottom animation
- [ ] Back buttons (ChevronLeft) work on all detail screens
- [ ] Close buttons (X) work on all modal screens
- [ ] Cross-tab navigation works (e.g., project tasks → TasksTab → TaskDetail)
- [ ] Deep linking between tabs maintains correct stack
- [ ] Tab bar visible on all main screens
- [ ] Tab bar hidden appropriately on modals
- [ ] No horizontal scroll issues on any screen
- [ ] Safe area insets respected (notch, home indicator)

### 4.22 Haptic Feedback

- [ ] Task toggle (checkbox tap): Medium impact
- [ ] Task swipe-to-complete: triggers on swipe
- [ ] Filter/sort chip selection: Selection haptic
- [ ] Invoice send success: Notification success
- [ ] Invoice mark paid success: Notification success
- [ ] Create invoice add/remove line item: Light impact
- [ ] Task detail status/priority change: Light impact
- [ ] Task detail mark complete: Notification success

### 4.23 Pull-to-Refresh

- [ ] Dashboard: refresh control with primary tint color
- [ ] Tasks list: refresh control
- [ ] Projects list: refresh control
- [ ] Project detail: refresh control
- [ ] Task detail: refresh control
- [ ] Invoices list: refresh control
- [ ] Invoice detail: refresh control
- [ ] Clients list: refresh control

### 4.24 Mobile Performance

- [ ] Dashboard loads under 2 seconds
- [ ] Task list with 50+ tasks scrolls smoothly (FlatList virtualization)
- [ ] Tab switching is instant
- [ ] Animations don't cause frame drops
- [ ] No memory warnings during extended use
- [ ] App resumes correctly after backgrounding

### 4.25 Mobile Edge Cases

- [ ] Empty data: all screens handle zero data gracefully
- [ ] Network error: dashboard shows error state with retry
- [ ] Long task titles: truncated with ellipsis (numberOfLines={1})
- [ ] Long project/client names: truncated properly
- [ ] Rotate to landscape: no layout breaks (if supported)
- [ ] Keyboard dismissal: tapping outside inputs dismisses keyboard
- [ ] Back gesture (iOS swipe from left edge): works on all screens

---

## SIGN-OFF

| Persona | Tester | Date | Status |
|---------|--------|------|--------|
| New User (Free) | | | |
| Admin (Pro) | | | |
| Super Admin | | | |
| Mobile App (iOS) | | | |

**Notes:**


**Final Approval:**

- [ ] All PASS — approved for production launch
- [ ] Known issues documented with severity and timeline
