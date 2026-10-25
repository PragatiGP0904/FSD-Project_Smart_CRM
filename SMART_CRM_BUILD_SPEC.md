# Smart CRM — Build Specification (for Cursor)

You are the lead engineer and product designer building **Smart CRM**, a production-quality, portfolio-grade CRM web app for small businesses and individual salespeople. Read this whole file before writing any code. Follow it exactly. When something is not specified, make the choice a senior engineer at a top SaaS company would make, and note it in `docs/DECISIONS.md`.

This project is also the subject of a college Full Stack Development report, so **the architecture, names, rules and endpoints below must be kept exactly**. Do not rename collections, endpoints, stages or folders.

---

## 1. Product in one paragraph

Smart CRM connects customer information, sales progress, previous interactions and upcoming actions in one simple workspace. Its main idea is **context-aware follow-up**: a follow-up is never a bare reminder like "Call Arjun today". It always shows the customer, priority, current sales stage, last interaction and the next action together.

**Primary users:** small business owners, service providers, individual salespeople.
**Tone:** calm, fast, professional. Looks like a product that has been running for years.

---

## 2. Tech stack (fixed)

| Layer | Choice |
|---|---|
| Database | MongoDB (local or Atlas) with Mongoose |
| Backend | Node.js 20+, Express.js, CommonJS |
| Auth | JWT (7 days), password hashing with `bcryptjs` (10 rounds) |
| Security | `helmet`, `cors` (restricted to `CLIENT_URL`), `express-rate-limit`, `express-mongo-sanitize`, JSON body limit 10kb |
| Validation | `zod` on the backend (request schemas) and frontend (forms) |
| Frontend | React 18 + Vite, **JavaScript (JSX)**, React Router v6 |
| Styling | Tailwind CSS v3 with CSS variables for theming + shadcn/ui (Radix primitives) |
| Data fetching | Axios instance + TanStack Query v5 |
| Forms | react-hook-form + zod resolver |
| Charts | Recharts |
| Drag and drop | @dnd-kit/core + @dnd-kit/sortable |
| Toasts | sonner |
| Dates | date-fns |
| **Icons** | **lucide-react only** |
| Font | **Geist Sans** via `@fontsource-variable/geist` |
| Testing | Jest + Supertest + mongodb-memory-server (backend), Vitest + React Testing Library (frontend, key components only) |
| Lint/format | ESLint + Prettier |

**Hard rules**
- No emojis anywhere in the UI, copy, seed data or commit messages.
- No icon fonts, no emoji-as-icon, no AI-looking decorative sparkles/robots/magic-wand icons. Use lucide icons that describe the action (e.g. `Users`, `Kanban`, `CalendarClock`, `PhoneCall`, `Handshake`).
- No placeholder "Lorem ipsum". All seed data and copy must be realistic.
- No external paid APIs. The only external things needed are a MongoDB connection string and a JWT secret (see section 14).

---

## 3. Repository layout (fixed)

```
Smart-CRM/
├── backend/
│   ├── config/db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── leadController.js
│   │   ├── customerController.js
│   │   ├── opportunityController.js
│   │   ├── activityController.js
│   │   ├── followUpController.js
│   │   └── dashboardController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── validate.js
│   │   └── errorHandler.js
│   ├── models/ User.js Lead.js Customer.js Opportunity.js Activity.js FollowUp.js
│   ├── routes/ authRoutes.js leadRoutes.js customerRoutes.js opportunityRoutes.js
│   │          activityRoutes.js followUpRoutes.js dashboardRoutes.js
│   ├── seed/seed.js
│   ├── tests/ (one file per resource, plus workflow.test.js)
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/ favicon.svg
│   ├── src/
│   │   ├── components/ (ui/, layout/, leads/, pipeline/, followups/, charts/, common/)
│   │   ├── context/AuthContext.jsx
│   │   ├── hooks/
│   │   ├── lib/ (utils.js, constants.js, format.js)
│   │   ├── pages/ Login.jsx Register.jsx Dashboard.jsx Leads.jsx LeadDetail.jsx
│   │   │          Customers.jsx CustomerDetail.jsx Pipeline.jsx Activities.jsx
│   │   │          FollowUps.jsx Settings.jsx NotFound.jsx
│   │   ├── services/api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env.example
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── docs/ (DECISIONS.md, API.md, screenshots/)
├── .gitignore
├── package.json   (root scripts: dev, seed, test, lint — runs both apps with concurrently)
└── README.md
```

