# Pulse Pro — External QA Testing Guide

---

## About This Test

Pulse Pro is a project management web app for freelancers and small agencies. It lets users create tasks, organize them into projects, track clients, log time, send invoices, and connect tools like Telegram and email. Your job is to test the full app from a fresh user's perspective — signing up for the first time, trying every feature, and reporting anything that looks wrong, broken, or confusing.

You will be testing across three plan tiers: **Free**, **Pro ($12/month)**, and **Team ($29/month)**. Each tier has different features and limits. You will start on the Free plan and message Fonz when you're ready to be upgraded.

**Estimated total time:** ~2 hours

**App URL:** pulsepro.work

**Fonz's contact:** info@pulsepro.work — message him when you're ready for a plan upgrade, or if something is completely broken and you cannot continue.

---

## What You Need

- **Chrome browser** (latest version)
- **2 email addresses** — one as your main test account, one as a secondary account for collaboration testing
- **Telegram app** on your phone (for Phase 2 integration testing)
- **A document or notepad** to write down bugs as you find them

---

## How to Report Bugs

Use this exact template for every bug you find. Copy it and fill it in.

```
Page URL: (copy from your browser's address bar)
Steps: (numbered list — exactly what you clicked, step by step)
Expected: (what you thought would happen)
Actual: (what actually happened instead)
Screenshot: (take one if you can — paste it in)
Severity: Blocker / Major / Minor / Cosmetic
```

**Severity guide:**
- **Blocker** — the app crashes, you cannot continue, data was lost
- **Major** — a feature does not work at all
- **Minor** — a feature works but behaves unexpectedly
- **Cosmetic** — something looks off (wrong color, text overlap, alignment issue)

---

## Phase 1: Free Plan (~45 minutes)

### 1.1 Marketing Page

1. Open Chrome and go to **pulsepro.work**
2. You should land on a public marketing page — you should NOT be redirected or asked to log in
3. Look at the top of the page. You should see **Pulse Pro** in the top left corner and navigation links in the top right
   - Expected: nav bar has a solid background, text is clearly readable
4. Scroll slowly down the page and check that these sections all appear and look complete:
   - **Hero section** — a headline, a subheadline, and at least one button (like "Get Started")
   - **Stats section** — numbers or metrics (look for things like "400%", "8 hrs", "0 missed deadlines")
   - **Features section** — a dashboard screenshot or mock on the left, a phone mock on the right, and 6 feature cards below them
   - **Mobile App section** — heading says "Your projects, wherever you are"; rotating phone mock showing 4 screens (Dashboard, Tasks, Invoice, Project); dot indicators below the phone that you can click
   - **"Work smarter from anywhere" section** — 5 clickable tabs: AI Insights, Email to Task, Siri & Voice, Keyboard, Telegram. Click each tab and verify its content changes. Wait 6 seconds without clicking — verify the tabs cycle automatically
   - **Testimonials section** — customer quotes
   - **Why Switch section** — cards for Asana, Monday, Trello, ClickUp, Apple Notes
   - **Pricing section** — Free vs Pro comparison table. Verify Free shows: 3 projects, 50 tasks, 1 client. Verify Pro shows: unlimited, integrations, AI
   - **FAQ section** — list of questions. Click each one — verify they expand to show an answer, and click again to collapse
   - **Final CTA section** — a button at the bottom of the page
5. Click the nav links at the top of the page (**Features**, **Pricing**, **FAQ**) — each one should scroll you to that section on the same page
6. Scroll all the way to the bottom. Check the **Footer** — look for links (Privacy, Terms, Contact, etc.) and click a few to verify they open
7. Look at the footer copyright — the year shown should be the current year (2026), not a past year
8. Now test the **mobile view**: right-click anywhere on the page, choose **Inspect**, then click the phone/tablet icon at the top of the developer panel. Set the width to 390 (iPhone size). Check:
   - The nav bar collapses or adapts (a menu icon should appear)
   - All sections stack vertically and text is readable
   - The phone mock in the Features section may be hidden on mobile — that is intentional
   - Close the dev panel when done

