# Furii — Client Operations & Digital Work Management Platform

A private web platform used by **Furii** digital agency and its clients to manage, document, track, review, and communicate everything related to a client's digital services.

---

## ✦ Core Philosophy

The platform does not merely report completion percentages — it documents:
> **What was requested → What was planned → What was done → What was delivered → What was approved → What changed → What is happening now → What happens next.**

Every meaningful action becomes part of a permanent, auditable project history.

---

## ✦ Key Capabilities

### 1. Dual Workspace Architecture
- **Internal / Admin Operations**: Full control over clients, projects, service streams, tasks, deliverables, schedules, payments, files, and activity logs.
- **Client Portal**: An executive-grade workspace for clients (e.g. *Ersas Interiors*) displaying overall progress, active service completion, pending approval alerts, upcoming schedule, and paid vs. remaining financial balance.
- **Interactive Perspective Switcher**: Switch on the fly between **Super Admin**, **Project Manager**, **Team Member**, and **Client Owner**.

### 2. Isolated Service Workspaces
Dedicated, non-overlapping workspaces for each client service stream:
- **Branding & Graphic Design**
- **Website & Software Development**
- **SEO & Google Business Profile Management**
- **Social Media Management**
- **Content Production, Photography & Videography**

Each workspace maintains 7 distinct operational facets:
1. **Overview & Milestones**: Phase progression and delivery dates.
2. **Work Records**: Detailed logs of work actually performed with technical implementation details.
3. **Tasks**: Actionable tasks with priorities and deadlines.
4. **Deliverables**: Official client outputs with full version history (`v1`, `v2`, `v3`).
5. **Approvals**: Client sign-off interface with one-click **Approve** and **Request Changes** feedback workflow.
6. **Decisions**: Formal records of decisions made by both parties.
7. **Files**: Centralized asset vault with visibility controls (Client vs. Internal).

### 3. Financial Tracking & Multi-Currency
- Dual currency support: **ETB** (Ethiopian Birr) and **USD** (United States Dollar).
- Contract value tracking, payment milestone schedules, issued invoices, and verified receipts.

### 4. Global Search & Command Palette (`⌘K`)
- Instant fuzzy search across clients, projects, services, deliverables, tasks, and files.

### 5. Reporting & PDF Export
- Periodic executive client reports summarizing work completed, deliverables handed over, and target roadmaps for the upcoming sprint.

---

## ✦ Technology Stack

- **Framework**: React 19 + TypeScript + Vite SPA
- **Routing**: React Router v7 (`react-router-dom`)
- **State & Data**: TanStack Query (`@tanstack/react-query`)
- **Styling**: Tailwind CSS v4 + Design System (Neutral light palette `#F7F7F5`, `#FFFFFF`, `#111111`)
- **UI Components**: Radix UI (shadcn/ui primitives) + Lucide Icons + cmdk
- **Animation**: Framer Motion
- **Backend & Database**: Supabase (PostgreSQL, Row-Level Security, Storage, Auth)

---

## ✦ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

### 3. Production Build
```bash
npm run build
```

---

© 2026 Furii Agency. All rights reserved.
