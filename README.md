# Plum Guide — Curation, Inspections & Bookings

A full-stack demonstration of the operational platform behind Plum Guide's
"top 3% of homes": specialist **Plum Test** inspections, host availability
management, atomic guest bookings, automated cancellation refunds and four
role-based portals.

Built with **Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS ·
Prisma 6 · Cloudflare D1**, with bcrypt password hashing and signed, HTTP-only
session cookies. Prisma talks to D1 through its driver adapter, and a per-night
ledger makes overlapping reservations impossible at the database level.

---

## Live demo

A deployed build runs on Cloudflare Workers (D1 + OpenNext):

- English: <https://site-ef110a907aa543e89a6159ea2358c1de.freebuff.page>
- The header carries an **EN | PT** switch; the choice is stored in a cookie and
the whole public site — collection, property pages, booking, confirmation and
invoice — renders in European Portuguese.

---

## Documentation

- [Presentation](docs/presentation.html) — a 16:9 HTML slide deck with a scripted demo, company research, tasks and the database model. Print with `Ctrl/Cmd + P` for a PDF handout.
- [User guide](docs/user-guide.html) — role-by-role instructions with screenshots, pricing and refund rules, and troubleshooting.
- [Project report](docs/report.html) — research and sources, requirements, technology justification, database design, interface decisions, AI tool use, testing and limitations.

The documents are self-contained: screenshots are embedded, so each file can be shared or printed on its own.

---

## 1. What's included

| Role | Portal | Capabilities |
| --- | --- | --- |
| **Guest** | `/dashboard/guest` | Upcoming trips, booking references, printable/downloadable invoices, self-service cancellation with refund preview, trip history |
| **Host** | `/dashboard/host` | Submit homes, schedule a Plum Test with an available specialist, manage a 365-day availability calendar with custom nightly prices, edit listing title/rate, track revenue and bookings |
| **Specialist** | `/dashboard/specialist` | Publish and withdraw inspection slots, view booked home inspections with host contact details, record Plum Test scores and notes |
| **Admin** | `/dashboard/admin` | Platform metrics, inspection review queue with approve/reject overrides, booking monitor, cancellation/refund overrides, member counts |

Public site: editorial landing page, searchable collection of approved homes,
property detail pages with live availability calendars and instant booking,
login/signup, confirmation and invoice pages.

### Core rules implemented

- **Plum Test:** a specialist records a score out of 100. **85 or above
  auto-approves** the property; below 85 it is rejected and referred to the
  curation team. Admins can override either outcome for inspected homes.
- **Availability:** a night is unavailable if the host closed it **or** a
  confirmed reservation covers it. Hosts can set a custom price per night.
- **Bookings:** the booking row and its reserved nights are written in one
  atomic D1 batch. A unique `(property_id, date)` index means two guests racing
  for the same dates produce exactly one confirmation and one friendly `409`.
  A trigger also rejects nights the host has closed.
- **Pricing:** `sum(nightly rates or custom prices) + €180 cleaning + 8% service
  fee`. All money is displayed in euros (EUR); the header carries a “Now in
  euros” announcement and the server recalculates and stores the authoritative
  total.
- **Cancellations:** 100% refund more than 14 days before check-in, 50% at
  7–14 days, 0% under 7 days. Calculated on the total paid, recorded in the
  `cancellations` table, and **every night is released back to the property
  calendar** in the same atomic batch.
- **Admin overrides:** refunds can be adjusted up to the booking total, marked
  as `admin_override`.
- **Languages:** English and European Portuguese, switched from the header
  (`EN | PT`). The locale lives in the `plum_locale` cookie so server
  components render the right language on first paint; every string is keyed
  in `src/lib/i18n.ts` and Portuguese falls back to English for any missing
  key. Prices are formatted per locale (`€1,240` in English, `1240 €` in
  Portuguese). Host, specialist and admin portal tables remain English.

---

## 2. Quick start (local, Node.js)

Requires **Node.js 22 LTS or newer** and npm (verified on Node 22.14 and npm 10.9).

```bash
npm install                 # also runs prisma generate
cp .env.example .env        # DATABASE_URL for the Prisma CLI; add AUTH_SECRET
npm run dev                 # http://localhost:3000
```

`next dev` starts a local Cloudflare D1 database through Wrangler using the
committed `freebuff.wrangler.jsonc`, creates the schema and seeds the demo data
on the first request. No separate database server is needed. Local data lives
in `.wrangler/state`; delete that folder to start from a clean database.

### Troubleshooting

