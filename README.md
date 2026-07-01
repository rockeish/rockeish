<img src="assets/hero.svg" alt="Rock — Reliability &amp; systems engineer · full-stack builder. 9 repositories, 5.9K commits, 681K lines of source, 4 apps in production, 1 engineer." width="100%">

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
  <img src="https://img.shields.io/badge/Claude%20Code-D97757?style=flat-square&logo=anthropic&logoColor=white" alt="Claude Code">
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
  <a href="#selected-work">Selected work</a>
  &nbsp;·&nbsp;
  <a href="#engineering-practices">Practices</a>
  &nbsp;·&nbsp;
  <a href="#connect">Connect</a>
</p>

## What I build

By day, reliability compliance at a large energy company — 12 years keeping the power grid up. Nights and weekends, I design, build, ship, and operate every product below **solo**, on an agent-automation platform I built so the repetitive engineering happens *under review* instead of by hand. The numbers above aren't a team's output — they're one engineer with a lot of leverage.

**Currently**

- Scaling **ParentPod** — live on iOS & Android; running growth experiments against fixed survival checkpoints.
- **Longevity** on deck — a privacy-first wellness companion, hardening for launch.
- Evolving the **agent-automation platform** — parallel fan-out, an adversarial review pass, and doc-freshness gates.

## The ecosystem

9 repositories, one system: a shared hub for distribution, a portfolio of products, two back ends, and native + web delivery — all resting on the automation platform.

<p align="center">
  <img src="assets/ecosystem.svg" alt="Ecosystem map — Beyond Volatility hub, products, Firebase and Supabase back ends, Vercel / Firebase Hosting / app-store delivery, all on a shared agent-automation platform." width="680">
</p>

## How I ship

<p align="center">
  <img src="assets/pipeline.svg" alt="Ship pipeline — plan (scoped by standards-as-code), build (parallel agents, test-first), verify (adversarial review, tests, security and doc-freshness gates), ship (auto-merge, deploy, docs updated)." width="680">
</p>

A standards-as-code library plus an agent-orchestration layer turns intent into reviewed, tested, deployed changes across every repo — parallel fan-out, an adversarial review pass, and a doc-freshness gate before merge.

| Command | What it does |
|---|---|
| `/ship` | release gate — version, build, test, deploy, auto-merge, doc-freshness |
| `/sync` | rebase main, auto-resolve mechanical conflicts |
| `/audit` | security, dependency, dead-code, a11y & perf sweep |
| `/new-project` | scaffold a repo with standards, CI, secrets, context primer |
| `/update-brain` | maintain the knowledge base and reconcile the task hub |
| `/improve` | fold a sharper prompt back into a skill so it compounds |

**Standards-as-code:** `architecture` · `coding-standards` · `typescript` · `react` · `security` · `git-workflow` · `startup` — one library, symlinked into every repo *and* loaded into every agent's context, plus 8 reusable skills.

## By the numbers

<sub>Real figures, aggregated across every repository — public *and* private. No third-party stat widgets; these are computed from the actual git history and source tree, then drawn from data.</sub>

<img src="assets/commits.svg" alt="Commits per repository — ParentPod 2,229; RealInvestorX 934; Longevity 809; Apex 797; Compliance OS 552; Beyond Volatility 422; and more. ~5,900 total, single author." width="100%">

<img src="assets/languages.svg" alt="Language mix across 681K lines of tracked source — TypeScript 45.5%, JavaScript 34.8%, CSS 14.2%, PHP 2.6%, SQL 2.2%, other 0.8%." width="100%">

## Selected work

