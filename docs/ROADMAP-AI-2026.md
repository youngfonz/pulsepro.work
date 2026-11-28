# Pulse Pro: Review, Market Read, and AI Roadmap

*Prepared 2026-11-21 from a code review of `youngfonz/production-readiness` (444 commits, Apr to Aug 2026).*

## The short version

Pulse Pro is in better shape than "outdated" suggests. The stack is current (Next 16, React 19, AI SDK 6, Zod 4), there is a real REST API with hashed tokens, an Expo mobile app, Telegram and email capture, and a Slack slash command. What it lacks is a reason to open it. Every capture path (voice, Slack, Telegram, email) runs on hand-written regex, the only AI is a three-line dashboard insight on Haiku 4.5, and the data model is one person with collaborators bolted on, which is why it never fit BGC or Beyond Code Collective team work.

The strategic bet I recommend: **stop being an app you log into and become the system of record that Claude and Slack write into.** Anthropic and Slackbot are absorbing the chat interface and generic "AI assistant" layer, so a PM tool that competes there loses. What they will not build is the structured, money-adjacent record of client work: projects, hours, rates, invoices, client history, and what you promised whom. Own that, expose it everywhere through MCP and Slack, and Claude becomes a distribution channel instead of a threat.

## 1. Code review findings

### What is solid
- REST API v1 (`src/app/api/v1/*`) covers tasks, projects, invoices, time entries, search, insights, with SHA-256 token auth. This is 80% of an MCP server already.
- Security basics are done well: Slack HMAC verification with replay window and constant-time compare, crypto-random share tokens, ownership checks in actions.
- Invoicing, time tracking, and client records exist. That is the moat material most PM tools do not have.
- Mobile app, voice input, Telegram bot, email-to-task: the instinct to capture from anywhere was right early.

### What holds it back
1. **No workspace or assignee model.** Every row is keyed by `userId`; teams exist only as `ProjectAccess` rows. There is no `Task.assigneeId`, no organization entity, and `getOrgId()` in `src/lib/auth.ts` is unused plumbing. You cannot run a BGC program team on this. This is the single biggest blocker for Slack, team plans, and nonprofits.
2. **Integrations live on the `Subscription` table** (`slackTeamId`, `slackUserId`, Telegram fields). One Slack workspace per user, and billing and identity are tangled. Move to an `Integration` / `ConnectedAccount` table.
3. **Four separate command parsers.** `src/lib/voice.ts` (289 lines of regex), `src/lib/telegram-commands.ts`, the Slack route's `[Project] title` parser, and the email webhook all re-implement "turn text into a task." Each surface supports different things. Replace with one Claude-powered intent layer (regex kept as offline fallback).
4. **Business logic lives in server actions and route handlers**, so Slack, Telegram, REST, and the web each call Prisma differently (e.g. the Slack route reimplements task creation and the "reopen completed project" rule). Extract a `src/core/` service layer with Zod-typed operations; every surface, including MCP and the AI agent, calls the same functions.
5. **Missing table-stakes PM primitives:** assignees, subtasks/checklists, recurring tasks, an activity log, notifications, and task-to-task links. Bookmarks are stored as tasks with `url`/`bookmarkType`, which will get awkward.
6. **Stringly-typed statuses and priorities** (`status String // todo, in_progress, done`). Use Prisma enums before adding more states.
7. **AI is shallow and on an old model.** `src/lib/ai.ts` pins `claude-haiku-4-5-20251001`; the only use is 1 to 3 dashboard sentences. Current models are `claude-haiku-5-5` and `claude-sonnet-5-5`.
8. **Housekeeping:** Prisma 5.22 (two majors behind), CLAUDE.md says Next 15 but the app is on 16, duplicate `claude.md` + `CLAUDE.md` + `AGENTS.md`, `tsconfig.tsbuildinfo` and `check-db.js` in the repo root, Resend and Postmark both installed.

## 2. Market read (late 2026)

