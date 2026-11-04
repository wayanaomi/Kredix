# Kredix — Requirements Traceability

Source of truth: `docs/source-materials/BIZZLINK MVP User Journey.xlsx` (sheets: **User Journey**,
**Acceptance Criteria**, **MVP Scope**, **Product Flow**). Workbook IDs (`UJ-XXX`, `AC-XXX`,
`SCR-XX`) are internal identifiers and are kept verbatim; the product is branded **Kredix**
throughout the UI and docs.

Status legend: ✅ Implemented · 🟡 Partially implemented · ⬜ Not implemented (documented gap).

| UJ ID | Acceptance Criteria | Requirement | Code | Tests | Status |
|---|---|---|---|---|---|
| UJ-001 | — | Landing page entry → registration | `src/app/page.tsx`, `src/app/(auth)/register` | manual journey test | ✅ |
| UJ-002 | AC-REG-01, AC-REG-02 | Register with name/phone/email/password, dup handling, validation | `src/app/api/auth/register/route.ts`, `src/lib/validation/auth.ts` | `tests/auth.test.ts` | ✅ |
| UJ-003 | AC-REG-03 | OTP verification, expiry, resend | `src/app/api/auth/verify/route.ts`, `src/app/api/auth/resend-otp/route.ts` | `tests/auth.test.ts` | ✅ (dev OTP adapter — see assumptions) |
| UJ-004 | AC-BIZ-01 | Business profile creation, persistent progress | `src/app/onboarding`, `src/app/api/business/route.ts` | `tests/business.test.ts` | ✅ |
| UJ-005 | AC-STF-01 | Storefront builder, no technical skill required | `src/app/dashboard/storefront` | manual | ✅ |
| UJ-006 | AC-PROD-01 | Product CRUD, price validation | `src/app/dashboard/products`, `src/app/api/products/route.ts` | `tests/products.test.ts` | ✅ |
| UJ-007 | AC-STF-01 | Publish storefront, unique URL | `src/app/api/storefront/publish/route.ts` | `tests/storefront.test.ts` | ✅ |
| UJ-008 | — | Copy/share storefront link | `src/components/ShareLinkButton.tsx` | manual | ✅ |
| UJ-009 | AC-PAY-01, AC-PAY-02 | Online sale via PSP, server-verified, exactly-once ledger entry | `src/app/store/[slug]`, `src/app/api/checkout`, `src/app/api/payments/webhook` | `tests/payments.test.ts` | ✅ (mock PSP adapter — real PSP needs credentials, see assumptions) |
| UJ-010 | AC-OFF-01 | Manual/offline sale entry | `src/app/dashboard/ledger`, `src/lib/offline` | `tests/ledger.test.ts` | ✅ |
| UJ-011 | AC-OFF-02 | Idempotent sync of offline sales | `src/app/api/ledger/sync/route.ts` | `tests/ledger.test.ts` | ✅ |
| UJ-012 | AC-BI-01 | Dashboard: revenue trend, best sellers, slow periods, margin | `src/app/dashboard/analytics`, `src/lib/analytics` | `tests/analytics.test.ts` | ✅ |
| UJ-013 | AC-AI-01, AC-AI-02 | Grounded recommendations, honest insufficient-data state | `src/lib/recommendations` | `tests/recommendations.test.ts` | ✅ (deterministic engine, no external AI — see assumptions) |
| UJ-014 | AC-SCORE-01, AC-SCORE-02 | Explainable 0–100 score with factors | `src/lib/scoring` | `tests/scoring.test.ts` | ✅ |
| UJ-015 | AC-PASS-01 | Auto-generated Passport from eligible data | `src/lib/passport`, `src/app/dashboard/passport` | `tests/passport.test.ts` | ✅ |
| UJ-016 | AC-PASS-02 | Verified/self-declared/system-calculated labelling | `src/app/dashboard/passport/[id]` | manual | ✅ |
| UJ-017 | AC-PASS-03 | Consent-gated secure share link / PDF | `src/app/api/passport/share/route.ts`, `src/lib/passport/pdf.tsx` | `tests/passport-share.test.ts` | ✅ |
| UJ-018 | AC-FIN-01 | Financing application form, validation | `src/app/dashboard/financing` | `tests/financing.test.ts` | ✅ |
| UJ-019 | AC-FIN-01 | Consent required before referral | `src/app/api/financing/apply/route.ts` | `tests/financing.test.ts` | ✅ |
| UJ-020 | AC-FIN-01 | Unique reference + manual referral queue | `src/app/api/financing/apply/route.ts` | `tests/financing.test.ts` | ✅ |
| UJ-021 | AC-FIN-02 | Status tracker with defined states | `src/app/dashboard/financing/[id]` | `tests/financing.test.ts` | ✅ |
| UJ-022 | AC-LEND-01 | Lender sees only referred applicants + consented Passport | `src/app/lender` | `tests/lender.test.ts` | ✅ |
| UJ-023 | AC-LEND-02 | Lender status update, audit, SME notification trigger | `src/app/api/lender/referrals/[id]/status/route.ts` | `tests/lender.test.ts` | ✅ |
| UJ-024 | AC-NOT-01 | Weekly/monthly WhatsApp/SMS summary | `src/lib/notifications` | `tests/notifications.test.ts` | 🟡 adapter + templates implemented; no scheduler/cron runner in this MVP (documented gap) |
| UJ-025 | AC-ADM-01 | Admin SME search/status management | `src/app/admin` | `tests/admin.test.ts` | ✅ |
| UJ-026 | AC-ADM-01 | Admin referral management, audit | `src/app/admin/referrals` | `tests/admin.test.ts` | ✅ |
| UJ-027 | AC-SEC-01, AC-SEC-02 | RBAC, audit logging, encryption posture | `src/lib/auth`, `src/lib/audit.ts` | `tests/security.test.ts` | ✅ (app-layer controls; infra encryption-at-rest/in-transit depends on deployment — see security-and-privacy.md) |
| UJ-028 | — | Passport auto-refresh as data accrues | `src/lib/passport/index.ts` (recalculates on each view if stale) | `tests/passport.test.ts` | ✅ (request-time recompute, no background cron — documented) |

## MVP Scope sheet cross-check

All `P0`/`IN` rows above are implemented or partially implemented with the gap documented.
`P1` rows (`UJ-024` notifications) are implemented as an adapter + template layer without a
production scheduler. `P2`/`OUT` rows (external bank/accounting integrations, direct
underwriting/disbursement) are intentionally not built, per the workbook.

## AC-UX-01 (usability — non-technical owner completes core flow unaided)

Addressed through: linear onboarding wizard with progress indicator and resumable steps,
plain-language empty states, inline validation messages, and a "how it works" explanation on
the Passport and Health Score screens. Not independently user-tested with real SMEs within this
engineering engagement — see `docs/test-report.md`.
