# Kredix — Architecture

## 1. Stack

| Concern | Choice | Why |
|---|---|---|
| Framework | Next.js (App Router), React, TypeScript (strict) | Required default architecture; single deployable for SSR pages, API routes, and server actions |
| Styling | Tailwind CSS v4 | Required default; design tokens map directly to the Kredix palette (see `src/lib/brand.ts`, `src/app/globals.css`) |
| ORM / DB | Prisma, **SQLite in this environment** | No local PostgreSQL/Docker was available (see `docs/assumptions.md`). Schema is written to be Postgres-portable |
| Validation | Zod | Runtime validation for all mutation inputs (forms + API routes) |
| Auth | Custom session-cookie auth (bcrypt + server-persisted session tokens) | Full control over RBAC (SME owner / lender / admin) and the `Session`/`VerificationRecord` entities required by the workbook; avoids pulling in a heavier auth framework for an MVP |
| Offline persistence | IndexedDB via `idb` | Required for the offline sales queue |
| Charts | Recharts | Dashboard revenue/trend visualisation |
| PDF export | `@react-pdf/renderer` | Financial Passport PDF |
| Tests | Vitest (unit/integration) | Established, fast, works well with Next.js/TypeScript |

## 2. Why SQLite, and the Postgres migration path

Execution Rule F requires inspecting DB connectivity before choosing migration commands, and
section 6 says "do not assume a local PostgreSQL server exists." Neither `psql`, `postgres`,
`pg_ctl`, nor `docker` were present in this environment. SQLite lets the whole application run
and be tested with zero external services.

To move to Postgres for production:

1. Provision a Postgres instance (e.g. managed Postgres, Supabase, RDS, Azure Database for
   PostgreSQL) and set `DATABASE_URL` accordingly.
2. In `prisma/schema.prisma`, change `datasource db { provider = "sqlite" }` to
   `provider = "postgresql"`.
3. Optionally convert the documented enum-like `String` columns (see comments above each model)
   into real Prisma `enum` blocks — SQLite does not support native enums, Postgres does.
4. Run `npx prisma migrate dev --name init` against the new database and redeploy.
5. Monetary columns are already integer minor units (kobo) and need no change; they remain
   exact-integer regardless of provider.

## 3. Domain modules (`src/`)

```
src/
  app/                     Next.js App Router routes (pages + API routes)
    (marketing)/           Public landing page
    (auth)/                Register / login / verify
    onboarding/            Business profile setup wizard
    dashboard/             Authenticated SME app shell
      storefront/          Storefront builder
      products/            Product & inventory management
      ledger/              Sales ledger (manual + offline)
      analytics/           Dashboard & recommendations
      passport/            Financial Passport
      financing/           Financing applications
    store/[slug]/          Public storefront + checkout
    lender/                Lender portal (role-protected)
    admin/                 Admin dashboard (role-protected)
    api/                   Route handlers (REST-style JSON API consumed by the app)
    p/[token]/             Public, consent-gated Passport share view
  lib/
    auth/                  Session issuance/verification, password hashing, RBAC guards
    brand.ts               Centralised brand configuration
    db.ts                  Prisma client singleton
    money.ts                Integer-minor-unit money helpers + NGN formatting
    validation/            Zod schemas
    scoring/               Business Health Score engine (deterministic)
    recommendations/       Recommendation engine (deterministic)
    passport/              Passport generation + share-token logic
    payments/              PSP adapter interface + mock/dev adapter
    notifications/         SMS/WhatsApp adapter interface + dev adapter
    offline/                IndexedDB queue + sync client logic
    audit.ts               Audit log writer
  components/              Shared UI (buttons, cards, nav, charts, empty states)
```

## 4. Request flow & security boundaries

- All server-side mutations (API routes/server actions) re-check:
  1. a valid session exists,
  2. the session's user role is permitted for the action,
  3. for business-scoped resources, the authenticated user **owns** the business
     (`Business.ownerId === session.userId`) — never inferred from client-supplied IDs alone.
- Lender routes additionally filter all queries by `LenderReferral.lenderId` derived from the
  lender's own session (`Lender.userId`), never from a client-supplied lender ID.
- Admin routes require `role === "ADMIN"`; there is no UI path or API for a user to self-grant
  this role — it can only be set directly in the database/seed script.
- Passport share links are resolved by hashing the supplied token and looking up
  `PassportShare.tokenHash`; expiry and revocation are checked server-side on every access, and
  every access attempt is written to `PassportAccessLog`.

## 5. Payments

`src/lib/payments/types.ts` defines a `PaymentProvider` adapter interface
(`initiate`, `verify`). The default adapter (`MockPaystackAdapter`) simulates a PSP redirect and
**local-only** webhook callback for development and demonstration — it is not a real payment
rail and cannot move real money. A `providerConfigured` flag is derived from environment
variables; when false, checkout clearly shows an "Online payments are not yet configured"
state and falls back to manual/offline sale recording, never a fabricated success.

Order completion is a two-step, DB-transactional process: `Payment.status` is only flipped to
`SUCCESS` from a server-verified callback, and the matching `Transaction` ledger row is created
in the same DB transaction, keyed uniquely by `Order.id` (`Transaction.orderId @unique`) to make
reconciliation idempotent against duplicate webhook delivery.

## 6. Offline sales sync

Each offline sale recorded while the browser is offline (or deliberately as a manual sale) is:

1. Written to IndexedDB with a client-generated UUID (`clientTxnId`) and `status: "pending"`.
2. Queued for sync; a background listener fires on `window.ononline` and a manual "Retry sync"
   button is always available (Rule: "never promise background sync the browser can't
   guarantee").
3. POSTed to `/api/ledger/sync`, which upserts on the **unique** `Transaction.clientTxnId` —
   replays of the same `clientTxnId` are no-ops, guaranteeing idempotency.
4. On success, the IndexedDB record is marked `synced`; on failure it stays `pending` with an
   error reason and is retried without duplicating the entry.

## 7. Deterministic intelligence (scoring & recommendations)

No AI/LLM provider was configured in this environment. Per Rule C.4 and AC-AI-02, both the
Business Health Score and the recommendation engine are implemented as **deterministic,
rule-based calculations over persisted ledger/business data** (`src/lib/scoring`,
`src/lib/recommendations`), not calls to a generative model. Every output cites the specific
data and period it is derived from. See `docs/scoring-methodology.md`.

## 8. Notifications

`src/lib/notifications` defines a provider-agnostic `NotificationAdapter` interface for SMS and
WhatsApp. With no provider credentials configured, notifications are recorded with
`status: "SKIPPED_NO_PROVIDER"` and are visible in an (admin-only) notification log, never
silently dropped and never falsely marked as delivered.
