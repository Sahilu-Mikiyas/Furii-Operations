# Mission Poland — Phase 1: Command Center, Today, Identities

A private, single-user mission command center counting down to **10 February 2027**. Dark, cinematic, deep-red accent — nothing like a generic productivity app.

## What gets built

### 1. Login (private)
Email/password sign-in. All data belongs to your account only; nobody else can read it. No public sign-up flow surfaced beyond your own account.

### 2. Command Center (home)
- Hero: 🇵🇱 MISSION POLAND — February 2027 — "Build the life. Earn the money. Make the move."
- Live day countdown to 10 Feb 2027 (departure date editable in settings).
- Overall MISSION PROGRESS as a large weighted ring — weighted across the four pillars, not a task count.
- Four pillar cards with current/target and progress bars:
  - 🎥 Media — $3,420 / $10,000 per month
  - 💻 Software — 1,250,000 / 2,000,000 ETB
  - ❤️ Life — proposal 200K + marriage 1M ETB funds
  - 🇵🇱 Relocation — $6,800 / $10,000 minimum, $15,000 stretch (Secure / Acceptable / Below minimum status)
- Today strip: identity, current mission, loop progress, focused hours, daily score.
- This Week strip: the seven days with identity and status (done / partial / behind / pending).
- Mission alerts: a small feed of computed, meaningful signals only (behind pace, ahead of target, funds unlocked).

### 3. Today's Mission
- Big identity header for the current weekday and the day's objective.
- The day's loop as an ordered pipeline (not a random checklist) with step-by-step completion and X/N progress.
- Deep work sessions: start / pause / complete timer, logged with label and duration; today's focused total.
- End-of-day Daily Score (0–100) computed from checklist completion, deep work hours, key objective done, output produced.
- Mental load protection: only today's identity's categories show; other businesses are collapsed behind a "not today" divider.
- **+ Park Idea** button available everywhere, saving to a Parking Lot list reviewed later.

### 4. Daily Identities
Seven editable identities, each with description, mission, allowed categories, standard loop checklist, KPIs and completion criteria:
Mon 🎬 The Movie Man · Tue 💰 The Money Man · Wed 🎥 The Documentarian · Thu 💻 The CTO · Fri 🤝 The Dealmaker · Sat 🎥 The Documentarian · Sun 📚 The Bookman.
Editing an identity's standard loop changes what future days generate.

### 5. Parking Lot
Captured ideas with date, note, and actions: keep, promote to a future day, or discard.

### Seeded from your brief
Pillar targets and current values, the seven identities with their loops, monthly mission titles (Builder → The New Chapter) reserved for the next phase, and a plausible current day so the app looks alive on first open.

## Design direction
Charcoal/black surfaces, white typography, deep red accent, oversized numerals, thin progress rails, mission cards, subtle motion on counters and progress. Feels like an operations console, not a wellness app.

## Technical notes
- Lovable Cloud for auth and data. Tables: `profiles`/`mission_settings`, `identities`, `days`, `day_tasks`, `work_sessions`, `pillars`, `pillar_entries`, `parked_ideas`, `alerts`. Row-level security scoped to the owner on every table, with explicit grants.
- Seed rows ship in the migration itself, attached to your account on first sign-in.
- Routes: `/` command center, `/today`, `/identities`, `/parking`, `/settings`, `/auth`. Protected routes sit under the authenticated layout.
- Score and progress math lives in one shared calculation module so later modules (YouTube, CRM, funds) reuse it.

## Deliberately deferred to later phases
YouTube hub and per-channel modules, software CRM/deal tracker/build board/promo studio, outreach center, monthly & weekly mission generators, funds ledger detail, Poland checklist and document vault, contacts, analytics, achievements, mission map, mission intelligence. Phase 1's data model is shaped so these attach without rework.