---

### 1.2 Sign Up

1. On the marketing page, click **Get Started** in the top-right navigation (or in the hero section)
2. You should be taken to a sign-up page at `/sign-up`
3. The sign-up form should appear centered on the page with no horizontal scrollbar
4. Enter your **primary test email address** and create a password
5. Complete any verification step Clerk requires (email verification code, etc.)
6. After completing sign-up, you should be automatically redirected to **/dashboard**
   - Expected: you land on the dashboard, NOT back on the marketing page or a login page
7. *(Optional — do this in a separate incognito window if possible)* Go back to pulsepro.work, click **Sign In**, and try signing in with **Google OAuth** using the same or a different Google account
   - Expected: redirects to dashboard after Google sign-in

---

### 1.3 Onboarding Overlay

After signing up for the first time and landing on the dashboard, you should see a popup overlay (a card in the center of the screen with a dimmed background).

1. The overlay should appear automatically — you should NOT have to click anything to trigger it
2. Verify **Step 1** shows:
   - Title: "Add your first task"
   - A visual showing a text input with a blinking cursor
   - A **Continue** button (bottom right)
   - A small **X** close button (top right corner of the card)
3. Click **Continue**
4. Verify **Step 2** shows:
   - Title: "Organize when you're ready"
   - A visual showing tasks organized under project groups
5. Click **Continue**
6. Verify **Step 3** shows:
   - Title: "Shortcuts that save time"
   - A visual showing keyboard shortcuts: N key, Cmd+K, Enter
7. Click **Continue**
8. Verify **Step 4** shows:
   - Title: "You're all set"
   - A mini dashboard preview visual
   - The button now says **Get started** instead of Continue
9. Click **Get started** — the overlay should close and you should see your dashboard
10. Refresh the page — the overlay should NOT appear again
11. *(Optional)* Go back through the overlay again: reload in a fresh incognito window with the same account to verify. If it only stores in localStorage, a new incognito session will show it again — that is acceptable.

---

### 1.4 Dashboard (Empty State)

1. You should now be on the **Dashboard** at `/dashboard`
2. At the top, you should see a greeting like "Good morning, [your name]" or "Good afternoon, [your name]" depending on the time of day
3. All stats should show 0 or empty — no errors, no broken UI
   - Look for cards or rings showing task counts, project counts, client counts — all should be zero or display an empty state gracefully
4. There should be no red error messages or blank white boxes
5. Look for a **section for Overdue Tasks** — it should either be empty or show "No overdue tasks"
6. Look for a **Project Health** section — it should be empty or show a placeholder

---

### 1.5 Create Your First Task (N key quick-add)

The fastest way to add a task is pressing the **N key** on your keyboard from anywhere in the app.

