# Kredix — Business Health Score Methodology (v1.0.0)

The Business Health Score is an **explainable, deterministic, rule-based** score from 0–100.
It is calculated entirely from a business's own persisted ledger data — no external AI/LLM
provider is called (see `docs/assumptions.md`). It is **not** a regulated credit score, not a
lender's decision, and not a guarantee of financing approval or improved creditworthiness.

## Eligibility gate

A business must meet **all** of the following before any score is calculated. If not met, the
UI shows a clear eligibility state (`NOT_ELIGIBLE`) with the specific missing criteria — never a
misleadingly low numeric score:

| Requirement | Threshold |
|---|---|
| Minimum recorded transactions | ≥ 5 ledger transactions (`Transaction` rows) |
| Minimum observation window | ≥ 14 days between the first and most recent transaction |
| Minimum business profile completeness | Business name, industry, location, and tenure all present |

## Scoring factors (v1.0.0)

| Factor | Weight | What it measures | Normalisation |
|---|---|---|---|
| Transaction-record consistency | 30% | Share of the last 8 ISO weeks with ≥ 1 recorded transaction | `(weeksWithActivity / 8) × 100`, capped at 100 |
| Revenue-record completeness | 20% | Ratio of transactions carrying a positive amount and product label vs. total transactions | `(wellFormedTxns / totalTxns) × 100` |
| Business tenure | 20% | Declared months trading, as a proxy for operating stability | `min(tenureMonths / 36, 1) × 100` (3 years = full marks) |
| Transaction regularity | 20% | Coefficient of variation of weekly transaction counts (lower variance = more regular) | `max(0, 100 − coefficientOfVariation × 100)`, clamped to [0, 100] |
| Business information completeness | 10% | Proportion of optional profile fields completed (description, employee count, registration status) | `(fieldsPresent / fieldsTotal) × 100` |

Final score = weighted sum of the five normalised factors, rounded to the nearest integer,
clamped to `[0, 100]`.

## Missing-data handling

- Any factor that cannot be computed (e.g. tenure not provided) contributes **0** for that
  factor rather than being excluded from the denominator — this intentionally keeps the score
  conservative rather than inflating it by ignoring gaps.
- The UI always lists which factors were computed from complete data vs. assumed-zero due to
  missing input, under "Data-completeness limitations."

## Versioning

- `BusinessHealthScore.version` stores the methodology version string (e.g. `"1.0.0"`) used for
  that calculation, so historical scores remain interpretable even if the methodology changes.
- Any change to weights, thresholds, or formulas must bump this version string.

## Known limitations (disclosed in the UI)

- The score only reflects **activity recorded in Kredix**; it cannot see sales made through
  other channels that were never entered into the ledger.
- It does not incorporate external credit bureau data, bank statements, or liabilities.
- A high score does not guarantee financing approval; lenders apply their own independent
  underwriting criteria.
- The "transaction regularity" and "consistency" factors can be skewed by a business that is
  genuinely seasonal; this is disclosed as a known limitation rather than corrected for,
  since correcting for seasonality reliably requires more historical data than an MVP has.

## Recalculation

Per UJ-028, the score (and the Financial Passport that embeds it) recalculates whenever the
owner opens the relevant screen if the underlying ledger data has changed since the last
calculation (`src/lib/scoring/index.ts`), rather than running on a background cron — there is no
background job scheduler in this MVP deployment target.
