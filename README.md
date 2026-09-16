<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/hero.dark.svg">
  <img src="assets/hero.light.svg" alt="Rock — Reliability &amp; systems engineer · full-stack builder. 16 repositories, 8.2K commits, 895K lines of source, 6 apps in production, 1 engineer." width="100%">
</picture>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB" alt="React">
  <img src="https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white" alt="Next.js">
  <img src="https://img.shields.io/badge/Node.js-5FA04E?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Firebase-DD2C00?style=flat-square&logo=firebase&logoColor=white" alt="Firebase">
  <img src="https://img.shields.io/badge/Supabase-3FCF8E?style=flat-square&logo=supabase&logoColor=white" alt="Supabase">
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Capacitor-119EFF?style=flat-square&logo=capacitor&logoColor=white" alt="Capacitor">
  <img src="https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white" alt="Vercel">
  <img src="https://img.shields.io/badge/GitHub%20Actions-2088FF?style=flat-square&logo=githubactions&logoColor=white" alt="GitHub Actions">
</p>

<p align="center">
  <a href="#what-i-build">What I build</a>
  &nbsp;·&nbsp;
  <a href="#the-ecosystem">Ecosystem</a>
  &nbsp;·&nbsp;
  <a href="#how-i-ship">How I ship</a>
  &nbsp;·&nbsp;
  <a href="#by-the-numbers">By the numbers</a>
  &nbsp;·&nbsp;
  <a href="#recently-shipped">Recently shipped</a>
  &nbsp;·&nbsp;
  <a href="#selected-work">Selected work</a>
  &nbsp;·&nbsp;
  <a href="#engineering-practices">Practices</a>
  &nbsp;·&nbsp;
  <a href="#lessons-learned">Lessons</a>
  &nbsp;·&nbsp;
  <a href="#connect">Connect</a>
</p>

## What I build

By day, I lead reliability-compliance work in the energy sector. Outside that role, I design, build, ship, and operate the products below, using a review-and-test system to keep changes traceable.

**Currently**

- Operating **ParentPod** across web, iOS, and Android while improving the caregiver onboarding path.
- **Longevity** turns one short daily log into a read on today's energy, comparisons drawn from your own history, and the long view.
- Maintaining the shared delivery system: isolated worktrees, automated tests, security gates, deployment checks, and documentation freshness.

## The ecosystem

16 repositories, one system: a shared hub for distribution, a portfolio of products, two back ends, and native + web delivery connected by common release controls.

<p align="center"><picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/orbit.dark.svg">
  <img src="assets/orbit.light.svg" alt="Portfolio constellation — ParentPod, Longevity, RealInvestorX, Apex, Compliance OS, Bid Spotter, EngiByte, JaLingo, TheLoop and the Beyond Volatility hub connected through shared infrastructure, run by one engineer." width="680">
</picture></p>

<p align="center"><picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/ecosystem.dark.svg">
  <img src="assets/ecosystem.light.svg" alt="Ecosystem map — Beyond Volatility hub, products, Firebase and Supabase back ends, Vercel, Firebase Hosting, app-store delivery, and shared release controls." width="680">
</picture></p>

## How I ship

<p align="center"><picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/pipeline.dark.svg">
  <img src="assets/pipeline.light.svg" alt="Ship pipeline — scope the change, build in isolation, run focused quality and security checks, deploy, verify, and update operating documentation." width="680">
</picture></p>

Shared standards and repository-specific release gates connect each change to tests, review, deployment verification, and documentation updates.

| Command | What it does |
|---|---|
| `/ship` | release gate — version, build, test, deploy, verify, update docs |
| `/sync` | rebase main and resolve mechanical conflicts with validation |
| `/audit` | security, dependency, dead-code, a11y & perf sweep |
| `/new-project` | scaffold a repo with baseline standards, CI, security checks, and documentation |
| `/update-brain` | maintain the knowledge base and reconcile the task hub |
| `/improve` | turn repeatable workflows into maintained tooling and checks |

**Shared engineering standards:** `architecture` · `coding-standards` · `typescript` · `react` · `security` · `git-workflow` · `startup` — maintained centrally and applied according to each repository's stack and risk profile.

## By the numbers

