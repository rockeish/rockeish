# Status — rockeish

Last verified: 2026-10-12 (source and isolated generated output)
Authority: current repository truth

## Owned repository count correction

The count source is a complete, bounded GitHub-owned inventory, excluding
archived repositories. The local product registry supplies known checkout
paths and a separately labeled fingerprint; it does not define the owned
repository total. Only aggregate count, observation time and SHA-256 input
fingerprints enter public activity data. Private inventory names stay private.

Collection and generation refuse unavailable, malformed, duplicate, foreign,
bound-exhausted or incomplete input before changing published output. Generation
also verifies the current membership fingerprint against the collection receipt.
Commits and source lines read the same pinned committed tree within the owned
set, with separate measured-versus-
expected coverage. Missing history is excluded from those labeled subtotals;
unreadable source is Unknown and never replaced by a declared total.

Local evidence: all 47 Node contracts pass, including actual CLI controls for
23 owned repositories versus 21 product-registry rows, partial history,
private-input refusal, changed membership with an unchanged count, and a
checkout branch/dirty-file control that retains the committed source total. The real
inventory read returned 23 owned repositories; history covered 22 of 23.
Local receipts validate source and isolated generated output; hosted and live
evidence are separate from those receipts.

## Purpose

Public showcase/profile repo (the only public repo in the portfolio):
generates the `github.com/rockeish` profile README from public-safe stats
aggregated across sibling repos, for resume/portfolio visibility without
exposing private app code.

## Lifecycle

Not a scored product under `ecosystem-owner-decisions-20260922`; it is
portfolio-wide showcase infrastructure. Ongoing light maintenance continues
in parallel with the current 2-3 primary focus areas per that record.

## Live

`https://github.com/rockeish` — profile README rendered from this repo's
generated `README.md` on `origin/main`.

## Main CI (historical 2026-10-02 receipt)

`main` at `06bb14a` (2026-10-02, latest local-cron refresh); generator tests 26/26 pass. The last two
verified GitHub runs on `b49fcba` (2026-09-23) were both **success** — "Push on main" and "Scheduled". GitHub code scanning's default
CodeQL setup is registered on the repo (no committed workflow file; this is
GitHub's non-YAML default-setup code scanning, confirmed via
`gh api repos/rockeish/rockeish/actions/workflows`).

## Open PRs (historical 2026-10-02 receipt)

None.

## Prior maintenance receipt (2026-10-02)

No open issues found in `~/knowledge/obsidian-vault/MyBrain/90_System/todos/backlog.md`
naming this repo. The refresh mechanism is a stamp-guarded local cron
(`chore: refresh showcase ... local cron`, latest at `06bb14a`) that
aggregates data and regenerates content — per `CLAUDE.md`, content must not
be hand-edited; update the data/generator instead. Next gate: none scheduled;
this repo is maintained opportunistically alongside sibling-repo changes that
feed its stats.

## Cross-repo input check (2026-10-02)

The lessons section reads `~/ai/LESSONS.md` (`Public:` lines only) at refresh time. LL-082 to LL-087
were added to `ai` after the 2026-10-02 refresh, so they reach the profile at the next cron run; no
manual edit. If a refresh stops picking up new lessons, check `SHOWCASE_LESSONS_FILE` first.
