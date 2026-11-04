# Kredix — Data Model

All identifiers are CUIDs. All monetary columns are **integer minor units (kobo)** — never
floating point — named `*Minor` with a sibling `currency` column (default `"NGN"`). Enum-like
columns are modelled as validated `String` (see `docs/architecture.md §2` for why, given the
SQLite dev datasource) with allowed values documented in Prisma schema comments and enforced by
Zod enums in `src/lib/enums.ts`.

Full source of truth: [`prisma/schema.prisma`](../prisma/schema.prisma).

## Entity overview

| Entity | Purpose | Key constraints |
|---|---|---|
| `User` | Account for SME owners, lenders, admins | unique `email`, unique `phone`, `role` |
| `VerificationRecord` | OTP verification codes | expiry, attempt count, consumed timestamp |
| `Session` | Server-persisted session tokens | unique `tokenHash` (raw token never stored) |
| `Business` | SME business profile | 1 owner (`User`), onboarding step tracker |
| `Storefront` | Public storefront config | unique `businessId` (1:1), unique `slug` |
| `Product` | Catalogue item | non-negative `priceMinor`, soft delete via `deletedAt` |
| `InventoryMovement` | Stock ledger per product | `reason`: SALE / RESTOCK / ADJUSTMENT |
| `Customer` | Buyer identity (guest-friendly) | optional contact fields |
| `Order` | Checkout order | unique `reference`, `status` state machine |
| `OrderItem` | Line item | FK to `Order`, `Product` |
| `Payment` | PSP payment attempt | unique `orderId` (1:1), unique `providerReference` |
| `Transaction` | **The sales ledger** — single source of truth for revenue | unique `orderId` (nullable, online sales), unique `clientTxnId` (nullable, offline/manual idempotency key) |
| `Expense` | Manually recorded cost | used for margin/profit signals where available |
| `BusinessHealthScore` | Versioned score snapshot | `eligibility`, `factorsJson` (explainability) |
| `Recommendation` | Deterministic insight | `dataJson` cites the supporting figures |
| `FinancialPassport` | Generated passport snapshot | unique `businessId` (1:1) |
| `PassportShare` | Revocable/expiring share link | unique `tokenHash`, `expiresAt`, `revokedAt` |
| `PassportAccessLog` | Every access attempt to a share link | `outcome` |
| `ConsentRecord` | Consent for sharing/financing | `type`, `grantedAt`/`revokedAt` |
| `FinancingApplication` | Loan/financing request | unique `reference`, `status` state machine |
| `Lender` | Partner lender org + optional portal login | unique `userId` (1:1 to a `User` with role LENDER) |
| `LenderReferral` | Application routed to a lender | unique `[applicationId, lenderId]` |
| `ApplicationStatusHistory` | Immutable audit trail of status changes | append-only |
| `Notification` | Outbound SMS/WhatsApp/email record | `status` incl. `SKIPPED_NO_PROVIDER` |
| `AuditLog` | Sensitive-action audit trail | actor, action, entity, timestamp (no sensitive payloads) |

## Ledger integrity rules

1. **Exactly one completed ledger `Transaction` per online order.** `Transaction.orderId` is
   `@unique`; the row is only created inside the same DB transaction that flips
   `Payment.status` to `SUCCESS` from a server-verified callback — never from client redirect
   state. Duplicate webhook delivery is a no-op because of the unique constraint.
2. **Exactly one ledger `Transaction` per offline/manual sale**, keyed by a client-generated
   `clientTxnId` (`@unique`). Re-POSTing the same offline sale after a retry is idempotent.
3. Revenue, average sale value, and trends are always computed from `Transaction`, never from
   `Order` (which can be `PENDING`/`FAILED`/`CANCELLED`) or from client-supplied totals.
4. Expenses are tracked separately; the dashboard never labels revenue as profit. Margin figures
   are only shown when both revenue and expense data exist for the same period, with an explicit
   "estimated" label.

## Deferred / simplified for MVP

- `BusinessMembership` (multi-owner/staff accounts) — single `Business.ownerId` only; see
  `docs/assumptions.md`.
- `BusinessMetricSnapshot` materialised table — analytics are computed on-demand from
  `Transaction`/`Expense` at request time rather than pre-aggregated, acceptable at MVP data
  volumes; documented as a future optimisation in `docs/implementation-plan.md`.