- **`next dev` errors with `internal error; reference …` while opening D1** —
  the local Miniflare state is corrupt. Stop the server and delete `.wrangler/`
  (`rm -rf .wrangler` on macOS/Linux, `rmdir /s /q .wrangler` on Windows), then
  start `npm run dev` again; the schema and demo data are rebuilt automatically.
- **`prisma generate` fails during `npm install`** — run it on its own
  (`npx prisma generate`); no database is contacted.
- **Port 3000 already in use** — `npx next dev -p 3001`.
- **No homes render on a fresh install** — the first request seeds D1; reload
  the page once after the server reports “Ready”.

Generate a production-grade session secret with:

```bash
openssl rand -base64 32
```

### Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Guest | `guest@plumguide.com` | `Guest123!` |
| Host | `host@plumguide.com` | `Host123!` |
| Specialist | `specialist@plumguide.com` | `Specialist123!` |
| Admin | `admin@plumguide.com` | `Admin123!` |

Additional seeded accounts: hosts `rafael@plumguide.com` and
`ingrid@plumguide.com`, guest `noah@example.com`, specialists
`julian@plumguide.com` and `sofia@plumguide.com` (same role passwords).

The login screen has one-click demo account fillers. Specialist and admin
accounts are seeded rather than self-service — public signup creates **Guest**
or **Host** accounts.

### Suggested walkthrough

1. Sign in as the **host** → open *The Tuscan Farmhouse* (draft) → schedule a
   Plum Test using an open specialist slot.
2. Sign in as the **specialist** → open the audit form on the booked visit →
   record a score (try `92` for an automatic pass, `70` for a referral).
3. Sign in as the **admin** → review the inspection queue, approve/reject, and
   adjust a refund on the cancellations table.
4. Sign in as the **guest** → open a home, pick dates on the live calendar,
   confirm & pay, view the invoice, then cancel and watch the refund and
   calendar release.
5. Sign in as the **host** again → see the released dates and the booking.

### Useful scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Dev server on `0.0.0.0:3000` |
| `npm run build` | Prisma generate + production build |
| `npm start` | Serve the production build |
| `npm run typecheck` | TypeScript, no emit |
| `npm run db:seed` | Regenerate the local SQLite dataset used to build the D1 seed |
| `npm run db:export:d1` | Export that dataset to `src/lib/d1-seed-sql.ts` |
| `npm run db:migrate` | Apply SQLite migrations to `prisma/dev.db` (tooling only) |
| `npm run db:reset` | Rebuild the local SQLite dataset from scratch |

Seed data is anchored to the day it is run: 9 users, 13 homes (9 approved,
2 awaiting inspection, 1 rejected, 1 draft), 7 bookings including two
cancellations, 150 days of calendar rows per home, and 21 inspection slots
(completed, available and booked).

---

## 3. Architecture

```
prisma/
  schema.prisma          Relational model + indexes
  migrations/            SQLite baseline migration
  seed.mjs               Idempotent reset + realistic seed data
src/
  app/
    page.tsx             Editorial landing page
    properties/          Collection + property detail + booking widget
    bookings/[id]/       Confirmation + printable invoice
    login/ signup/       Auth screens
    dashboard/
      layout.tsx         Auth guard + role-aware navigation
      guest/ host/ specialist/ admin/
    api/                 JSON route handlers (bookings, properties,
                         availability, inspections, moderation, auth)
  components/            Design-system components + client workflows
  lib/
    auth.ts              bcrypt, JWT cookie sessions, requireUser/Role
    booking-service.ts   Transactional booking + cancellation
    availability.ts      Calendar projection (blocks + reservations)
    pricing.ts           Quotes, fees, refund tiers
    dates.ts             UTC calendar-date utilities
    constants.ts         Roles, statuses, 85-point pass mark
    prisma.ts            Lazy Prisma client on the D1 driver adapter
    d1.ts                D1 binding resolver + minimal binding types
    d1-bootstrap.ts      Idempotent schema, trigger and demo-data bootstrap
    d1-seed-sql.ts       Generated seed statements (from the SQLite dataset)
scripts/
  export-d1-seed.mjs     Exports prisma/dev.db into the D1 seed module
```

**Server components** read the database directly and render dashboards and
marketing pages. **Client components** handle calendars, modals, availability
editing and forms, calling route handlers that re-authorise every action and
recalculate every amount server-side.

### Authentication & authorisation

- Passwords: bcrypt (cost 10).
- Session: HS256 JWT in an HTTP-only, SameSite=Lax cookie (Secure in
  production), 7-day expiry.
- `getSession`, `requireUser` and `requireRole` for pages;
  `requireApiSession(roles)` for every mutating route.
- Ownership checks: guests can only cancel their own bookings; hosts can only
  edit their own listings and slots; specialists can only complete their own
  inspections; admins have explicit override endpoints.