<sub>Portfolio snapshot dated Sep 13, 2026. These figures are computed from the git history and tracked source tree; the visible date prevents an old snapshot from presenting as live telemetry.</sub>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/commits.dark.svg">
  <img src="assets/commits.light.svg" alt="Commits per repository — ParentPod 2,621; RealInvestorX 1,125; Longevity 1,124; Apex 918; Compliance OS 848; TheLoop 644; Beyond Volatility 591; EngiByte 151; JaLingo 129; Bid Spotter 69. ~8.2K total, single author." width="100%">
</picture>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/languages.dark.svg">
  <img src="assets/languages.light.svg" alt="Language mix across 895K lines of tracked source — TypeScript 66.4%, JavaScript 24.8%, CSS 4.3%, SQL 1.7%, PHP 1.3%, Python 1.1%, Other 0.5%." width="100%">
</picture>

## Recently shipped

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/velocity.dark.svg">
  <img src="assets/velocity.light.svg" alt="Shipping cadence over the trailing 90 days — ParentPod 446 commits; Longevity 386 commits; Compliance OS 310 commits; RealInvestorX 211 commits; EngiByte 149 commits; Apex 130 commits; JaLingo 129 commits; TheLoop 107 commits; Bid Spotter 56 commits." width="100%">
</picture>

<sub>Still shipping — latest version and commit volume over the last 90 days, as of Sep 13, 2026. Regenerated from git, not hand-edited.</sub>

| Product | Latest | Commits · 90d |
|---|---|---|
| **ParentPod** | `v2.62.428` | 446 |
| **Longevity** | `v2.0.111` | 386 |
| **Compliance OS** | `v3.22.1` | 310 |
| **RealInvestorX** | `v5.22.2` | 211 |
| **EngiByte** | `v1.3.1` | 149 |
| **Apex** | `v0.2.6` | 130 |
| **JaLingo** | `v0.5.0` | 129 |
| **TheLoop** | `v1.2.0` | 107 |
| **Bid Spotter** | `v2.1.0` | 56 |

## Selected work