| Category | Players | What they do with AI | Gap Pulse Pro can own |
|---|---|---|---|
| Big work-OS | Notion, Asana, Monday, ClickUp | Agents that run multi-step workflows, AI status reports, AI Studio. Credit-metered, heavy setup. | Too much tool for 1 to 15 people. Your own marketing already says this. |
| Dev PM | Linear | Agent triage, auto-labels, sub-issues, strong Slack and MCP | Engineering-only vocabulary. No clients, hours, or invoices. |
| AI planners | Motion, Sunsama, Akiflow, Todoist | Auto-scheduling, daily planning, voice "ramble" capture | Personal only. No client, money, or team layer. |
| Freelancer business | Bonsai, HoneyBook, Moxie, Productive, Teamwork | Proposals, contracts, invoices, profitability | Weak task UX, little real AI, nothing conversational. |
| The platforms | Claude (connectors, MCP Apps, Claude in Slack), Slackbot agent | General assistant over all your tools, with citations | They need a structured system of record to act on. They are not one. |

**Reading the field:** the platforms are eating "chat with your work" and "write my status update." The survivors are tools that (a) own structured data the assistant needs, (b) are excellent MCP citizens, and (c) are opinionated about a specific kind of work. Height shutting down and Notion moving to credit-metered agents both point the same way: generic PM is commoditizing, vertical systems of record are not.

## 3. Personas

| Persona | Job to be done | What they would pay for |
|---|---|---|
| **Solo freelancer** (designer, dev, writer) | Juggle 3 to 8 clients, know what is due, bill accurately | Never forgetting a deliverable; invoices drafted from logged work |
| **Small agency** (2 to 15) | Who is on what, are we over budget, keep clients calm | Client status reports that write themselves; capacity view |
| **Nonprofit program team** (BGC, Beyond Code Collective) | Run programs, events, volunteers, grant deliverables without Notion overhead | Slack-native task capture, program templates, funder-report rollups, nonprofit pricing |
| **Fractional exec / consultant** | Several orgs at once, mostly in their Slacks | One personal layer across many client Slack workspaces |
| **The end client** (external) | "Where are we?" without a login | Magic-link portal, weekly digest, approve/comment by email |
| **You, Fonz** | Capture from Slack and Claude, see the week | Every item above. Dogfood on BGC first. |

The end client is the persona most tools ignore and the best growth loop: every client who sees a polished Pulse Pro update is a lead.

## 4. Improvement list, prioritized

Effort: S = days, M = 1 to 2 weeks, L = 3+ weeks (solo, with Claude Code).

