# Kredix — Implementation Plan

## Phase 1 — Discovery & requirements ✅
Workbook parsed (`docs/source-materials/`), brand assets reviewed, traceability matrix created
(`docs/requirements-traceability.md`), architecture decided (`docs/architecture.md`).

## Phase 2 — Foundation
- Brand config (`src/lib/brand.ts`), Tailwind design tokens (`src/app/globals.css`).
- Prisma schema + SQLite dev datasource + seed script (admin + demo lender account only, no
  fabricated business/transaction data — see section 10 of the master prompt).
- `src/lib/env.ts` — validated environment schema.
- Auth: register/login/logout/OTP-verify, session cookies, RBAC guard helpers.
- Global layout, nav, empty-state and error-boundary components.

## Phase 3 — SME core journey
- Business onboarding wizard (multi-step, resumable via `Business.onboardingStep`).
- Storefront builder + public storefront route + slug uniqueness + publish flow.
- Product CRUD with image upload, availability, inventory quantity.
- Share-link component (copy + WhatsApp intent link).

## Phase 4 — Transactions
- Checkout flow + mock PSP adapter + server-verified webhook + idempotent ledger write.
- Manual sale entry form.
- IndexedDB offline queue (`idb`), online/offline indicator, manual retry, background
  `online` event listener, idempotent `/api/ledger/sync` endpoint.

## Phase 5 — Business intelligence
- Analytics aggregation functions over `Transaction`/`Expense` with date-range filters.
- Deterministic recommendation engine with explicit "insufficient data" states.
- Business Health Score engine + methodology doc + eligibility gate.
- Financial Passport generation, detail view, PDF export, consent + share-link + access log +
  revocation.

## Phase 6 — Financing
- Financing application form + consent step + referral creation + reference number.
- Status tracker (owner-facing) with the five canonical states.
- Lender portal: login, referral queue (isolated by lender), passport review, status update
  with audit + SME notification trigger.
- Admin dashboard: SME search, business status, referral management, audit log viewer.

## Phase 7 — Notifications & hardening
- Notification adapter interface + dev/no-op adapter + templates for verification,
  application-status changes, and summaries.
- Rate limiting on auth/OTP routes.
- Responsive pass (mobile-first), accessibility pass (labels, focus states, contrast).
- Audit logging wired into every admin/lender/passport-share mutation.

## Phase 8 — Verification
- Vitest unit/integration tests for: auth, ledger idempotency, scoring, recommendations,
  passport sharing/revocation, financing status transitions, RBAC isolation (lender/admin).
- `npm run lint`, `npm run typecheck`, `npm run build`.
- Update `docs/requirements-traceability.md` and `docs/test-report.md` with real results.

## Deferred / fast-follow (explicitly out of this engagement's scope)

- Real PSP/SMS/WhatsApp/AI provider integration (needs credentials — adapters are ready).
- Scheduled/cron-based notification sending (needs a worker/scheduler, e.g. a queue + cron
  deployment target — out of scope for a single Next.js app without infra provisioning).
- Multi-owner `BusinessMembership`.
- Playwright E2E browser tests (see `docs/developer-tooling.md`).