| Project | What it does | Stack | Live |
|---|---|---|---|
| **[ParentPod](https://parentpodapp.com)** <br><sub>`Flagship · live`</sub> | A shared baby tracker for the whole care team. | TypeScript · React · Vite · Capacitor · Firebase | [App Store ↗](https://apps.apple.com/app/parentpod/id6759841193) · [Play ↗](https://play.google.com/store/apps/details?id=com.parentpod.app) |
| **[Longevity](https://longevity.beyondvolatility.com/)** <br><sub>`Live`</sub> | See what your days are doing to your energy. | TypeScript · Next.js · React · Capacitor · Firebase | [Live ↗](https://longevity.beyondvolatility.com/) |
| **[RealInvestorX](https://realinvestorx.beyondvolatility.com/)** <br><sub>`Maintenance mode`</sub> | Real-estate deal review with explicit assumptions. | TypeScript · React · Express · Turborepo · Supabase | [Live ↗](https://realinvestorx.beyondvolatility.com/) |
| **[Apex](https://apex.beyondvolatility.com/)** <br><sub>`Maintenance mode`</sub> | Personal-finance & FIRE planning. | TypeScript · React · Vite · Supabase | [Live ↗](https://apex.beyondvolatility.com/) |
| **[Compliance OS](https://compliance.beyondvolatility.com/)** <br><sub>`Parked · maintained`</sub> | Controls & audit-evidence platform. | TypeScript · React · Firebase | [Live ↗](https://compliance.beyondvolatility.com/) |
| **[Bid Spotter](https://bidspotter.beyondvolatility.com)** <br><sub>`Live · pilot pending`</sub> | Government work you can answer, ranked daily. | TypeScript · React · Vite · Firebase | [Live ↗](https://bidspotter.beyondvolatility.com) |
| **[EngiByte](https://engibyte.beyondvolatility.com)** <br><sub>`Live · revived 2026-07-11`</sub> | Scroll less. Know more. | TypeScript · React Native · Expo · Firebase | [Live ↗](https://engibyte.beyondvolatility.com) |
| **[JaLingo](https://jalingo.beyondvolatility.com)** <br><sub>`Live · founders season`</sub> | Learn Patwa from the people who speak it. | TypeScript · Next.js · React · Firebase | [Live ↗](https://jalingo.beyondvolatility.com) |
| **[TheLoop](https://theloop.beyondvolatility.com/)** <br><sub>`Controlled beta · live`</sub> | A private chronological feed for people you know. | TypeScript · React · Vite · Firebase | [Live ↗](https://theloop.beyondvolatility.com/) |
| **[Beyond Volatility](https://beyondvolatility.com)** <br><sub>`Live`</sub> | The hub — the front door to the portfolio. | WordPress · PHP | [Live ↗](https://beyondvolatility.com) |

<details>
<summary><b>ParentPod — deep dive</b></summary>

**Problem.** Caring for a baby is a team sport, but the tools assume one logged-in parent — state fragments across people and devices.

**Architecture.** React + Vite in a Capacitor shell (one codebase → iOS, Android, Web). Firestore provides real-time multi-caregiver sync; security rules enforce role-scoped access server-side; RevenueCat handles cross-platform subscriptions.

**Engineering.** Local-first activity capture reconciles through Firestore, with separate tested release paths for the web and native stores.

</details>

<details>
<summary><b>Full stack &amp; tooling</b></summary>

**Languages**  
<img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"> <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black" alt="JavaScript"> <img src="https://img.shields.io/badge/PHP-777BB4?style=flat-square&logo=php&logoColor=white" alt="PHP"> <img src="https://img.shields.io/badge/SQL-4479A1?style=flat-square&logo=postgresql&logoColor=white" alt="SQL"> <img src="https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white" alt="Python"> <img src="https://img.shields.io/badge/Bash-4EAA25?style=flat-square&logo=gnubash&logoColor=white" alt="Bash">

**Frontend**  
<img src="https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB" alt="React"> <img src="https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white" alt="Next.js"> <img src="https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite"> <img src="https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS"> <img src="https://img.shields.io/badge/Radix%20UI-161618?style=flat-square&logo=radixui&logoColor=white" alt="Radix UI"> <img src="https://img.shields.io/badge/Capacitor-119EFF?style=flat-square&logo=capacitor&logoColor=white" alt="Capacitor">

**Backend**  
<img src="https://img.shields.io/badge/Node.js-5FA04E?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node.js"> <img src="https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white" alt="Express"> <img src="https://img.shields.io/badge/Firebase-DD2C00?style=flat-square&logo=firebase&logoColor=white" alt="Firebase"> <img src="https://img.shields.io/badge/Supabase-3FCF8E?style=flat-square&logo=supabase&logoColor=white" alt="Supabase"> <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL"> <img src="https://img.shields.io/badge/pgvector-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="pgvector">

**Infra & delivery**  
<img src="https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white" alt="Vercel"> <img src="https://img.shields.io/badge/Firebase%20Hosting-FFCA28?style=flat-square&logo=firebase&logoColor=black" alt="Firebase Hosting"> <img src="https://img.shields.io/badge/GitHub%20Actions-2088FF?style=flat-square&logo=githubactions&logoColor=white" alt="GitHub Actions"> <img src="https://img.shields.io/badge/Turborepo-EF4444?style=flat-square&logo=turborepo&logoColor=white" alt="Turborepo"> <img src="https://img.shields.io/badge/Cloudflare-F38020?style=flat-square&logo=cloudflare&logoColor=white" alt="Cloudflare">

**Quality & tooling**  
<img src="https://img.shields.io/badge/Zod-3E67B1?style=flat-square&logo=zod&logoColor=white" alt="Zod"> <img src="https://img.shields.io/badge/Sentry-362D59?style=flat-square&logo=sentry&logoColor=white" alt="Sentry"> <img src="https://img.shields.io/badge/RevenueCat-F25A5A?style=flat-square" alt="RevenueCat"> <img src="https://img.shields.io/badge/Doppler-3391FF?style=flat-square&logo=doppler&logoColor=white" alt="Doppler"> <img src="https://img.shields.io/badge/ESLint-4B32C3?style=flat-square&logo=eslint&logoColor=white" alt="ESLint"> <img src="https://img.shields.io/badge/Prettier-F7B93E?style=flat-square&logo=prettier&logoColor=black" alt="Prettier">

</details>

## Engineering practices

- **Typed contracts and boundary validation** are required for new or changed external inputs.
- **Test the behavior and the failure path** — a bugfix starts with a failing test that reproduces it.
- **Secrets stay out of source control** — builds and deploys receive them through environment configuration or managed secret stores; only public client configuration ships.
- **Authorization belongs server-side** — Firestore rules and Supabase RLS protect current privileged paths; known legacy gaps remain explicitly gated.
- **Tiered CI** (active / dabble / parked) keeps Actions minutes low; CLI-first deploys through the release gate.
- **Conflicts are resolved before merge** — semantic conflicts stop for review and a new validation pass.
- **Accessibility & cross-platform** — semantic markup, keyboard paths, and Capacitor guards for native builds.

## Lessons learned

<sub>What 31 rules the incident record paid for. Each one comes from a real failure in this portfolio, has a check that fires on recurrence, and is maintained in the same file that governs every release — regenerated here, not hand-edited.</sub>

- **Prose is a hope; only something that fires is a fix.** A rule that only lives in a document is a hope. Every recurring failure gets a check that fires on its own — a scheduled job, a CI gate, a hook, or a test — and the fix is not done until that check exists.
- **Built is not wired; correctness and activation are separate claims.** Shipping code is not the same as activating it. A guard that is written and tested but never registered protects nothing, so wiring is verified as its own step.
- **Watchdogs enumerate, never sample, and measure their own coverage.** A monitor that samples will eventually report green over the part it did not look at. Checks enumerate their whole inventory from the live system and fail when their own coverage shrinks.
- **A tool that silently does less than asked fails in the unsafe direction.** A command that accepts an option it does not implement reports success while doing less. Unknown flags are errors, and "could not measure" is never displayed the way a real number is.
- **Green locally and green in CI are evidence about the build, never the deploy.** "CI is green" describes the build, not what users are running. Every release is verified by reading the live surface afterward, and a green pipeline is never the last step.
- **Constant and graceful fallbacks convert failures into silence.** A graceful fallback is a silent failure with better manners. Missing data is reported, never replaced by a plausible default that hides how often the gap occurs.
- **A monitor is only as good as the assertions it still contains.** A health check that returns "ok" over an empty list of assertions is worse than none. Monitors are verified for shape and freshness, not just for having run.
- **Copy the value, never the label; a comment's safety claim is testable.** The label on a thing and the value inside it drift apart. Billing, trial length, and configuration are read from the value the system actually enforces, and any comment claiming "this is safe" gets a test.

<details>
<summary><b>23 more</b></summary>

- **Shared-infrastructure failures wear the costume of code bugs.** When many pipelines share one machine or one budget, an outage looks like a code failure. A monitor establishes whether a red result is fixable by any commit before it files work against the code.
- **A fix applied to a list covers that day's list; corrections must copy to twins.** A fix applied to the repositories you remembered protects only those. Fleet-wide changes are applied from a live enumeration and re-checked on a schedule, and a diagnosis on one job is applied to every job with the same shape.
- **Two package managers means two truths; declare dependencies and sync both sides.** When a project installs with one package manager locally and another in production, a class of bug is invisible on one side by construction. Dependencies are declared explicitly and both lockfiles are kept in step by a check, not by discipline.
- **Test the wiring, not only the logic.** A test suite that builds its own inputs can pass while the real caller passes zeros. Tests read what the system actually produces, and a safety gate that has never fired is checked for what it receives.
- **A bug that survives repair was diagnosed at the wrong layer.** If the same bug keeps coming back after a fix, the fix is at the wrong layer. Measure outward from the symptom until a number stops matching instead of repairing what is visible.
- **Irreversible actions get a refusal at the tool boundary, not a rule in prose.** Anything irreversible — deleting production data, deleting a branch with unmerged work, granting an automation new authority — is blocked at the command boundary, not by a policy people are expected to remember.
- **Stage explicit paths; shared scratch state is hostile.** Staging "everything" eventually commits a secret. Commits stage named paths, and anything several processes can write to is treated as untrusted.
- **Multi-writer stores need merge and recovery paths tested against the state failures actually produce.** A log that only ever appends must be merged as a log, or a merge will quietly drop the newest line. Sync failure paths are tested against the broken state they really produce, and silent loss is treated as worse than a visible conflict.
- **An approval gate must cover every path to the terminal state.** An approval gate that checks one path lets the other paths through. Anything that publishes in someone's name is re-read on a schedule and reverted if it lacks the approval, whichever route it took.
- **One metric has one owner; delegate to the reconciler, never re-derive.** Two internally consistent systems can disagree at the seam. Every headline metric has exactly one computation that other surfaces call, and each reader is asked which sources it might be missing.
- **Detection without delivery is not detection.** A monitor that fires into a channel nobody reads has not fired. Every signal goes to the one surface its reader actually looks at, with dedupe, and a signal source that stops updating is itself an alert.
- **Pre-committed decisions need a detector like outages do.** A decision rule written in a document slips on the day it matters. Thresholds are evaluated by a scheduled job against live data and surfaced to the decider, not left for someone to remember to check.
- **Count before assuming headroom, and look for the mechanism that already works.** Free quotas are shared across an account, so the headroom is counted, never assumed. Before building a replacement, check whether a working mechanism already exists.
- **Own the artifact, not the platform's interpretation of your exit code.** A release gate must control whether the artifact exists, not merely return a failing status another system may or may not honor. Gates are proven by forcing a failure live and confirming nothing shipped.
- **Empowerment first: an owner item naming a credential records the paths tried without one.** Before asking a person for access, exhaust what the machine already holds — an authenticated CLI counts. A request for credentials records what was tried without them.
- **A detector that cries wolf gets deleted; filter, ratchet, and separate the unresolvable.** A check that produces false alarms trains everyone to ignore it. New checks filter known-safe shapes, freeze existing debt as a baseline that must not grow, and separate "confirmed" from "could not tell".
- **Vendor-side change is invisible from inside the repository.** A vendor can retire an identifier your code hardcodes while every test passes. External identifiers live in one place, never as moving aliases, and a scheduled job asks the vendor whether each still exists.
- **Walk the user-type matrix before calling a user-facing change done.** A change tested only as a brand-new user can exclude everyone who already exists. Each user population — new, existing, offline, interrupted, returning — is walked before a change is called done.
- **Verify a security claim against every file the setting can live in.** One-click "always allow" answers accumulate into standing permissions nobody remembers granting. Grants are audited across every file they can live in, and destructive operations carry an explicit deny.
- **Preserve raw intake; archive by moving with links that resolve, never by tombstone or alias.** A knowledge base is archived by moving, never by leaving stubs that compete with live notes, and raw material that a pass cannot read is kept and handed forward, never deleted.
- **Fixed-slot schedules starve on a machine that is often off.** A job scheduled for a fixed hour on a machine that may be asleep can miss forever. Scheduled work polls frequently, gates on a success stamp, and writes evidence on every run so a dead job cannot pass as a quiet one.
- **A diagnostic is read-only; a health check that mutates misclassifies work.** A health check that also cleans up will eventually delete work it misjudged. Diagnostics only report; any mutation is a separate, deliberate command.
- **A gate that can never pass is worse than no gate.** A check that has never passed is not protecting anything; it is teaching people to ignore red. Every gate has a green in its history or it is fixed or removed.

</details>

## Connect

<p align="center">
  <a href="https://github.com/rockeish"><img src="https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white" alt="GitHub"></a>
  <a href="https://www.linkedin.com/in/rockeish-mckenzie-p-e-8b83212a/"><img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=flat-square&logo=linkedin&logoColor=white" alt="LinkedIn"></a>
  <a href="https://beyondvolatility.com"><img src="https://img.shields.io/badge/Portfolio-0b1220?style=flat-square&logo=safari&logoColor=white" alt="Portfolio"></a>
  <a href="https://parentpodapp.com"><img src="https://img.shields.io/badge/ParentPod-111111?style=flat-square&logo=appstore&logoColor=white" alt="ParentPod"></a>
  <a href="https://www.instagram.com/parentpodapp/"><img src="https://img.shields.io/badge/Instagram-E4405F?style=flat-square&logo=instagram&logoColor=white" alt="Instagram"></a>
  <a href="https://www.tiktok.com/@parentpodapp"><img src="https://img.shields.io/badge/TikTok-000000?style=flat-square&logo=tiktok&logoColor=white" alt="TikTok"></a>
  <a href="https://x.com/ParentingP0fn9"><img src="https://img.shields.io/badge/X-000000?style=flat-square&logo=x&logoColor=white" alt="X"></a>
</p>

---

<sub>App repositories are private — this work ships to production, not public forks. This entire page — copy, tables, and every animated SVG (light + dark) — is generated from data (<a href="data/projects.json">projects.json</a> + <a href="data/activity.json">activity.json</a>) by <a href="scripts/generate-showcase.mjs"><code>generate-showcase.mjs</code></a> and refreshed by a stamp-guarded local schedule. Short link to this page → <b><a href="https://github.com/rockeish">github.com/rockeish</a></b> · full portfolio → <b><a href="https://beyondvolatility.com">beyondvolatility.com</a></b>.</sub>
