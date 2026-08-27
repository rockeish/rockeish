<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/hero.dark.svg">
  <img src="assets/hero.light.svg" alt="Rock — Reliability &amp; systems engineer · full-stack builder. 14 repositories, 7.5K commits, 724K lines of source, 5 apps in production, 1 engineer." width="100%">
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
  <a href="#connect">Connect</a>
</p>

## What I build

By day, I lead reliability-compliance work in the energy sector. Outside that role, I design, build, ship, and operate the products below, using a review-and-test system to keep changes traceable.

**Currently**

- Operating **ParentPod** across web, iOS, and Android while improving the caregiver onboarding path.
- **Longevity** turns one short daily log into a read on today's energy, comparisons drawn from your own history, and the long view.
- Maintaining the shared delivery system: isolated worktrees, automated tests, security gates, deployment checks, and documentation freshness.

## The ecosystem

14 repositories, one system: a shared hub for distribution, a portfolio of products, two back ends, and native + web delivery connected by common release controls.

<p align="center"><picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/orbit.dark.svg">
  <img src="assets/orbit.light.svg" alt="Portfolio constellation — ParentPod, Longevity, RealInvestorX, Apex, Compliance OS, EngiByte, JaLingo, TheLoop and the Beyond Volatility hub connected through shared infrastructure, run by one engineer." width="680">
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

<sub>Portfolio snapshot dated Aug 27, 2026. These figures are computed from the git history and tracked source tree; the visible date prevents an old snapshot from presenting as live telemetry.</sub>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/commits.dark.svg">
  <img src="assets/commits.light.svg" alt="Commits per repository — ParentPod 2,536; Longevity 1,064; RealInvestorX 1,054; Apex 857; Compliance OS 636; TheLoop 624; Beyond Volatility 564; EngiByte 110; JaLingo 64. ~7.5K total, single author." width="100%">
</picture>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/languages.dark.svg">
  <img src="assets/languages.light.svg" alt="Language mix across 724K lines of tracked source — TypeScript 61.4%, JavaScript 28.8%, CSS 5.1%, SQL 2.1%, PHP 1.6%, Other 1.1%." width="100%">
</picture>

## Recently shipped

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/velocity.dark.svg">
  <img src="assets/velocity.light.svg" alt="Shipping cadence over the trailing 90 days — ParentPod 432 commits; Longevity 360 commits; RealInvestorX 170 commits; Apex 120 commits; EngiByte 108 commits; Compliance OS 98 commits; TheLoop 87 commits; JaLingo 64 commits." width="100%">
</picture>

<sub>Still shipping — latest version and commit volume over the last 90 days, as of Aug 27, 2026. Regenerated from git, not hand-edited.</sub>

| Product | Latest | Commits · 90d |
|---|---|---|
| **ParentPod** | `v2.62.402` | 432 |
| **Longevity** | `v2.0.87` | 360 |
| **RealInvestorX** | `v5.20.18` | 170 |
| **Apex** | `v0.2.5` | 120 |
| **EngiByte** | `v1.3.0` | 108 |
| **Compliance OS** | `v3.7.6` | 98 |
| **TheLoop** | `v1.1.11` | 87 |
| **JaLingo** | `v0.5.0` | 64 |

## Selected work

| Project | What it does | Stack | Live |
|---|---|---|---|
| **[ParentPod](https://parentpodapp.com)** <br><sub>`Flagship · live`</sub> | A shared baby tracker for the whole care team. | TypeScript · React · Vite · Capacitor · Firebase | [App Store ↗](https://apps.apple.com/app/parentpod/id6759841193) · [Play ↗](https://play.google.com/store/apps/details?id=com.parentpod.app) |
| **[Longevity](https://longevity.beyondvolatility.com/)** <br><sub>`Live`</sub> | See what your days are doing to your energy. | TypeScript · Next.js · React · Capacitor · Firebase | [Live ↗](https://longevity.beyondvolatility.com/) |
| **[RealInvestorX](https://realinvestorx.beyondvolatility.com/)** <br><sub>`Maintenance mode`</sub> | Real-estate deal review with explicit assumptions. | TypeScript · React · Express · Turborepo · Supabase | [Live ↗](https://realinvestorx.beyondvolatility.com/) |
| **[Apex](https://apex.beyondvolatility.com/)** <br><sub>`Maintenance mode`</sub> | Personal-finance & FIRE planning. | TypeScript · React · Vite · Supabase | [Live ↗](https://apex.beyondvolatility.com/) |
| **[Compliance OS](https://compliance.beyondvolatility.com/)** <br><sub>`Parked · maintained`</sub> | Controls & audit-evidence platform. | TypeScript · React · Firebase | [Live ↗](https://compliance.beyondvolatility.com/) |
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
