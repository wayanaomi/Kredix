# Kredix

**Every sale you make builds your credit.** Kredix helps Nigerian SMEs digitise their
operations, organise financial records, understand performance, demonstrate financial
credibility, and discover relevant financing opportunities.

See [docs/architecture.md](docs/architecture.md), [docs/assumptions.md](docs/assumptions.md),
and [docs/requirements-traceability.md](docs/requirements-traceability.md) for full context on
how this MVP was built and the decisions behind it.

## Prerequisites

- Node.js 20+ and npm.
- No external database server is required for local development — Prisma uses a local SQLite
  file (`prisma/dev.db`). See [docs/architecture.md](docs/architecture.md) for the Postgres
  production migration path.

## Setup

```bash
npm install
cp .env.example .env   # fill in real values for production; dev defaults work out of the box
npx prisma migrate dev # creates prisma/dev.db and applies all migrations
npm run db:seed        # creates an admin and a demo partner-lender account only — no fake businesses
npm run dev
```

Open http://localhost:3000.

Seeded accounts (password `Password123!` for both):
- `admin@kredix.ng` — Admin dashboard (`/admin`)
- `lender@kredix.ng` — Lender portal (`/lender`)

Register a new account at `/register` to exercise the full SME owner journey — no OTP/SMS
provider is configured, so the verification code is shown directly in a clearly labelled
"development mode" banner.

## Environment variables

See [.env.example](.env.example) for the full list. Key ones:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Prisma datasource connection string |
| `SESSION_SECRET` | Session signing material (not currently used for signing, reserved) |
| `ALLOW_DEV_PROVIDERS` | Must be `false`/unset in production — gates the mock payment/OTP adapters |
| `PSP_*` | Real payment provider credentials (unset = safe "not configured" state) |
| `NOTIFICATIONS_*` | Real SMS/WhatsApp provider credentials (unset = notifications recorded as `SKIPPED_NO_PROVIDER`) |

## Database & migrations

```bash
npx prisma migrate dev --name <description>   # create + apply a new migration
npx prisma studio                              # inspect data visually
npm run db:seed                                # re-run the (idempotent) seed script
```

## Development commands

```bash
npm run dev         # start the dev server (Turbopack)
npm run build        # production build
npm run start         # run the production build
npm run lint          # ESLint
npm run typecheck     # tsc --noEmit
npm run test          # Vitest unit tests
```

## Testing

See [docs/test-report.md](docs/test-report.md) for what has been verified, how, and known gaps.

## Production build

```bash
npm run build && npm run start
```

Switch `prisma/schema.prisma`'s datasource to `postgresql` and point `DATABASE_URL` at a real
Postgres instance before deploying — see [docs/architecture.md](docs/architecture.md).

## External provider configuration

None of the following are configured in this environment; each has a safe "not configured"
behaviour and a documented integration boundary ready for real credentials:

- **Payments** — `src/lib/payments` (mock PSP adapter stands in for Paystack/Flutterwave/etc.)
- **SMS/WhatsApp** — `src/lib/notifications` (no-op adapter; messages recorded as skipped)
- **AI recommendations/scoring** — deliberately deterministic, no external AI provider used at all

## Known limitations

See [docs/assumptions.md](docs/assumptions.md), [docs/implementation-plan.md](docs/implementation-plan.md),
and [docs/test-report.md](docs/test-report.md) for the full list. Highlights:

- Single business owner per account (no staff/multi-owner accounts yet).
- No production payment/SMS/AI provider is wired up (adapters are ready for credentials).
- No scheduled/cron notification sender (adapter + templates exist, no worker to run them).
- Analytics are computed on-demand rather than pre-aggregated (fine at MVP data volumes).
