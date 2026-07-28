# rockeish — project CLAUDE.md
@/home/rock/.claude/CLAUDE.md

## What this is
Public showcase / profile repo (the only PUBLIC repo). Surfaces what Rock is building for the
resume + links, without exposing the private app repos.

## How it stays fresh
A stamp-guarded local schedule aggregates public-safe stats from sibling repositories and
regenerates the public page. Do NOT hand-maintain rendered content; update the data or generator.

## Knowledge base (the brain)
- Vault: symlink `~/knowledge/obsidian-vault` → physical `C:\Users\User\obsidian-vault` (Windows NTFS).
- No local filesystem (remote/cloud session): `gh repo clone rockeish/Obsidian` (private, read-only).
- Task hub: `~/knowledge/todos/active.md` (owner) and `backlog.md` (agent queue), inside the vault.
- Decisions in the vault override stale repo docs.

## Notes
- Public repo: never reference private code, secrets, internal URLs, or unreleased plans.
- CI runs on GitHub-hosted runners only (never the self-hosted WSL runner).