---

## 4. Data model (Mongoose, all with `timestamps: true`)

**User** — `name`, `email` (unique, lowercase), `passwordHash` (`select: false`), `role` (`admin` | `salesperson`, default `salesperson`). Never accept `role` from the registration body.

**Lead** — `name` (required), `email`, `phone`, `company`, `source` (`Website | Referral | Call | Social Media | Other`), `stage` (`New Lead | Contacted | Qualified | Proposal | Won | Lost`, default `New Lead`), `notes`, `assignedTo` (User, required), `customerId` (Customer). Index `{ stage: 1, assignedTo: 1 }`.

**Customer** — `name`, `email`, `phone`, `company`, `status` (`Active | Inactive`), `createdBy` (User). Index on `name` and `createdBy`.

**Opportunity** — `title`, `customerId` or `leadId`, `value` (number, INR), `stage` (same six stages), `probability` (0–100), `expectedCloseDate`, `createdBy`. Index on `customerId` and `stage`.

**Activity** — `type` (`Call | Meeting | Email | Note`), `description`, `date`, `leadId` or `customerId`, `createdBy`. Index on `customerId`, `leadId`, `date`.

**FollowUp** — `title`, `dueDate`, `priority` (`High | Medium | Low`, default `Medium`), `status` (`Pending | Completed | Overdue`), `leadId` or `customerId`, `context: { name, stage, lastInteraction }`, `completedAt`, `createdBy`. Index `{ status: 1, dueDate: 1 }`.

MongoDB references are not foreign keys: before saving an activity, opportunity or follow-up, the controller must confirm the referenced lead/customer exists **and belongs to the logged-in user**.

---

## 5. Business rules (enforce on the server, mirror in the UI)

1. **Ownership:** every query filters by the logged-in user. Another user's record returns `404`, never `403`.
2. **Allowed stage moves** (anything else returns `400` with `Cannot move a lead from X to Y`):
   ```
   New Lead  -> Contacted, Lost
   Contacted -> Qualified, Lost
   Qualified -> Proposal, Lost
   Proposal  -> Won, Lost
   Won, Lost -> (final, no moves)
   ```
3. A lead can move to **Contacted** only if it has at least one activity. Otherwise `400`: `Record an interaction before marking the lead as Contacted`.
4. Moving a lead to **Won** automatically creates a Customer (copying name, email, phone, company, status `Active`) and stores `customerId` on the lead (only once).
5. **Context-aware follow-up:** when a follow-up is created, the server looks up the lead/customer, reads its current stage (`Customer` for customers), fetches the latest activity and stores `context = { name, stage, lastInteraction: "<Type>: <description>" or "No interaction recorded yet" }`.
6. **Overdue:** whenever follow-ups are listed, run one `updateMany` that sets `Pending` items with `dueDate < now` to `Overdue`.
7. Completing a follow-up sets `status = Completed` and `completedAt`.
8. Deleting a lead also deletes its activities.
9. **Dashboard** returns: `totalLeads`, `activeOpportunities` (stage not Won/Lost), `pendingFollowUps` (Pending + Overdue), `totalActivities`, `stageDistribution` (aggregation), plus `pipelineValue`, `upcomingFollowUps` (next 5), `recentActivities` (last 6), `leadsOverTime` (last 8 weeks).

---

## 6. REST API (all under `/api`, JSON only)

