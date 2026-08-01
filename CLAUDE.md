# rockeish — project CLAUDE.md
@/home/rock/.claude/CLAUDE.md


## Global operating policy — do not restate it here

Autonomy, CEO escalation, model tiering, secret handling, git/PR/deploy
workflow, evidence standards and cost discipline are defined once in
`~/ai/CLAUDE.md` and `~/ai/standards/` (start with `architecture.md` for the
portfolio map and this repo's current strategic role). Read them at session
start; they override anything stale below.

Keep THIS file to what only this repo knows: stack, commands, tests, deploy
specifics, product invariants, data boundaries, platform constraints. Copying
global policy here is how it goes stale — `~/ai/scripts/instruction-drift`
flags it.

In a remote checkout without `~/ai`, treat this file as the fallback and add a
compact pointer rather than guessing.

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
