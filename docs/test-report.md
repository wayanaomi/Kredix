# Kredix — Test Report

## Automated checks

| Check | Command | Result |
|---|---|---|
| Type checking | `npm run typecheck` | ✅ Pass, 0 errors |
| Linting | `npm run lint` | ✅ Pass, 0 errors/warnings |
| Production build | `npm run build` | ✅ Succeeds — 47 routes compiled (static + dynamic) |
| Unit tests | `npm run test` (Vitest) | ✅ 7/7 passed (`tests/money.test.ts`, `tests/financing-transitions.test.ts`) |

Unit tests currently cover pure logic only (money/kobo conversion, financing status state
machine). Business-logic modules that require a database (`src/lib/scoring`,
`src/lib/recommendations`, `src/lib/passport`) were verified manually end-to-end (below) rather
than with mocked-DB unit tests, given the time available — this is a documented gap.

## Manual end-to-end verification (dev server + browser automation + curl)

All of the following were exercised against a running local instance with the seeded admin and
lender accounts plus one freshly registered SME account, and passed:

### Journey 1 — New SME (✅ passed)
Landing page → Register → Dev-mode OTP verify → Business profile → Storefront slug + theme →
Add product → Publish → Shop link + WhatsApp share link generated. Confirmed via screenshots and
accessibility snapshots at each step.

### Journey 2 — Customer purchase (✅ passed)
Public storefront (`/store/adaeze-fabrics`) → Add to cart → Checkout → Mock PSP redirect →
"Simulate successful payment" → Server-side webhook verification → Exactly **one** `Transaction`
row created, keyed uniquely to the `Order.id` (confirmed via direct DB query). Order status
correctly flips `PENDING → PAID`. Confirmed a failed/cancelled outcome does **not** create a
transaction (code-level: `Payment.status="FAILED"` path never calls `transaction.create`).

### Journey 3 — Offline sale / idempotent sync
Implemented and code-reviewed (`src/lib/offline/queue.ts`, `/api/ledger/sync`); the IndexedDB
queue, manual retry button, and unique-`clientTxnId` idempotency were verified by reading the
code path and the Prisma unique constraint, and by exercising `/api/ledger/sync` directly.
**Not** exercised with an actual simulated offline/online browser network transition in this
session — documented as a gap below.

### Journey 4 — Business intelligence (✅ passed)
Recorded transactions → dashboard correctly showed "insufficient data" honest states for
recommendations/score below the 5-transaction/14-day threshold → after adding qualifying
transaction history (dev-only backdated fixtures, deleted after verification — see
`docs/assumptions.md` for why this was necessary to demonstrate the eligible path without
waiting 14 real days), the dashboard correctly displayed: revenue trend chart, best-selling
products, a grounded recommendation citing real data, and an explainable 69/100 Business Health
Score with five labelled, weighted factors and plain-language explanations.

### Journey 5 — Financial Passport (✅ passed)
Generated Passport with correct evidence labels (`SELF_DECLARED` vs `SYSTEM_CALCULATED`) →
PDF download endpoint returns a valid `application/pdf` response → consent checkbox required
before "Create share link" is accepted → secure share link resolved correctly on a separate,
unauthenticated browser tab → **revoked** the share via the API → confirmed the same link
immediately returned "This share link has been revoked by the business owner." and the access
attempt was logged to `PassportAccessLog` with `outcome: "DENIED_REVOKED"`.

### Journey 6 — Financing (✅ passed)
Submitted a financing application with consent (via API) → received a unique reference
(`KRX-XXXXXXXX`) → Admin saw the application and assigned it to the seeded demo lender →
Lender portal showed **only** that lender's own referral plus the business's Passport data →
Lender transitioned `SUBMITTED → UNDER_REVIEW` (succeeded) → attempted `UNDER_REVIEW →
DISBURSED` directly (correctly **rejected** with "Cannot transition from UNDER_REVIEW to
DISBURSED").

### Journey 7 — Lender security (✅ passed)
Confirmed the SME owner's own session receives `403 Forbidden` ("You do not have permission to
perform this action") when calling `/api/lender/referrals`, proving role-based access control is
enforced server-side, not just hidden in the UI.

### Journey 8 — Administration (✅ passed)
Admin logged in, viewed the SME account and its product/transaction counts, assigned a lender
referral, and all three admin actions (`FINANCING_APPLICATION_SUBMITTED` is owner-initiated;
`REFERRAL_ASSIGNED` and `FINANCING_STATUS_UPDATED` are admin/lender-initiated) appeared correctly
in the audit log with actor, role, action, entity, and timestamp — and **without** any sensitive
payload (passwords, tokens) in the `metadataJson` field.

### Journey 9 — Security (partially verified)
- ✅ Unrelated-role access (SME owner hitting lender-only API) → `403`.
- ✅ Revoked Passport share link → denied + logged.
- ✅ Invalid financing status transition → rejected with a clear error.
- ✅ **Found and fixed during this testing pass**: `/api/admin/audit` and
  `/api/admin/businesses` were returning the full `User` record (including `passwordHash`) in
  the `actor`/`owner` relation. Both were changed to explicit Prisma `select` clauses excluding
  `passwordHash`/session-sensitive fields. Re-verified after the fix.
- ⬜ Not exercised in this session: duplicate webhook delivery (would require manually replaying
  the same `providerReference` to `/api/payments/webhook` twice — the idempotency guard was
  code-reviewed and relies on the same `payment.status !== "PENDING"` early-return plus the
  unique `Transaction.orderId` constraint, but was not independently fuzzed/replayed in this
  session).

## Known limitations / outstanding work

- No Playwright E2E test suite was authored (see `docs/developer-tooling.md` for rationale);
  the journeys above were verified via a combination of live browser automation and direct API
  calls instead of a committed, repeatable test script.
- Business-logic unit tests (`scoring`, `recommendations`, `passport`) need a test database
  setup (e.g. a throwaway SQLite file per test run) to be unit-testable without hitting the dev
  database — not implemented in this session.
- Offline/online browser transition (Journey 3) was verified by code review and direct API
  idempotency testing, not a live network-toggle browser test.
- A cosmetic React "missing key" console warning appears on the analytics page, originating from
  Recharts' internal `XAxis`/`YAxis` tick rendering, not from Kredix's own `.map()` calls (all of
  which have keys) — does not affect functionality or user-visible output.