Response shape: `{ success: true, data, count? }` or `{ success: false, message }`. Use proper status codes. Never return stack traces or `passwordHash`.

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| POST | `/api/auth/register` | Register (name, email, password min 6) | Public |
| POST | `/api/auth/login` | Login, returns `{ token, user }` | Public |
| GET | `/api/auth/me` | Current user | Protected |
| PUT | `/api/auth/me` | Update name / password | Protected |
| GET | `/api/leads` | List; query: `stage`, `search`, `source`, `page`, `limit`, `sort` | Protected |
| POST | `/api/leads` | Create lead | Protected |
| GET | `/api/leads/:id` | One lead + its activities + follow-ups | Protected |
| PUT | `/api/leads/:id` | Update fields **or** change stage (`{ stage }`) | Protected |
| DELETE | `/api/leads/:id` | Delete lead | Protected |
| GET | `/api/customers` | List (search, page) | Protected |
| POST | `/api/customers` | Create | Protected |
| GET | `/api/customers/:id` | Profile with activities, opportunities, follow-ups | Protected |
| PUT | `/api/customers/:id` | Update | Protected |
| GET/POST | `/api/opportunities` | List / create | Protected |
| PUT/DELETE | `/api/opportunities/:id` | Update (incl. stage) / delete | Protected |
| GET | `/api/activities` | List (filter `type`, `leadId`, `customerId`) | Protected |
| POST | `/api/activities` | Record an interaction | Protected |
| GET | `/api/followups` | List (filter `status`, `priority`), triggers overdue update | Protected |
| POST | `/api/followups` | Create with context | Protected |
| PUT | `/api/followups/:id` | Update | Protected |
| PATCH | `/api/followups/:id/complete` | Mark completed | Protected |
| GET | `/api/dashboard` | Dashboard metrics | Protected |
| GET | `/health` | Health check | Public |

Rate limit `/api/auth/*` to 50 requests / 15 minutes. Document every endpoint with a request and response example in `docs/API.md`.

---

## 7. Design direction (this is a major part of the job)

The goal: someone opening this should think it is a mature, paid SaaS product that a design team has refined for years. Restraint over decoration.

### 7.1 Visual identity
- **Concept:** "a quiet desk for the next call". Calm, dense where it needs to be, generous elsewhere.
- **One memorable element:** the **Context Follow-Up Card** (section 7.4). Everything else stays quiet and disciplined so this stands out.
- **Palette (define as CSS variables, with light and dark values):**

| Token | Light | Dark | Use |
|---|---|---|---|
| `--background` | `#F7F8FA` | `#0B0F17` | App background |
| `--surface` | `#FFFFFF` | `#121826` | Cards, tables, panels |
| `--border` | `#E4E7EC` | `#222B3C` | Dividers, outlines |
| `--ink` | `#101828` | `#EEF1F6` | Primary text |
| `--ink-muted` | `#667085` | `#8B96AB` | Secondary text |
| `--primary` | `#2F54EB` | `#5B7CFA` | Buttons, links, active nav |
| `--primary-soft` | `#EAF0FF` | `#17213D` | Active backgrounds |
| `--success` | `#0E9F6E` | `#34D399` | Won, completed |
| `--warning` | `#D97706` | `#FBBF24` | Due soon, medium priority |
| `--danger` | `#DC2626` | `#F87171` | Overdue, Lost, destructive |

  Stage colours (small dot + text, never full colour blocks): New Lead slate, Contacted blue, Qualified violet, Proposal amber, Won green, Lost red.
