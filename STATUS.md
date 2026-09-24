# Status — rockeish

Last verified: 2026-09-24
Authority: current repository truth

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

## Main CI

`main` at `b49fcba` (2026-09-23): two runs both **success** — "Push on main"
(17:41 UTC) and "Scheduled" (17:53 UTC). GitHub code scanning's default
CodeQL setup is registered on the repo (no committed workflow file; this is
GitHub's non-YAML default-setup code scanning, confirmed via
`gh api repos/rockeish/rockeish/actions/workflows`).

## Open PRs

None.

## Known issues and next gate

No open issues found in `~/knowledge/obsidian-vault/MyBrain/90_System/todos/backlog.md`
naming this repo. The refresh mechanism is a stamp-guarded local cron
(`chore: refresh showcase ... local cron`, latest at `b49fcba`) that
aggregates data and regenerates content — per `CLAUDE.md`, content must not
be hand-edited; update the data/generator instead. Next gate: none scheduled;
this repo is maintained opportunistically alongside sibling-repo changes that
feed its stats.
