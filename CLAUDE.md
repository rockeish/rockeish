# rockeish — project CLAUDE.md
@/home/rock/.claude/CLAUDE.md

## What this is
Public showcase / profile repo (the only PUBLIC repo). Surfaces what Rock is building for the
resume + links, without exposing the private app repos.

## How it stays fresh
A scheduled GitHub Action aggregates summaries/stats from the other repos and regenerates the
public page — do NOT hand-maintain content; update the generator instead.

## Notes
- Public repo: never reference private code, secrets, internal URLs, or unreleased plans.
- CI runs on GitHub-hosted runners only (never the self-hosted WSL runner).
