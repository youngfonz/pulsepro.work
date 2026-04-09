# Pulse Pro — Soft Launch QA Checklist

**Date:** April 4, 2026
**Goal:** Verify all features work before conference soft launch

---

### Auth & Onboarding
- [ ] Sign up with new email → onboarding overlay appears
- [ ] Sign in with Google → lands on dashboard
- [ ] Sign out → redirected to marketing page
- [ ] Visit `/dashboard` while logged out → redirected to sign-in

### Dashboard
- [ ] Activity rings render with correct data
- [ ] DnD grid sections can be reordered
- [ ] Overdue tasks section shows if any exist
- [ ] Upcoming section shows tasks due today
- [ ] Project health cards show correct status colors
- [ ] AI Insights panel loads (Pro feature)

### Projects
- [ ] Projects list loads quickly (no spinner hanging)
- [ ] Health labels (Healthy/At Risk/Critical) display correctly
- [ ] Create new project → appears in list
- [ ] Open project → tabs work (Tasks, Bookmarks, Time, Files, Team)
- [ ] Task list within project loads with correct counts

### Tasks
- [ ] Create task from project view
- [ ] Create task from `/tasks` page
- [ ] Toggle task complete/incomplete
- [ ] Add a comment → your name appears as author
- [ ] Delete your own comment → works
- [ ] Try deleting someone else's comment → blocked (unless you're manager+)
- [ ] Quick Add (press N key) → overlay works

### Clients
- [ ] Create client → appears in list
- [ ] Client detail shows linked projects

### Invoices
- [ ] Create invoice with line items
- [ ] Send invoice via email
- [ ] Open shared invoice link (logged out) → public view works

### Team Collaboration
- [ ] Add a collaborator to a project (Pro/Team plan)
- [ ] Collaborator can see the project
- [ ] Collaborator (editor) can add/edit tasks
- [ ] Collaborator (viewer) can only read
- [ ] Remove collaborator → they lose access

### Upgrade Prompts (test on Free plan)
- [ ] Hit 3 project limit → upgrade modal appears
- [ ] Hit 50 task limit → upgrade modal appears
- [ ] Hit 1 client limit → upgrade modal appears
- [ ] Try adding collaborator on Free → "Upgrade to Pro" message
- [ ] Click upgrade → redirected to Polar checkout
- [ ] After upgrade → limits removed, plan shows Pro in settings

### Settings & Billing
- [ ] Settings page loads with current plan info
- [ ] Usage bars show correct counts (projects/tasks/clients)
- [ ] "Manage Billing" link works for paid users
- [ ] Promo code input works (if applicable)

### Search & Navigation
- [ ] Cmd+K command bar → search returns results
- [ ] Global search finds projects, tasks, clients, bookmarks
- [ ] Sidebar navigation works for all routes
- [ ] Calendar page loads

### Marketing / Public Pages
- [ ] Landing page loads fast (server components)
- [ ] Pricing section shows correct plans
- [ ] `/about`, `/contact`, `/privacy`, `/terms` all load
- [ ] Knowledge base renders (public vs auth layout)
