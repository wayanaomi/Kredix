# Kredix — Developer Tooling

## Inspected / available in this environment

| Tool | Status | Notes |
|---|---|---|
| Node.js | v24.14.1 | Used for all builds/scripts |
| npm | 11.11.0 | Package manager (no yarn/pnpm lockfile conventions assumed) |
| PostgreSQL (`psql`/`postgres`/`pg_ctl`) | **Not available** | Drove the SQLite dev datasource decision — see `docs/assumptions.md` |
| Docker | **Not available** | Cannot run containerised Postgres locally in this environment |
| Git | Available (not initialised as a repo at scaffold time; left to the user/CI to initialise) | |
| VS Code extensions | Not pre-installed/assumed; relied on built-in terminal + file tools only | Per Rule E, no extensions were installed speculatively |

## Project tooling actually added

| Tool | Purpose |
|---|---|
| ESLint (`eslint-config-next`) | Lint (`npm run lint`) |
| TypeScript (strict mode) | Type checking (`npm run typecheck`) |
| Prisma | Schema, migrations, type-safe DB client |
| Zod | Runtime validation |
| Vitest | Unit/integration tests (`npm run test`) |
| Recharts | Dashboard charts |
| `@react-pdf/renderer` | Financial Passport PDF generation |
| `idb` | IndexedDB wrapper for the offline sales queue |
| `bcryptjs` | Password hashing (pure-JS, no native build step — chosen over `bcrypt` to avoid
  node-gyp/native compilation issues in a sandboxed environment) |

## Deliberately not installed

- **Playwright** — the master prompt calls for E2E tests "when available." Browser automation
  binaries (Chromium/WebKit downloads) were not attempted in this constrained, offline-leaning
  environment to avoid a large, possibly-failing download; instead, Vitest integration tests
  exercise the critical server-side logic (ledger idempotency, scoring, RBAC) directly. This is
  documented as a gap in `docs/test-report.md`.
- **A full UI component library (e.g. shadcn/Radix)** — the brand's distinctive flyer-driven
  visual language called for bespoke components; pulling in a generic library would have worked
  against "avoid a generic fintech template" (section 2).
- **NextAuth** — a custom, minimal session-cookie auth was built instead, since Kredix needs
  non-standard entities (`VerificationRecord`, three distinct roles with different portals) that
  are simpler to reason about with direct control than by composing them on top of NextAuth's
  adapter model for an MVP of this size.

## Recommended (not required) VS Code extensions

- Prisma (`Prisma.prisma`) — schema syntax highlighting and formatting.
- ESLint (`dbaeumer.vscode-eslint`) — inline lint diagnostics.
- Tailwind CSS IntelliSense (`bradlc.vscode-tailwindcss`).

These were not installed automatically; they are suggestions only (Rule E: "do not assume an
extension is installed").
