# Status: rockeish

Public GitHub profile repository. The README and SVG assets are generated from `data/projects.json` and `data/activity.json`.

- Live: https://github.com/rockeish
- Refresh: a local scheduled job regenerates the page and opens a pull request; `verify` and `secret-scan` must pass before it merges.
- Published data: aggregate repository count, commit counts, lines by language, and per product the last-shipped date, 90-day commit count and version label.
- Check: `node --test scripts/*.test.mjs`
