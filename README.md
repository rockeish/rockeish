<img src="assets/hero.svg" alt="Rock — reliability & systems engineer, full-stack builder. 9 repositories, 5.9K commits, 678K lines of code, 4 apps in production, 1 engineer." width="100%">

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB" alt="React">
  <img src="https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white" alt="Next.js">
  <img src="https://img.shields.io/badge/Capacitor-119EFF?style=flat-square&logo=capacitor&logoColor=white" alt="Capacitor">
  <img src="https://img.shields.io/badge/Node.js-5FA04E?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Firebase-DD2C00?style=flat-square&logo=firebase&logoColor=white" alt="Firebase">
  <img src="https://img.shields.io/badge/Supabase-3FCF8E?style=flat-square&logo=supabase&logoColor=white" alt="Supabase">
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white" alt="Vercel">
</p>

By day, reliability compliance at a large energy company — 12 years keeping the power grid up. Nights and weekends, I design, build, ship, and operate every app below **solo**, on an agent-automation platform I built so the repetitive work happens *under review* instead of by hand.

<br>

<img src="assets/architecture.svg" alt="Ecosystem architecture — clients to apps to back ends to delivery, across Firebase and Supabase, shipping to Vercel, Firebase Hosting, and the app stores." width="100%">

<br>

<img src="assets/commits.svg" alt="Commits per repository — ParentPod 2,229, RealInvestorX 934, Longevity 809, Apex 797, Compliance OS 552, Beyond Volatility 422, and more; ~5,900 total, single author." width="100%">

<br>

<!-- SHOWCASE:START -->

## Portfolio

### Consumer

#### [ParentPod](https://parentpodapp.com) — `Flagship · live`
Coordination layer for co-parents — one real-time shared timeline for feeds, naps, meds, and handoffs, with role-scoped caregiver access.  
<sub>**TypeScript · React · Vite · Capacitor · Firebase** · iOS / Android / Web</sub>

- Live on the App Store and Google Play; offline-first Capacitor build
- Firestore rules enforce multi-caregiver access server-side; native IAP via RevenueCat

#### Longevity — `Active`
Habit & wellness companion — streaks, daily check-ins, and progress insights.  
<sub>**TypeScript · Next.js · React · Capacitor · Firebase** · Web / iOS / Android</sub>

- Next.js + Capacitor; accessible Radix UI; Sentry-instrumented, hardened CSP

### Data & analysis

#### RealInvestorX — `Active`
Real-estate deal-analysis workspace — underwrite, compare, and semantically search deals.  
<sub>**TypeScript · React · Express · Turborepo · Supabase** · Web</sub>

- Turborepo monorepo; Supabase Postgres + pgvector for semantic deal search
- In-flight: HttpOnly-cookie session cutover off client-side token storage

#### Apex — `Maintained`
Personal-finance tracker — import, categorize, and chart cash flow and net worth.  
<sub>**TypeScript · React · Vite · Supabase** · Web</sub>

- React + Vite on Supabase (Postgres + row-level security); spreadsheet-style importer

### Platform

#### Compliance OS — `Maintained`
Controls & audit-evidence platform — map policies to controls to evidence, with review workflows.  
<sub>**TypeScript · React · Firebase** · Web</sub>

- Full-stack evidence management with rich-text authoring; role-based review workflows

#### [Beyond Volatility](https://beyondvolatility.com) — `Live`
Public hub and blog — the front door to the portfolio and long-form writing.  
<sub>**WordPress · PHP** · Web</sub>

- Custom child theme; the canonical public index of every product

## The engineering system behind it

A standards-as-code library plus an agent-orchestration layer turns intent into reviewed, tested, deployed changes across every repo — including parallel fan-out and an adversarial review pass before merge.

| Command | What it does |
|---|---|
| `/ship` | release gate — version, build, test, deploy, auto-merge, doc-freshness |
| `/sync` | rebase main, auto-resolve mechanical conflicts |
| `/audit` | security, dependency, dead-code, a11y & perf sweep |
| `/new-project` | scaffold a repo with standards, CI, secrets, context primer |
| `/update-brain` | maintain the knowledge base and reconcile the task hub |
| `/improve` | fold a sharper prompt back into a skill so it compounds |

**Standards-as-code:** `architecture` · `coding-standards` · `typescript` · `react` · `security` · `git-workflow` · `startup` — symlinked into every repo *and* every agent's context, plus 8 reusable skills.

<!-- SHOWCASE:END -->

---

<sub>App repositories are private — this work ships to production, not public forks. Everything here (metrics, diagrams, portfolio) is regenerated from a single data file by <a href="scripts/generate-showcase.mjs"><code>scripts/generate-showcase.mjs</code></a>, SVGs included. The full portfolio lives at <b><a href="https://beyondvolatility.com">beyondvolatility.com</a></b>.</sub>