- Booking, confirmation and invoice pages authorise the guest, the property
  host or an admin.

### Booking atomicity on D1

D1 does not support interactive transactions, and Prisma's D1 adapter runs
statements individually rather than as a transaction. The booking path therefore
uses a single **`db.batch()`**, which D1 executes atomically:

1. Validate dates, property status and host-closed nights (read checks).
2. Price each night (custom price or base rate), fees, total.
3. Insert the booking with a human reference (`PLM-XXXXXXXX`).
4. Insert one `booking_nights` row per night. The unique
   `(property_id, date)` index rejects an overlapping reservation, and a
   trigger rejects a night the host has closed. Any conflict rolls the whole
   batch back, so no partial booking survives.

Cancellation uses the same pattern: update the booking, insert the unique
cancellation record, delete its night ledger rows and release calendar dates in
one batch. A second cancellation fails on the unique `cancellations.booking_id`
index and returns `409`. There is a bounded retry for the unlikely reference
collision.

> SQLite has no native enum type in Prisma, so enum columns are `String` and
> validated in the domain layer (`src/lib/constants.ts`). All date-only fields
> are stored as UTC midnight to avoid timezone drift.

---

## 4. Pages & API

| Page | Purpose |
| --- | --- |
| `/` | Landing page, Plum Test story, featured homes |
| `/properties` | Approved collection with `?q=` search and `?sort=` |
| `/properties/[id]` | Full detail, inspection report, live booking calendar |
| `/bookings/[id]/confirmation` | Instant confirmation, reference, refund summary |
| `/bookings/[id]/invoice` | Print/PDF invoice (browser print dialog) |
| `/login`, `/signup` | Auth, with safe `next` redirects |
| `/dashboard/{guest,host,specialist,admin}` | Role portals |

| Method & route | Access | Purpose |
| --- | --- | --- |
| `POST /api/auth/signup` | Public | Create guest/host, start session |
| `POST /api/auth/login` | Public | Sign in |
| `POST /api/auth/logout` | Session | Clear cookie |
| `POST /api/bookings` | Session | Transactional reservation |
| `POST /api/bookings/[id]/cancel` | Owner or admin | Cancel + refund + release |
| `POST /api/properties` | Host | Submit a draft listing |
| `PATCH /api/properties/[id]` | Owner or admin | Update title / nightly rate |
| `POST /api/properties/[id]/availability` | Owner or admin | Open/close a night, custom price |
| `POST /api/properties/[id]/inspection-request` | Owner | Claim a specialist slot |
| `POST /api/specialist/slots` | Specialist | Publish a slot |
| `DELETE /api/specialist/slots/[id]` | Owner | Withdraw an unclaimed slot |
| `POST /api/specialist/inspections/[id]` | Owner or admin | Score + notes, auto-approve ≥85 |
| `POST /api/admin/properties/[id]/moderate` | Admin | Approve/reject inspected home |
| `POST /api/admin/cancellations/[id]/override` | Admin | Adjust refund |

All mutations return JSON errors with appropriate `400/401/403/404/409` codes.

---

## 5. Database

Entities and relationships follow the brief:

`users` → properties (host), bookings (guest), inspection slots (specialist),
cancellations (cancelled_by); `properties` → availability calendars, bookings,
inspection slots; `bookings` → cancellation (1:1).

Additional operational columns: booking `reference`, price breakdown
(`nightly_subtotal`, `cleaning_fee`, `service_fee`), slot `score` /
`completed_at`, cancellation `refund_percent` / `admin_override`, and property
marketing details (`tagline`, `description`, bedrooms, bathrooms, guests).

The `booking_nights` ledger stores one row per reserved night. Its unique
`(property_id, date)` index is the database guarantee against double booking;
`cancellations.booking_id` is unique too. Indexes cover property status, host,
guest, booking dates and slot date/status.

### D1 schema and demo data

A deployed D1 database starts empty and the platform does not expose arbitrary
SQL to the deployer, so the Worker initialises itself on first use. On the first
query, `src/lib/d1-bootstrap.ts`:

1. Checks a `plum_meta` marker (one indexed read on every later isolate).
2. Creates the tables and indexes with `CREATE ... IF NOT EXISTS`.
3. Loads `SEED_STATEMENTS` when `users` is empty (every statement is
   `INSERT OR IGNORE`, so concurrent cold starts are harmless).
4. Creates the `booking_nights_closed_guard` trigger and writes the marker.

Local D1 data persists in `.wrangler/state`. The demo dataset is authored in
`prisma/seed.mjs` against a local SQLite file, then exported to D1 SQL:

