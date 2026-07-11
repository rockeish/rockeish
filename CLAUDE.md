# rockeish — project CLAUDE.md
@/home/rock/.claude/CLAUDE.md

## What this is
Public showcase / profile repo (the only PUBLIC repo). Surfaces what Rock is building for the
resume + links, without exposing the private app repos.

## How it stays fresh
A scheduled GitHub Action aggregates summaries/stats from the other repos and regenerates the
public page — do NOT hand-maintain content; update the generator instead.

## Knowledge base (the brain)
- Vault: symlink `~/knowledge/obsidian-vault` → physical `C:\Users\User\obsidian-vault` (Windows NTFS).
- No local filesystem (remote/cloud session): `gh repo clone rockeish/Obsidian` (private, read-only).
- Task hub: `~/knowledge/todos/active.md` (owner) and `backlog.md` (agent queue), inside the vault.
- Decisions in the vault override stale repo docs.

## Notes
- Public repo: never reference private code, secrets, internal URLs, or unreleased plans.
- CI runs on GitHub-hosted runners only (never the self-hosted WSL runner).