| Project | What it does | Stack | Live |
|---|---|---|---|
| **[ParentPod](https://parentpodapp.com)** <br><sub>`Flagship · live`</sub> | The village operating system for modern parenting teams. | TypeScript · React · Vite · Capacitor · Firebase | [App Store ↗](https://apps.apple.com/app/parentpod/id6759841193) · [Play ↗](https://play.google.com/store/apps/details?id=com.parentpod.app) |
| **[Longevity](https://longevity.beyondvolatility.com/)** <br><sub>`On deck`</sub> | Privacy-first wellness, across ten dimensions. | TypeScript · Next.js · React · Capacitor · Firebase | [Live ↗](https://longevity.beyondvolatility.com/) |
| **[RealInvestorX](https://realestate.beyondvolatility.com/)** <br><sub>`Active`</sub> | Institutional-grade real-estate deal analysis. | TypeScript · React · Express · Turborepo · Supabase | [Live ↗](https://realestate.beyondvolatility.com/) |
| **[Apex](https://personalfinance.beyondvolatility.com/)** <br><sub>`Maintained`</sub> | Personal-finance & FIRE planning. | TypeScript · React · Vite · Supabase | [Live ↗](https://personalfinance.beyondvolatility.com/) |
| **[Compliance OS](https://compliance.beyondvolatility.com/)** <br><sub>`Maintained`</sub> | Controls & audit-evidence platform. | TypeScript · React · Firebase | [Live ↗](https://compliance.beyondvolatility.com/) |
| **[Beyond Volatility](https://beyondvolatility.com)** <br><sub>`Live`</sub> | The hub — the front door to the portfolio. | WordPress · PHP | [Live ↗](https://beyondvolatility.com) |

<details>
<summary><b>ParentPod — deep dive</b></summary>

**Problem.** Caring for a baby is a team sport, but the tools assume one logged-in parent — state fragments across people and devices.

**Architecture.** React + Vite in a Capacitor shell (one codebase → iOS, Android, Web). Firestore for real-time multi-caregiver sync; security rules enforce role-scoped access server-side; RevenueCat for cross-platform subscriptions; voice logging and AI insight summaries.

**Engineering.** Offline-first with optimistic writes and conflict-safe merges; the same automated release gate ships web (Vercel) and native (App Store / Play) from one push.

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

**AI & automation**  
<img src="https://img.shields.io/badge/Claude%20Code-D97757?style=flat-square&logo=anthropic&logoColor=white" alt="Claude Code"> <img src="https://img.shields.io/badge/Standards--as--code-1b2942?style=flat-square" alt="Standards-as-code"> <img src="https://img.shields.io/badge/Custom%20agents%20%26%20skills-1b2942?style=flat-square" alt="Custom agents &amp; skills">

</details>

## Engineering practices

- **TypeScript strict** everywhere; Zod validates every external boundary; impossible states made unrepresentable.
- **Test the behavior and the failure path** — a bugfix starts with a failing test that reproduces it.
- **Secrets only from Doppler** — never in code or git history; only public keys ship in client bundles.
- **AuthZ server-side** on every privileged path — enforced in Firestore rules / Supabase RLS, not just app code.
- **Tiered CI** (active / dabble / parked) keeps Actions minutes low; CLI-first deploys through the release gate.
- **Conflicts never handed back** — mechanical ones auto-resolved, real ones resolved and proven green with tests.
- **Accessibility & cross-platform** — semantic markup, keyboard paths, and Capacitor guards for native builds.

## Connect

<p align="center">
  <a href="https://www.linkedin.com/in/rockeish-mckenzie-p-e-8b83212a/"><img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=flat-square&logo=linkedin&logoColor=white" alt="LinkedIn"></a>
  <a href="https://beyondvolatility.com"><img src="https://img.shields.io/badge/Portfolio-0b1220?style=flat-square&logo=safari&logoColor=white" alt="Portfolio"></a>
  <a href="https://parentpodapp.com"><img src="https://img.shields.io/badge/ParentPod-111111?style=flat-square&logo=appstore&logoColor=white" alt="ParentPod"></a>
  <a href="https://www.instagram.com/parentpodapp/"><img src="https://img.shields.io/badge/Instagram-E4405F?style=flat-square&logo=instagram&logoColor=white" alt="Instagram"></a>
  <a href="https://www.tiktok.com/@parentpodapp"><img src="https://img.shields.io/badge/TikTok-000000?style=flat-square&logo=tiktok&logoColor=white" alt="TikTok"></a>
  <a href="https://x.com/ParentingP0fn9"><img src="https://img.shields.io/badge/X-000000?style=flat-square&logo=x&logoColor=white" alt="X"></a>
</p>

---

<sub>App repositories are private — this work ships to production, not public forks. This entire page — copy, tables, and every SVG — is generated from one data file (<a href="data/projects.json">data/projects.json</a>) by <a href="scripts/generate-showcase.mjs"><code>generate-showcase.mjs</code></a> and refreshed on a schedule by GitHub Actions. Full portfolio → <b><a href="https://beyondvolatility.com">beyondvolatility.com</a></b>.</sub>
