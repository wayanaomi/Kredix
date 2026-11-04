# Kredix — Assumptions Log

This log records engineering and product decisions made where the supplied workbook
(`docs/source-materials/BIZZLINK MVP User Journey.xlsx`) and brand materials did not specify
an exact implementation detail, per Execution Rule C (avoid unnecessary questions).

## Source materials

- The workbook filename retains the original "BIZZLINK" project codename. Per the master
  prompt, the product is branded **Kredix** everywhere in the UI, docs, and code. The
  workbook's screen IDs (`SCR-XX`) and journey IDs (`UJ-XXX`) are retained verbatim in
  `docs/requirements-traceability.md` for traceability, since they are internal identifiers,
  not brand references.
- The "Capsule" description PDF/image is treated as strategic positioning language only
  (the four-principle DIGITISE / UNDERSTAND / DEMONSTRATE / CONNECT framing). It is not used
  as a product name anywhere.
- All four supplied visual/text references were located in `~/Downloads` and copied into
  `docs/source-materials/` for traceability. The "Kredix Insights — smart friend" flyer and the
  supporting description screenshot were supplied only as chat attachments (no file on disk);
  their content was reviewed and incorporated into the design system and recommendation-engine
  copy from the attached images directly.

## Environment constraints

- **No local PostgreSQL server or Docker is available** in this environment. Prisma's
  datasource provider is set to `sqlite` for local development (zero-setup, file-based
  `prisma/dev.db`). All monetary fields use integer minor units (kobo) and all enum-like
  fields are modelled as validated `String` columns (SQLite has no native Prisma enum support)
  so the schema can be switched to `postgresql` with minimal changes for production — see
  `docs/architecture.md` for the migration path.
- No payment service provider (Paystack/Flutterwave/etc.), SMS/WhatsApp provider, or AI/LLM
  provider credentials were available. Each of these is implemented as a provider-agnostic
  **adapter interface** with:
  - a safe "integration not configured" state exposed to the UI and API,
  - a clearly labelled **development-only** adapter (mock PSP, console/log-based OTP and
    notification sender) that can never run in a build with `NODE_ENV=production` unless
    explicitly forced via `ALLOW_DEV_PROVIDERS=true` (documented, off by default).
  - This satisfies Rule C.4 ("implement its integration boundary and a safe unavailable state").

## Product/UX decisions

- **Single business ownership (MVP)**: the workbook does not describe multi-owner/staff
  accounts. `Business.ownerId` is a single owner; a `BusinessMembership` table was considered
  but deferred — documented as a fast-follow in `docs/implementation-plan.md`.
- **Verification channel**: the workbook (UJ-003) specifies OTP verification without naming a
  channel. Both email and phone are supported as `VerificationRecord.channel` values; phone
  is primary given the Nigerian SME target audience, email is the fallback when phone/SMS
  delivery is unconfigured.
- **Financing status values**: AC-FIN-02 defines `Submitted, Under Review, Approved, Declined,
  Disbursed` — used verbatim as the `FinancingApplication.status` state machine.
- **Lender assignment**: the workbook allows a manual referral queue in v1 (MVP Scope sheet:
  "Lender referral queue | Can be manual in v1"). Admins assign a `LenderReferral` to a
  `Lender` manually; no automated lender-matching algorithm was implemented.
- **AI recommendations and scoring**: no LLM/AI provider credentials exist. Per Rule C.4 and
  AC-AI-02 ("avoid fabricated recommendations"), the recommendation engine and Business Health
  Score are **fully deterministic, rule-based, and grounded in persisted ledger data** — no
  external AI API call is made. This is stricter than "retain deterministic insights if AI
  provider unavailable" (section 4.I) and intentionally safer.
- **Currency/locale**: all monetary values are formatted as NGN (₦) using `Intl.NumberFormat`
  with `Africa/Lagos` timestamps for date displays, per section 3.

## Security decisions

- Session tokens are random 32-byte values; only their SHA-256 hash is persisted
  (`Session.tokenHash`), matching the pattern used for Passport share tokens.
- Passwords are hashed with bcrypt (cost factor 12).
- Passport share links use a 32-byte random token (only the hash is stored) appended to a
  public URL; the raw token is shown to the owner once at creation time and is not
  recoverable from the database.

## Explicitly out of scope for this MVP (per MVP Scope sheet)

- External bank/accounting integrations (P2/OUT).
- Direct underwriting or loan disbursement by Kredix (P2/OUT — Kredix is not a lender).
- Non-English notification copy (English only at MVP per AC-NOT-01).