- **Typography:** Geist Sans only. Scale: 12 / 13 / 14 (body) / 16 / 20 / 24 / 32. Weights 400, 500, 600. Tight tracking on headings (`-0.01em`), `tabular-nums` for all numbers. Sentence case everywhere. **No all-caps labels, no tracked eyebrow labels above headings, no "A · B · C" meta strings, no arrows appended to buttons.**
- **Shape:** radius 8px for inputs and buttons, 12px for cards and dialogs, 999px for chips only. Use borders more than shadows; one subtle shadow level for popovers and dialogs only. No gradient washes, no glassmorphism, no glow.
- **Density:** 14px body, 40px table rows, 36px inputs and buttons, 8px spacing grid.
- **Icons:** lucide-react at 16px (inline) and 20px (navigation), stroke width 1.75, colour `currentColor`.

### 7.2 App shell
- Fixed left sidebar (240px, collapsible to 64px with tooltips): Dashboard, Leads, Customers, Pipeline, Activities, Follow-ups, Settings. A count badge on Follow-ups showing overdue items.
- Top bar: breadcrumb/page title, global search (`Ctrl/Cmd + K` command palette using `cmdk`: jump to pages, search leads and customers, "New lead", "New follow-up"), theme toggle, user menu.
- Mobile (<768px): sidebar becomes a bottom sheet drawer; tables become stacked cards; the pipeline becomes a horizontally scrolling board with snap points.
- Content max width 1280px, page padding 24px (16px mobile).

### 7.3 Page specifications

**Login / Register** — Split layout. Left: a calm product panel showing a real-looking static preview of the Context Follow-Up Card with the sentence "Know what to say before you call." Right: the form. Inline validation, show/hide password, loading state on the button, clear error text. A "Use demo account" button fills `demo@smartcrm.com` / `Demo@123`.

**Dashboard** — Greeting with the user's first name and today's date. Row of 4 summary cards (Total leads, Active opportunities, Pending follow-ups, Activities recorded) with a small trend versus last week where data exists. Below: (a) **"Next up"** panel with the top 3 follow-ups as Context Follow-Up Cards, (b) stage distribution (horizontal bar chart, stage colours), (c) leads added over the last 8 weeks (area chart, single colour), (d) recent activity timeline. No more than two chart types. Every card has a real empty state.

**Leads** — Table with columns: Name (with avatar initials), Company, Source, Stage (stage chip), Last activity, Created. Toolbar: search, stage filter, source filter, "New lead" primary button. Row click opens a right-side drawer with details, an inline stage selector (only legal next stages enabled, with a tooltip explaining why others are disabled), the activity timeline and linked follow-ups. Bulk-select with delete. Server-side pagination (10 / 25 / 50).

**Lead detail** (`/leads/:id`) — Full page version of the drawer, with tabs: Overview, Activity, Follow-ups.

**Customers** — Same table pattern. Customer detail shows contact card, opportunities with value, activity timeline, follow-ups, and a "Log activity" action.

**Pipeline** — Kanban board with six columns using @dnd-kit. Each column header shows stage name, count and total value. Cards show name, company, source and age ("5 days in stage"). Dragging to an illegal stage snaps back and shows a toast explaining the rule from section 5. Dragging to Contacted without an activity opens a small dialog: "Log the first interaction to continue" with the activity form. Dropping on Won triggers a confirmation that a customer record will be created. Optimistic updates with rollback on error.

**Activities** — Chronological feed grouped by day. Filter chips by type (Call, Meeting, Email, Note). "Log activity" dialog: type, linked lead/customer (searchable combobox), description, date/time.

**Follow-ups** — Three views via a segmented control: List, Today, Calendar (month grid, built with date-fns). Items are rendered as **Context Follow-Up Cards**. Filters by status and priority. Overdue items sit at the top with a danger-coloured left border. One-click "Mark completed" with an undo toast.

**Settings** — Profile (name), change password, theme (light / dark / system), export data as CSV (leads, customers), and a danger zone for deleting all demo data.

**Not found** page with a link back to the dashboard.

### 7.4 The Context Follow-Up Card (the signature component)
A single reusable component used on the dashboard, follow-ups page and lead drawer. Layout:

