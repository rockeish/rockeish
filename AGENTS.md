# Agent notes: rockeish (public profile repository)

This repository is public. Everything committed here, including this file, can be read by anyone.

- Never add private repository names, machine paths, usernames, internal URLs, people's names, employer names, revenue or cost figures, secrets or unreleased plans. This covers code, comments, tests, fixtures, commit messages and pull request text.
- `README.md`, `data/activity.json` and `assets/*.svg` are generated. Do not hand-edit them; change `data/projects.json` or `scripts/` and regenerate.
- The page publishes numbers only (counts, dates, version labels) plus the reviewed copy in `data/projects.json`. No text is collected from other repositories.
- Tests use synthetic fixtures only.
- Check: `node --test scripts/*.test.mjs` (Node 22, no install step).
- CI runs on GitHub-hosted runners only.
- The owner's operating policy for private tooling is not kept in this repository.
