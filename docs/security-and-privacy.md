# Kredix — Security & Privacy

## Scope

Kredix processes personally identifying SME owner data, business financial records, and (via
the lender portal) financing-decision data. This document describes the implemented technical
controls and the remaining legal/operational work needed for full Nigeria Data Protection Act
(NDPA) / NDPC readiness. **Implementing these controls does not, by itself, constitute legal
certification or compliance** — that requires a data protection officer, a registered DPO filing
with the NDPC (where applicable), and legal review of the Privacy Policy/Terms.

## Implemented technical controls

| Control | Implementation |
|---|---|
| Password storage | bcrypt, cost factor 12, never logged |
| Session management | Random 256-bit session tokens; only the SHA-256 hash is persisted (`Session.tokenHash`); httpOnly, `SameSite=Lax`, `Secure` (in production) cookies; server-side expiry check on every request |
| RBAC | Role check (`SME_OWNER` / `LENDER` / `ADMIN`) + resource-ownership check on every mutating route; see `src/lib/auth/guard.ts` |
| Business ownership isolation | Every business-scoped query filters by `Business.ownerId = session.userId`, never trusts a client-supplied business ID alone |
| Lender data isolation | Every lender-portal query filters `LenderReferral.lenderId` by the authenticated lender's own `Lender.id`, derived server-side from session, never from the URL/payload |
| Admin isolation | `role === "ADMIN"` only; no self-service role elevation endpoint exists anywhere in the API surface |
| Input validation | Zod schemas validate every mutation payload server-side (never trust client-side validation alone) |
| Injection protection | Prisma parameterised queries everywhere; no raw SQL string interpolation |
| XSS protection | React's default output escaping; no `dangerouslySetInnerHTML` with unsanitised user input |
| CSRF | `SameSite=Lax` cookies + same-origin fetches from the app's own API routes; state-changing routes are `POST`/`PATCH`/`DELETE` only (never `GET`) |
| IDOR protection | All object lookups re-check ownership/role after fetch, not just existence |
| File upload validation | Image uploads are restricted to an allow-listed MIME/type + size limit; rejected uploads return a clear error rather than silently failing |
| Share-link security | Passport share tokens are 256-bit random values; only their hash is stored; every access is checked for expiry/revocation and logged to `PassportAccessLog` |
| Consent tracking | `ConsentRecord` is required (and checked server-side) before any Passport share or financing referral is created |
| Audit logging | `AuditLog` records actor, role, action, entity type/id, and timestamp for all sensitive admin/lender/passport-share actions — never full request/response payloads or secrets |
| Secrets management | All credentials/keys are read from environment variables via a validated Zod schema (`src/lib/env.ts`); `.env.example` contains placeholders only; `.env*` is gitignored |
| Rate limiting | In-memory sliding-window limiter applied to authentication and OTP endpoints (`src/lib/rate-limit.ts`) — documented as a per-instance limiter; a production deployment with multiple instances should move this to a shared store (e.g. Redis) |
| Encryption in transit | Enforced by the hosting platform's TLS termination (Next.js apps are normally deployed behind HTTPS) — document as a deployment requirement, not application code |
| Encryption at rest | Delegated to the managed database provider's at-rest encryption (e.g. managed Postgres) in production; the local SQLite dev database is not encrypted and must never hold real customer data |

## What is NOT claimed

- Kredix is **not** described as NDPA-certified or audited; this is a technical foundation only.
- No claim is made that this MVP has undergone an external penetration test.
- "Encryption at rest" for the local SQLite dev database file is not implemented — this file
  must never be used in production and must never contain production data.

## Data minimisation

- Public storefronts and the Passport share view only ever render fields the business has
  explicitly published/consented to share — never raw database rows.
- Audit logs store identifiers and action names, not full sensitive payloads (no card data,
  no OTP codes, no raw share tokens).

## Outstanding legal/operational work (documented, not implemented in code)

- Formal Privacy Policy and Terms of Service content (legal drafting, out of engineering scope).
- NDPC registration/compliance filing assessment, if applicable to Kredix's processing volume.
- Data Processing Agreements with any third-party PSP/SMS/WhatsApp/AI providers once selected.
- A documented incident-response and data-breach notification procedure.
- A removable/exportable personal-data request process (data subject access rights).