```
| Arjun Kumar                              High   Due today 4:30 PM |
| Stage: Proposal      Last interaction: Meeting, 2 days ago        |
| "Quotation discussed with the customer"                           |
|-------------------------------------------------------------------|
| Next action: Call to check whether the quotation is acceptable    |
|                              [ Log call ]   [ Mark completed ]    |
```
- Name is the strongest element; priority and due date sit top right; stage uses the stage chip; last interaction quote is set in the muted ink colour.
- Overdue: danger left border and "Overdue by 2 days". Completed: muted with a success check.
- "Log call" opens the activity dialog pre-filled with the customer.

### 7.5 UX quality bar (non-negotiable)
- Skeleton loaders for every list and card; never a blank screen or spinner-only page.
- Meaningful empty states with one clear action ("No leads yet. Add your first lead.").
- Every error is specific and tells the user what to do. Errors do not apologise.
- Button labels name the action ("Save lead", "Mark completed"); toasts reuse the same verb ("Lead saved").
- Destructive actions use a confirmation dialog that names the record.
- Fully keyboard accessible, visible focus rings, ARIA labels on icon-only buttons, colour contrast WCAG AA, `prefers-reduced-motion` respected.
- Motion only in response to action: dialog and drawer open/close (150–200ms ease-out), drag feedback, toast. **No scroll-triggered fade-ins, no hover lifts on every card.**
- Dark mode is a first-class theme, not an afterthought.
- Persist the sidebar state, theme and table filters in `localStorage`.
- Responsive and verified at 360px, 768px and 1280px.

---

## 8. Frontend architecture notes
- `services/api.js`: Axios instance with `baseURL = import.meta.env.VITE_API_URL`; request interceptor attaches `Authorization: Bearer <token>`; response interceptor clears the token and redirects to `/login` on `401`.
- `AuthContext`: `user`, `login`, `register`, `logout`, loading state; `ProtectedRoute` wrapper; fetch `/auth/me` on load.
- TanStack Query keys per resource; invalidate `dashboard`, `leads` and `followups` after relevant mutations.
- Shared constants in `lib/constants.js`: `STAGES`, `ALLOWED_TRANSITIONS` (same table as the server), `PRIORITIES`, `ACTIVITY_TYPES`.
- Reusable `StageChip`, `PriorityChip`, `Avatar`, `EmptyState`, `ConfirmDialog`, `DataTable`, `PageHeader`, `ContextFollowUpCard`.
- Format currency as INR (`en-IN`), dates with date-fns, relative times ("2 days ago").

---

## 9. Seed data (`npm run seed`)
Create the demo user `demo@smartcrm.com` / `Demo@123` (name "Pragati GP") and realistic Indian small-business data: 24 leads across all stages, 8 customers, 10 opportunities, 40 activities spread over the last 8 weeks, 12 follow-ups (some overdue, some due today, some upcoming, a few completed). Must include this exact example:

- Lead **Arjun Kumar**, company "Kumar Interiors", stage **Proposal**, last activity `Meeting: Quotation discussed with the customer`, follow-up "Call to check whether the quotation is acceptable", priority High, due today.