1. Make sure you are on the dashboard (or any app page — NOT on a form where you're typing)
2. Press the **N key** on your keyboard
3. A small popup modal should appear near the top of the screen — this is the quick-add bar
4. Type a task title, for example: `Buy groceries`
5. Press **Enter**
6. Expected: the modal closes and the task is created. You should see a brief success confirmation or the modal disappears cleanly
7. Navigate to **/tasks** using the sidebar on the left
8. Your task "Buy groceries" should appear in the list
9. Now try a more detailed task. Press **N** again and type: `Fix homepage bug high priority due tomorrow`
10. Press **Enter**
11. Go to **/tasks** — verify this second task was created with:
    - High priority label
    - Due date set to tomorrow
    - (If priority or date are not parsed, note it as a bug)

---

### 1.6 Create Tasks Using Other Methods

**From the Tasks page:**
1. Go to **/tasks** in the sidebar
2. Look for an **Add Task** button — click it
3. A dialog should open with fields: Title, Description, Priority, Due Date, Project
4. Fill in a title: `Review wireframes`
5. Set Priority to **High**
6. Click **Save** or **Create**
7. Expected: task appears in the list

**Using Cmd+K (Command Bar):**
1. Press **Cmd+K** (Mac) or **Ctrl+K** (Windows/Linux) from anywhere in the app
2. A search and command bar should open (a floating search box)
3. Type: `add task Submit invoice to client`
4. A preview of the task to be created should appear
5. Press **Enter**
6. Expected: task is created, command bar closes
7. Go to **/tasks** and verify the task appears

---

### 1.7 Create a Client (and hit the Free plan limit)

1. Click **Clients** in the left sidebar
2. You should land on **/clients** — it should show an empty state or "No clients yet"
3. Look for a **New Client** or **Add Client** button — click it
4. Fill in the form:
   - **Name:** Acme Corp
   - **Email:** acme@test.com
   - **Phone:** 555-0100
   - **Company:** Acme Corp
5. Save the client
6. Expected: you are taken to the client detail page, or the client appears in the list
7. Click on the client name to open the detail page — verify it loads without errors
8. **Now test the Free plan limit.** Click **New Client** or **Add Client** again to try creating a second client
9. Expected: you should see an upgrade prompt or message saying you've reached the limit (Free plan allows only 1 client)
   - The prompt should mention upgrading to Pro
   - You should NOT be able to create the second client on the Free plan

---

### 1.8 Create Projects (and hit the Free plan limit)

1. Click **Projects** in the left sidebar
2. You should land on **/projects** — empty state
3. Click **New Project** or **+ New Project**
4. Fill in the form:
   - **Name:** Website Redesign
   - **Description:** Redesigning the main company website
   - **Status:** Active
   - **Priority:** High
   - **Due Date:** pick a date 2 weeks from now
   - **Client:** Acme Corp (from the dropdown — the client you created should appear)
5. Save the project
6. Expected: project appears in the list

7. Create a **second project:**
   - Name: Mobile App
   - Description: Building a new mobile app
   - No client assigned
   - Status: Active

8. Create a **third project:**
   - Name: Marketing Campaign
   - Description: Q1 marketing push
   - Status: Active

9. **Now test the Free plan limit.** Click **New Project** again to try creating a 4th project
10. Expected: you should see an upgrade prompt — Free plan allows only 3 projects
    - The message should clearly say you need to upgrade
    - The 4th project should NOT be created

---

### 1.9 Task Features (Edit, Complete, Comment, Filter, Sort, Delete)

1. Go to **/tasks** in the sidebar

**Editing a task:**
2. Click on the task named "Buy groceries"
3. You should be taken to the task detail page
4. Click on the task **title** — it should become editable. Change it to `Buy groceries and milk`
5. Click away or press **Enter** to save
6. Expected: title updates without a page reload
7. Add a **description**: click on the description area and type `Pick up from the organic store on Main St`
8. Save it — expected: description is saved
9. Set the **Priority** to Medium using the priority dropdown
10. Set a **Due Date** to next Monday
11. Expected: both fields save and display the new values

**Completing a task:**
12. Click the **checkbox** next to the task title
13. Expected: task shows as completed (usually strikethrough text or a green checkmark)
14. Click the checkbox again — expected: task reverts to incomplete

**Adding a comment:**
15. Scroll down on the task detail page and find the **Comments** section
16. Type a comment: `Need to check if the store on Main St is open on Sundays`
17. Click **Add** or press **Enter** to submit
18. Expected: your comment appears below with your name and a timestamp
19. Find a **delete** icon next to your comment and click it
20. Expected: the comment is removed

**Filtering tasks:**
21. Go back to **/tasks**
22. Look for a **Filter** button or dropdown at the top of the task list
23. Filter by **Status: Completed** — only completed tasks should show
24. Filter by **Status: Pending** — only incomplete tasks should show
25. Filter by **Priority: High** — only high-priority tasks should show
26. Clear all filters

**Sorting tasks:**
27. Find the **Sort** option in the task list
28. Sort by **Due Date** — verify tasks reorder by their due dates
29. Sort by **Priority** — verify high-priority tasks appear first
30. Sort by **Newest** and **Oldest** — verify the order changes

**Deleting a task:**
31. On the task detail page or task list, find the **delete** option (usually a trash icon or "Delete" button — may be in a "..." menu)
32. Click delete — a confirmation dialog should appear
33. Confirm the deletion
34. Expected: task is removed from the list and you are taken back to /tasks (or it disappears from the list)

---

### 1.10 Project Detail (Kanban Board and Time Entries)

1. Click **Projects** in the sidebar
2. Click on your **Website Redesign** project
3. You should land on the project detail page

**Kanban board:**
4. Look for a **Board** button or tab — click it to switch to the Kanban view
5. You should see columns: **To Do**, **In Progress**, **Done**
6. Any tasks linked to this project should appear as cards in the **To Do** column
7. If there are no tasks here, go to /tasks and create a task, assigning it to the Website Redesign project
8. Back on the board, drag a task card from **To Do** to **In Progress**
9. Expected: the card moves to the new column and the task's status updates
10. Drag it to **Done** — expected: same behavior

**Time entries:**
11. Find the **Time** tab on the project detail page — click it
12. You should see a form to log time
13. Fill in:
    - **Hours:** 2
    - **Description:** Initial planning session
    - **Date:** today's date
14. Click **Save** or **Log Time**
15. Expected: the entry appears in the time log below the form with the hours and description
16. Find the **delete** option next to the entry and delete it
17. Expected: the entry is removed

---

### 1.11 Bookmarks

1. Click **Bookmarks** in the left sidebar
2. You should land on **/bookmarks** — empty state
3. Find the **Add Bookmark** button and click it
4. Enter a URL: `https://www.google.com`
5. Save it
6. Expected: the bookmark appears in the list with the page title ("Google") and possibly a thumbnail or favicon automatically extracted
7. Add another bookmark with a YouTube URL: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
8. Expected: the bookmark shows the video title and a YouTube thumbnail
9. Try filtering bookmarks — look for filter options (by type: YouTube, website) and verify they work
10. Try searching bookmarks using the search field if available

---

### 1.12 Calendar

1. Click **Calendar** in the left sidebar
2. You should land on **/calendar** showing the current month
3. Look at the calendar grid — any tasks that have due dates should appear on their due date
4. The tasks you created with due dates ("Fix homepage bug due tomorrow", "Buy groceries and milk") should be visible on the correct dates
5. Click the **Next month** arrow — the calendar should move forward one month
6. Click the **Previous month** arrow — returns to the current month
7. Click on a date that has a task — verify it shows the task name

---

### 1.13 Search (Cmd+K Command Bar)

1. Press **Cmd+K** (Mac) or **Ctrl+K** (Windows) from any page
2. The command bar should open as a floating search input
3. Look for placeholder text: `Search or type "add task..." to create`
4. Type the name of a task you created (e.g., `groceries`) — your task should appear in the results
5. Press **Enter** or click the result — expected: you navigate to the task detail page
6. Press **Cmd+K** again. Type the name of one of your projects (e.g., `Website`) — the project should appear
7. Click it — expected: navigate to the project page
8. Press **Cmd+K** again. Type `Acme` — your Acme Corp client should appear
9. **Quick Actions:** Open the command bar and don't type anything. You should see quick action links like Dashboard, Projects, Tasks, Calendar, Bookmarks, Clients, Settings — click each one and verify it navigates to the correct page
10. Use the **arrow keys** to navigate up and down the results — verify the highlighted item changes
11. Press **Esc** — the command bar should close

---

### 1.14 Settings (Free Plan)

1. Click **Settings** in the sidebar (usually at the bottom or as a gear icon)
2. You should land on **/settings**

**Billing card:**
3. Find the **Billing** section — it should show your current plan as **Free**
4. There should be a badge or label that says "Free"
5. There should be a usage section showing how many of your Free limits you've used (e.g., "1/1 Clients", "3/3 Projects")

**Integration cards (should be locked on Free plan):**
6. Find the **Telegram** card — it should show an "Upgrade to Pro" button or badge, NOT a "Link Telegram" button
7. Find the **Email to Task** card — same: should show upgrade prompt, not the feature
8. Find the **Siri & Shortcuts** card (or API access card) — same: should show upgrade prompt

**Appearance:**
9. Find the **Appearance** or **Dark Mode** toggle
10. Toggle it ON — the entire app should switch to a dark color scheme
11. Navigate to a few pages (Tasks, Projects) — dark mode should apply everywhere
12. Come back to Settings and toggle dark mode **OFF** — app returns to light mode

---

### 1.15 Dark Mode (Full Check)

1. Go to Settings and enable **Dark Mode**
2. Visit each of these pages and verify the layout looks correct with no broken colors or unreadable text:
   - **/dashboard** — all cards and text readable
   - **/tasks** — task list readable
   - **/projects** — project list readable
   - **/clients** — client list readable
   - **/calendar** — calendar grid readable
   - **/settings** — cards readable
3. Go back to **pulsepro.work** (the marketing page) while still logged in — verify dark mode applies or at minimum there is no broken layout
4. Return to Settings and toggle dark mode **OFF** — all pages return to light mode

---

### 1.16 Mobile Layout Check

1. Right-click anywhere in the Chrome browser, click **Inspect**
2. Click the phone/tablet icon at the top of the inspector panel (Toggle Device Toolbar)
3. Set the width to **390** (to simulate an iPhone 14)
4. Check each of these pages:
   - **/dashboard** — stats and sections should stack vertically, no horizontal scrollbar
   - **/tasks** — task list should be readable, not cut off
   - **/projects** — project cards should stack properly
   - **/settings** — all cards stack, no overflow
   - The left sidebar — should collapse into a menu icon or change to a bottom navigation bar
5. Note any pages where content is cut off, overlapping, or has a horizontal scrollbar
6. When done, close the inspector or click the phone icon again to return to desktop view

---

### STOP — Phase 1 Complete

Message Fonz: **"Phase 1 done, ready for Pro upgrade"**

Include any bugs you found in Phase 1 in your message. Wait for Fonz to upgrade your account before continuing.

---

## Phase 2: Pro Plan (~45 minutes)

### 2.1 Verify the Upgrade

After Fonz upgrades your account:

1. Go to **/settings**
2. Find the **Billing** card
3. Expected: your current plan now shows **Pro** with a green badge and "$12/month"
4. The usage section for Free limits should no longer appear (or all limits should show as Unlimited)
5. Go to **/projects** and click **New Project** — you should be able to create projects without hitting a limit
6. Go to **/clients** and click **New Client** — you should be able to create a second client without an upgrade prompt

---

### 2.2 Create Content Beyond Free Limits

Now that you're on Pro, verify the limits are truly gone:

1. Create a **4th project** (you should be able to now)
   - Name: Client Onboarding
   - Status: Active
2. Create a **2nd client:**
   - Name: Bright Ideas Agency
   - Email: hello@brightideas.com
3. Create a handful of extra tasks — try to get above 5 total tasks. All should be created without any limits message

---

### 2.3 Invoices

1. Click **Invoices** in the left sidebar
2. You should land on **/invoices** — this page should now be accessible (it would have been locked or hidden on Free)
3. Click **New Invoice** or **Create Invoice**
4. Fill in the invoice form:
   - **Client:** Acme Corp (select from dropdown)
   - **Invoice number:** auto-generated or enter `INV-001`
   - **Due date:** 30 days from today
5. Find the **Line Items** section and add two items:
   - Item 1: Description `Website design`, Quantity `1`, Price `$2,500`
   - Item 2: Description `Hosting setup`, Quantity `1`, Price `$150`
6. Verify the **Total** calculates correctly: $2,650
7. Save the invoice
8. Expected: you land on the invoice detail page showing all the line items and total

**Send the invoice by email:**
9. Look for a **Send** or **Send by Email** button on the invoice detail page
10. Enter your **secondary test email address** as the recipient
11. Click **Send**
12. Expected: confirmation that the email was sent
13. Check your secondary email inbox — you should receive an invoice email with the line items and total

**Public share link:**
14. On the invoice detail page, look for a **Share** or **Copy Link** button
15. Click it — a URL should be generated (or copied to your clipboard)
16. Open a **new incognito window** (Cmd+Shift+N on Mac, Ctrl+Shift+N on Windows)
17. Paste the link and visit it
18. Expected: you can see the invoice details WITHOUT being logged in — this is the public share view
19. Verify the invoice looks complete and professional (line items, totals, client name)

---

### 2.4 Telegram Bot Integration

You will need your phone with Telegram installed for this section.

**Linking your account:**
1. Go to **/settings**
2. Find the **Telegram** card — it should now show a **Link Telegram** button (not an upgrade prompt)
3. Click **Link Telegram**
4. A verification code should appear on screen — it looks like `LINK-XXXXXX` (6 random characters)
5. Verify the code has a **Copy** button
6. Verify there is a message saying the code expires in 10 minutes
7. On your phone, open Telegram and search for the Pulse Pro bot (the bot name should be shown in Settings)
8. Start a conversation with the bot by sending `/start`
9. The bot should send you a welcome message
10. Send the verification code from Step 4 to the bot (paste it in the Telegram chat)
11. Expected: the bot replies with "Account linked!" or a success message
12. Go back to the Settings page and refresh — the Telegram card should now show a green status indicator saying "Linked" or similar
13. Look for a **Daily Reminders** toggle — turn it ON, then OFF, verify it saves both ways

**Testing bot commands:**
14. In your Telegram chat with the Pulse Pro bot, send each of these commands and verify the response:
    - `tasks` — expected: a list of your tasks is returned
    - `today` — expected: tasks due today
    - `overdue` — expected: tasks that are past their due date (if any)
    - `add Buy milk` — expected: bot confirms a new task "Buy milk" was created
    - `done 1` — expected: bot marks task #1 as complete (task numbers come from the `tasks` list)
    - `help` — expected: a list of available commands is shown

**Unlinking:**
15. In Settings, find the **Unlink Telegram** button and click it
16. Confirm the unlink
17. Expected: the Telegram card returns to showing the "Link Telegram" button, green status indicator is gone
18. In Telegram, send `tasks` — the bot should respond with something like "No Pulse Pro account linked" or a similar error message

---

### 2.5 Email-to-Task Integration

1. Go to **/settings**
2. Find the **Email to Task** card — it should now show a **Generate Email Address** button
3. Click **Generate Email Address**
4. A unique email address should appear — it looks like `{token}@in.pulsepro.work`
5. There should be a **Copy** button next to the address — click it to copy
6. Verify there are instructions explaining how Email-to-Task works

**Sending a test email:**
7. Open your secondary email account (Gmail, Outlook, etc.)
8. Send an email TO the `@in.pulsepro.work` address you just generated
   - **Subject:** `My first email task`
   - **Body:** `This task was created by forwarding an email`
9. Wait 1-2 minutes, then go to **/tasks** in Pulse Pro
10. Expected: a new task appeared with the title "My first email task" and the body as the description

**Testing project assignment via email:**
11. Send another email to the same address:
    - **Subject:** `[Website Redesign] Fix the header image`
    - **Body:** `The header image is stretched on mobile`
12. Wait 1-2 minutes, then go to **/tasks**
13. Expected: a new task "Fix the header image" was created and assigned to the "Website Redesign" project

---

### 2.6 API Access (Siri & Shortcuts)

1. Go to **/settings**
2. Find the **Siri & Shortcuts** or **API Access** card — it should show a **Generate API Token** button
3. Click **Generate API Token**
4. A token should appear — it starts with `pp_`
5. The token should be **partially masked** by default (e.g., `pp_abc***...`) — you should not see the full token until you click a show/hide toggle
6. Click the **Show** toggle — verify the full token is revealed
7. There should be a **Copy** button — click it
8. Verify there are **curl command examples** shown in the card

**Optional — testing with curl (skip if not comfortable with Terminal):**
If you're comfortable using Terminal (Mac) or Command Prompt (Windows), you can test the API:

Open Terminal and run this command, replacing `YOUR_TOKEN` with your actual token:

```
curl -X POST https://pulsepro.work/api/v1/tasks \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Task from API test"}'
```

Expected: you receive a response like `{"id": "...", "title": "Task from API test", ...}` with a 201 status

Then run this to list your tasks:

```
curl https://pulsepro.work/api/v1/tasks \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Expected: a JSON array of your tasks

If you don't use Terminal, skip this step and note it in your report.

---

### 2.7 AI Insights

1. Go to **/dashboard**
2. Look for a section or panel labeled **Smart Insights** or **AI Insights**
3. Expected: the panel is visible (it would not have been shown on the Free plan)
4. The insights should show relevant information about your data — things like overdue tasks, project health warnings, or productivity observations
5. Look for a **Generate** or **Refresh** button — click it
6. Expected: the insights update or refresh with new analysis
7. Refresh the page — expected: cached insights load quickly without a long wait

---

### 2.8 Collaboration (Project Sharing)

For this section you need your **secondary email account**. You will need to be able to log into Pulse Pro with that second account in a separate browser or incognito window.

**Important:** Do this carefully. You are testing that permissions are enforced correctly.

**Setting up the second account:**
1. Open an **incognito window** and go to **pulsepro.work/sign-up**
2. Sign up using your **secondary email address**
3. That account will be on the Free plan — that is fine for this test
4. Keep this incognito window open so you can switch between the two accounts

**Sharing a project as Viewer:**
5. In your **main account** (regular browser window), go to **/projects** and open the **Website Redesign** project
6. Find the **Team** tab on the project detail page — click it
7. Look for an **Invite** or **Add Member** button — click it
8. Enter your **secondary email address** and set the role to **Viewer**
9. Send the invitation or save the change
10. Switch to your **incognito window** (secondary account) and go to **/projects**
11. Expected: the Website Redesign project now appears in the secondary account's project list (it was shared)
12. Click on the project — verify the secondary account CAN see the project and its tasks
13. Try to **edit a task** in the project from the secondary account — expected: editing should NOT be allowed (the edit button may be missing, or an error should appear when trying)

**Changing role to Editor:**
14. Back in your **main account**, go to the Team tab of the Website Redesign project
15. Change the secondary account's role from **Viewer** to **Editor**
16. Switch to the **incognito window** (secondary account) and refresh the project
17. Try to edit a task title — expected: editing IS now allowed as an Editor

**Changing role to Manager:**
18. Back in your **main account**, change the role to **Manager**
19. Verify the secondary account can now perform management actions on the project

**Testing the collaborator limit (Pro = max 3):**
20. In your **main account**, in the Team tab, try to add more collaborators. You currently have 1 (the secondary account). Try adding 2 more email addresses (they don't have to be real accounts — if the field validates by email format, use `test2@example.com` and `test3@example.com`)
21. Get to 3 total collaborators on this project — this should succeed
22. Try adding a **4th collaborator** — expected: you should see an error message or upgrade prompt saying you have reached the limit for the Pro plan (3 collaborators per project)
23. The 4th collaborator should NOT be added

**Removing a collaborator:**
24. Remove the secondary account from the project in the Team tab
25. Switch to the **incognito window** and refresh /projects
26. Expected: the Website Redesign project no longer appears in the secondary account's project list — they have lost access

---

### STOP — Phase 2 Complete

Message Fonz: **"Phase 2 done, ready for Team upgrade"**

Include any bugs you found in Phase 2 in your message. Wait for Fonz to upgrade your account before continuing.

---

## Phase 3: Team Plan (~20 minutes)

### 3.1 Verify the Team Upgrade

1. Go to **/settings**
2. Find the **Billing** card
3. Expected: the plan badge now shows **Team** (blue badge) and "$29/month"

---

### 3.2 Collaboration Limits (Team = max 10)

On the Pro plan, you could only have 3 collaborators per project. The Team plan allows 10.

1. Go to the **Website Redesign** project
2. Open the **Team** tab
3. Try adding collaborators until you reach more than 3 total (the old Pro limit)
4. Expected: you can now add collaborators beyond 3 without hitting a limit
5. Try adding collaborators until you reach the Team plan limit of 10
6. Attempt to add an 11th collaborator — expected: blocked with a limit message

*(Note: you may not have 10 real email accounts to test with. Test as far as you reasonably can and report what happened.)*

---

### 3.3 All Pro Features Still Work

Do a quick check that everything from Phase 2 still works on the Team plan:

1. Go to **/invoices** — verify you can see your existing invoice and create a new one
2. Go to **/settings** and verify the Telegram card still works (re-link if you unlinked earlier)
3. Go to **/dashboard** — verify the AI Insights panel is still visible
4. Create a new task, a new project, a new client — verify no limits are enforced

---

### 3.4 Final Walkthrough

Do one complete pass through every main section of the app. You are looking for anything that seems off — visual glitches, broken layouts, confusing labels, errors.

Visit each page and spend 30 seconds looking for anything wrong:

1. **/dashboard** — does everything look right?
2. **/tasks** — task list, filters, sort
3. **/projects** — project list
4. Click into one project — Kanban board, Time tab, Team tab
5. **/clients** — client list
6. Click into a client — verify linked projects appear
7. **/bookmarks** — bookmark list
8. **/calendar** — calendar with tasks
9. **/invoices** — invoice list
10. **/settings** — all cards, billing, integrations, dark mode
11. The **Cmd+K** command bar — does search still return accurate results?

Note anything that seems wrong, off, or confusing.

---

### DONE — Send Your Full Bug Report

Email your complete bug report to: **info@pulsepro.work**

In the subject line, write: `Pulse Pro QA Testing — Bug Report`

Include:
- All bugs found across all 3 phases, using the bug template
- Any confusion or unclear UI that isn't necessarily broken but could be improved
- Your overall impression of the app (what felt smooth, what felt confusing)

---

## Quick Reference

| Feature | Free | Pro | Team |
|---------|------|-----|------|
| Projects | 3 | Unlimited | Unlimited |
| Tasks | 50 | Unlimited | Unlimited |
| Clients | 1 | Unlimited | Unlimited |
| Collaborators per project | 0 | 3 | 10 |
| Invoices | No | Yes | Yes |
| Telegram bot | No | Yes | Yes |
| Email-to-Task | No | Yes | Yes |
| API / Siri Shortcuts | No | Yes | Yes |
| AI Insights | No | Yes | Yes |

---

## Keyboard Shortcuts Reference

| Shortcut | Action |
|----------|--------|
| N | Open quick-add task bar (from any page, when not typing) |
| Cmd+K / Ctrl+K | Open command bar (search + quick actions) |
| Enter | Submit the quick-add form or confirm a selected command |
| Esc | Close any overlay or command bar |
| Arrow Up / Down | Navigate command bar results |

---

*Thank you for testing Pulse Pro. Your findings directly help improve the product for everyone.*