```bash
npm run db:seed          # rebuild prisma/dev.db with realistic data
npm run db:export:d1     # regenerate src/lib/d1-seed-sql.ts
```

### Changing the schema

Update `prisma/schema.prisma`, then mirror the change in the DDL inside
`src/lib/d1-bootstrap.ts` and bump `SEED_VERSION`. Regenerate the client with
`npx prisma generate`. The committed SQLite migrations remain useful for the
seed authoring database, not for the deployed D1 database.

---

## 6. Production deployment

The app targets **Cloudflare Workers through Freebuff Sites**, where D1 is
provided as a managed binding. The Next.js adapter (OpenNext) builds the Worker.

### Freebuff Sites (recommended)

1. Create a site and provision a D1 database with the binding name `DB`.
2. Add `AUTH_SECRET` under **Sites → Secrets** (32+ random bytes, e.g.
   `openssl rand -hex 32`). Never put it in `NEXT_PUBLIC_*`.
3. Run the Next.js preparation step (`sites_prepare_next` in Freebuff), which
   installs the supported OpenNext/Wrangler versions and builds
   `freebuff-sites-build/manifest.json`.
4. Deploy that manifest to the preview or production environment.
5. The first request applies the schema and demo data automatically.

`freebuff.wrangler.jsonc` is generated for local development and is regenerated
when publishing; keep it in the repo so `npm run dev` can provide the D1 binding.

### Other runtimes

A Node server (`npm run build && npm start`) still works for UI review, but it
needs a D1 binding via Wrangler and is not the deployment target. A hosted
Postgres variant would require replacing the D1 adapter and the raw booking
batches with Prisma transactions; the SQLite `DATABASE_URL` is only used by the
database tooling.

### Production checklist

- Strong `AUTH_SECRET` stored as a platform secret, HTTPS-only cookies
  (automatic in production).
- Keep the D1 binding named `DB`; the adapter and bootstrap depend on it.
- Seed only if you intend to demo; remove `SEED_STATEMENTS` to ship an empty
  database (the schema still bootstraps).
- Replace the simulated payment step with a real provider (Stripe) and keep the
  booking transaction as the single source of truth.
- Add rate limiting to auth and booking endpoints at the edge/CDN.
- Add transactional email for confirmations, cancellations and inspection
  results.

---

## 7. Design system

- **Palette:** charcoal ink `#16130E`, warm cream `#FAF7F0`, paper `#FFFDF8`,
  antique gold `#A98554`, hairline `#E4DCCB`, moss green for approvals,
  amber for in-progress, wine for destructive/rejected states.
- **Type:** Fraunces (display serif) + Inter (UI sans), loaded from Google
  Fonts with system fallbacks.
- **Status language:** green *Plum Approved*, amber *Inspection scheduled*,
  red *Not approved*, neutral *Draft*; matching tones for bookings and slots.
- **Accessibility:** skip link, landmarks, labelled form fields, `role="alert"`
  error regions, `aria-live` quote updates, `aria-pressed` calendar dates,
  visible focus rings, high-contrast text, keyboard-dismissible modal with focus
  trap and Escape handling. Designed against WCAG AA; run an automated audit
  before a production launch.
- **Destructive actions:** cancellation uses an explicit modal with a refund
  preview and reason; admin rejection uses an inline two-step confirmation.

---

## 8. Verified workflows

Exercised against the running app over HTTP during the build:

- Guest login, role redirects, and 403/404 authorisation boundaries.
- Concurrent booking requests for identical dates → one `201`, one `409`, one
  database row.
- Confirmation and invoice pages for the booking owner.
- Cancellation at >14 days → 100% refund; at 7–14 days → 50%; repeat cancel →
  `409`; calendar nights released to `is_available = true`.
- Booking rejected for a host-closed night, past check-in and invalid range.
- Host availability update + custom price; refusal to reopen a reserved night;
  cross-host access denied.
- Host inspection request, specialist completes at 92 → auto-approved; at 70 →
  rejected; admin override → approved.
- Specialist slot publish/withdraw; admin refund override capped at the booking
  total; validation errors surfaced in the UI.
- The complete suite was re-run inside local workerd against a fresh D1
  database, and the booking, confirmation, invoice and cancellation paths were
  repeated against the published preview.

## 9. Known limitations

- Payments and confirmation emails are simulated (no card is charged).
- Invoice "download" uses the browser's print-to-PDF dialog.
- Listing photography is chosen from curated stock images, not uploaded.
- No background jobs; cancellation refunds are DB records awaiting a payment
  provider integration.
- Demo accounts intentionally share simple passwords — never use them in
  production.
- UI rendering was verified by HTTP responses and the DOM; a hands-on browser
  and assistive-technology pass is still recommended before a public launch.