Seeding is idempotent (clears only the demo user's data first).

---

## 10. Security checklist
bcrypt hashing; JWT verified on every protected route; ownership filter on every query; zod validation on every body/query; Mongoose schema enums; mongo-sanitize; helmet; CORS restricted; rate limit on auth; body size limit; central error handler hiding internals; secrets only in `.env`; `.env` in `.gitignore`; regex search inputs escaped.

---

## 11. Testing (must pass before finishing)
Backend tests (Jest + Supertest + mongodb-memory-server) must cover **exactly these 16 cases**, named with these numbers (the project report lists them):

1. Register with a new e-mail creates a user; password stored only as a hash
2. Register with an existing e-mail returns 400
3. Login with valid credentials returns token and user
4. Login with a wrong password returns 401
5. Protected route without a token returns 401
6. Create a lead with a name and no contact detail returns a validation error
7. Create a lead with valid data saves it in New Lead stage
8. Move a lead from New Lead to Proposal returns 400
9. Mark a lead Contacted with no activity returns 400
10. Move a Proposal lead to Won sets the stage and creates a customer
11. Read another user's lead by id returns 404
12. Schedule a follow-up for a lead stores stage and last interaction
13. Fetch follow-ups after the due date shows the pending item as Overdue
14. Mark a follow-up completed sets status Completed
15. Dashboard counts and stage distribution match the data
16. (Frontend/manual) Layout adapts at phone width; navigation stays usable

Print a results table at the end of `npm test` and save it to `docs/TEST_RESULTS.md` (test name, PASS/FAIL). Case 16 is verified with Vitest component tests plus a manual checklist in `docs/TEST_RESULTS.md`.

---

## 12. Scripts and environment

Root `package.json`: `dev` (backend + frontend with concurrently), `seed`, `test`, `lint`, `build`.

`backend/.env.example`
```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/smart_crm_db
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```
`frontend/.env.example`
```
VITE_API_URL=http://localhost:5000/api
```

---

## 13. Documentation and GitHub readiness
- `README.md`: product pitch, feature list, tech stack, screenshot placeholders (`docs/screenshots/*.png`), local setup in 5 steps, demo credentials, scripts, API summary link, deployment guide, licence (MIT).
- `docs/API.md`, `docs/DECISIONS.md`, `docs/TEST_RESULTS.md`.
- Meaningful commits per phase using Conventional Commits (`feat:`, `fix:`, `test:`, `docs:`).
- Repo name: `FSD-Project_Smart_CRM`. Author: Pragati GP.
- Deployment notes: backend on Render or Railway, frontend on Vercel or Netlify, database on MongoDB Atlas (free tier). Include `render.yaml` or clear step-by-step instructions, and a SPA fallback (`vercel.json` rewrite).

---

## 14. What the human must provide (do not invent these)
1. `MONGO_URI` — local MongoDB, or a free MongoDB Atlas connection string.
2. `JWT_SECRET` — any long random string.
No other API keys are needed. If you believe another is needed, stop and ask.

---

## 15. Build order (stop after each phase, run the app, fix errors, commit)
1. **Phase 1 — Backend foundation:** project setup, db connection, User model, register/login/me, auth middleware, error handler, tests 1–5.
2. **Phase 2 — Core resources:** Lead, Customer, Opportunity, Activity models and routes with ownership checks, validation, pagination, tests 6–11.
3. **Phase 3 — Follow-ups and dashboard:** FollowUp context logic, overdue update, dashboard aggregation, tests 12–15.
4. **Phase 4 — Seed script and API docs.**
5. **Phase 5 — Frontend foundation:** Vite, Tailwind tokens (light + dark), shadcn/ui, Geist font, app shell, routing, auth pages, Axios + Query setup.
6. **Phase 6 — Pages:** Dashboard, Leads (+ drawer and detail), Customers, then Pipeline, Activities, Follow-ups (with the Context Follow-Up Card), Settings, command palette.
7. **Phase 7 — Polish:** empty/loading/error states, responsive pass at 360/768/1280px, accessibility pass, dark-mode pass, frontend tests.
8. **Phase 8 — Docs and release:** README, screenshots instructions, `docs/TEST_RESULTS.md`, lint clean, production build succeeds.

## 16. Definition of done
- `npm run dev` starts both apps; `npm run seed` loads demo data; login works with the demo account.
- All 16 test cases pass and are listed in `docs/TEST_RESULTS.md`.
- The signature workflow works end to end: add lead, log an interaction, move through the pipeline to Won (customer created), schedule a follow-up that shows its context, mark it completed, see the dashboard update.
- No emojis, no console errors, no unused dependencies, lint clean, production build passes.
- Looks and feels like a polished SaaS product in both light and dark mode on desktop and phone.