### P0: Foundation (do first, everything else depends on it)
1. **Workspaces + assignees** (L). `Workspace`, `WorkspaceMember` with roles, `workspaceId` on Client/Project/Task, `Task.assigneeId`. Migrate each existing user into a personal workspace. Unlocks team plans, nonprofits, and Slack channels mapping to workspaces.
2. **Core service layer + tool registry** (M). One Zod-typed function per operation (`createTask`, `completeTask`, `logTime`, `listDueThisWeek`, `draftInvoice`...). The same registry feeds server actions, REST, Slack, Telegram, MCP, and the Claude agent. This is the piece that makes everything after it cheap.
3. **Claude intent layer** (S). Replace the four regex parsers with one `parseIntent(text, context)` call on Haiku 5.5 with structured output (title, project match from the user's real project list, assignee, due date, priority, recurrence). Keep regex as fallback when the API fails.
4. **Integration table + model bump** (S). Move Slack/Telegram identity off `Subscription`; bump to current Claude models; activity log table (needed for digests and "what changed").

### P1: Never log in (the headline feature)
5. **Slack app v2** (L). Today it is one slash command that can only add. Build:
   - DM the Pulse bot or @mention it in any channel in plain English: "add follow up with Kapor about the Q1 report, due Friday, assign Aisha."
   - Message shortcut **"Create task from message"**: Claude reads the thread, drafts the task with a link back to the Slack permalink.
   - **App Home** tab: today, overdue, this week, with Done/Snooze buttons.
   - Morning DM digest and end-of-day nudge (replace the single `REMINDER_USER_ID` cron).
   - Link unfurls for Pulse Pro URLs; channel-to-project mapping so `#bgc-summit` tasks land in the Summit project.
   - Ask questions: "what is Beyond Code waiting on?" answered by the agent over the tool registry.
6. **Remote MCP server with OAuth** (M). Expose the tool registry at `/api/mcp`. Then Pulse Pro works inside Claude.ai, Claude Desktop, Claude Code, Cowork, and Claude in Slack with zero UI work. Submit to the Claude connectors directory; add an MCP App widget (task list, invoice preview) later. This is the future-proofing move: when people do their work in Claude, Pulse Pro is the tool Claude calls.
7. **Agent in the app** (M). Replace the Cmd+K box with "ask or tell": Sonnet 5.5 with the tool registry, confirm-before-write for destructive or bulk changes. Same agent powers Slack, Telegram, and email.

### P2: AI that earns money for the user (selling points)
8. **Client status reports** (M). Every Friday, draft a per-client update from completed tasks, hours, and upcoming dates; you approve in Slack with one tap; it sends to the client via a share link. Agencies will pay for this alone.
9. **Client portal** (M). Magic-link page per client (you already have invoice share tokens): status, upcoming milestones, approve/comment, invoices. No client login.
10. **Time-to-invoice** (S). "Draft this month's invoice for Acme" builds line items from time entries and completed tasks; flags unbilled hours; drafts a polite payment reminder when overdue.
11. **Meeting and email capture** (M). Paste or forward meeting notes, or connect a notes source; Claude extracts action items, owners, dates, and proposes tasks for approval. Upgrade email-to-task to do the same on forwarded threads.
12. **Project kickoff from a brief** (S). Paste a proposal, SOW, or grant award; get a project with milestones, tasks, and dates.

### P3: Proactive and vertical
13. **Risk and scope watch** (M). Weekly check: hours vs budget, slipping dates, tasks reopened repeatedly, clients with nothing scheduled. Surfaces in the digest, not a dashboard you have to visit.
14. **Nonprofit pack** (M). Program and event templates, grant deliverable tracking with funder report rollup (pairs with your nonprofit tooling), volunteer assignees without paid seats, nonprofit pricing.
15. **Recurring tasks, subtasks, dependencies** (M). Table stakes, but ship them through the tool registry so Slack and Claude get them for free.
16. **Semantic search** (S to M). pgvector over tasks, comments, notes: "where did we land on the Salesforce migration?"
17. **Notion import** (S). One-time import of a Notion database into a project, to ease the BGC switch.

### Cut or deprioritize
- Building your own long-form chat UI as the main product (Claude does this better; meet users there via MCP).
- AI writing assistants inside descriptions (commodity).
- Telegram investment beyond keeping it alive on the shared intent layer.
- Bookmarks as a first-class pillar (fold into tasks/resources or keep it quiet).

## 5. How to use Claude well (implementation notes)
- **Haiku 5.5** for intent parsing, triage, digests (fast, cheap, high volume). **Sonnet 5.5** for the agent, status reports, kickoff plans. Prompt-cache the system prompt plus the user's project/client list.
- Structured outputs with Zod for every write. Confirm-before-write on anything bulk, destructive, or client-facing.
- Gate AI by plan: Free gets parsing; Pro gets the agent, digests, MCP; Team gets client reports and portal. Track per-workspace token spend in the activity log.
- Ship the MCP server on the same OAuth you would use for Slack so one connected account covers both.

## 6. Positioning and selling points
- **"Never log in."** Add, check, and close work from Slack, Claude, email, or your voice.
- **"Works inside Claude."** Listed in the Claude connectors directory; your PM tool is wherever your AI is.
- **"Your clients get a Friday update you did not have to write."**
- **"From hours to invoice in one sentence."**
- **"Built for 1 to 15 people, not 1,500."** (Your existing "Break up with your PM tool" campaign still fits; add "...and stop opening it.")
- Nonprofit angle: "Lighter than Notion, lives in your Slack," with a BGC case study once you have dogfooded it.

## 7. Suggested sequence
1. Weeks 1 to 3: P0 (workspaces, core layer, intent parser, integration table). Migrate BGC/Beyond Code into a workspace.
2. Weeks 4 to 6: Slack v2 and MCP server. Dogfood daily; this is the moment you should stop needing the web UI for capture.
3. Weeks 7 to 9: agent in app, client status reports, time-to-invoice.
4. Then: portal, meeting capture, nonprofit pack, connectors directory submission, launch campaign.

## Open questions for Fonz
1. Is BGC/Beyond Code a customer (shared workspace, many users) or just your personal use? That decides how far to take workspaces and roles in P0.
2. Do you want Pulse Pro to stay a paid SaaS for freelancers, or tilt toward nonprofits and small mission-driven teams as the primary market?
3. Keep Telegram and the mobile app, or freeze them and go all in on Slack + Claude?
4. Are you OK with AI cost on the free tier being parsing only?
