<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/hero.dark.svg">
  <img src="assets/hero.light.svg" alt="Rock — Reliability &amp; systems engineer · full-stack builder. 18 repositories, 8.6K commits, 976K lines of source, 7 apps in production, 1 engineer." width="100%">
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

18 repositories, one system: a shared hub for distribution, a portfolio of products, two back ends, and native + web delivery connected by common release controls.

<p align="center"><picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/orbit.dark.svg">
  <img src="assets/orbit.light.svg" alt="Portfolio constellation — ParentPod, Longevity, RealInvestorX, Apex, Compliance OS, Bid Spotter, EngiByte, JaLingo, Unwind, TheLoop and the Beyond Volatility hub connected through shared infrastructure, run by one engineer." width="680">
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

<sub>Portfolio snapshot dated Sep 24, 2026. These figures are computed from the git history and tracked source tree; the visible date prevents an old snapshot from presenting as live telemetry.</sub>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/commits.dark.svg">
  <img src="assets/commits.light.svg" alt="Commits per repository — ParentPod 2,668; RealInvestorX 1,204; Longevity 1,157; Apex 947; Compliance OS 910; TheLoop 658; Beyond Volatility 617; EngiByte 168; JaLingo 163; Bid Spotter 87; Unwind 16. ~8.6K total, single author." width="100%">
</picture>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/languages.dark.svg">
  <img src="assets/languages.light.svg" alt="Language mix across 976K lines of tracked source — TypeScript 65.6%, JavaScript 25.7%, CSS 4.1%, SQL 1.7%, PHP 1.3%, Python 1.1%, Other 0.6%." width="100%">
</picture>

## Recently shipped

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/velocity.dark.svg">
  <img src="assets/velocity.light.svg" alt="Shipping cadence over the trailing 90 days — ParentPod 473 commits; Longevity 385 commits; Compliance OS 369 commits; RealInvestorX 286 commits; EngiByte 165 commits; JaLingo 163 commits; Apex 156 commits; TheLoop 109 commits; Bid Spotter 74 commits; Unwind 16 commits." width="100%">
</picture>

<sub>Still shipping — latest version and commit volume over the last 90 days, as of Sep 24, 2026. Regenerated from git, not hand-edited.</sub>

| Product | Latest | Commits · 90d |
|---|---|---|
| **ParentPod** | `v2.62.441` | 473 |
| **Longevity** | `v2.0.124` | 385 |
| **Compliance OS** | `v3.28.5` | 369 |
| **RealInvestorX** | `v5.31.1` | 286 |
| **EngiByte** | `v1.3.1` | 165 |
| **JaLingo** | `v0.5.0` | 163 |
| **Apex** | `v0.2.6` | 156 |
| **TheLoop** | `v1.2.0` | 109 |
| **Bid Spotter** | `v2.1.0` | 74 |
| **Unwind** | `v1.1.0` | 16 |

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
| **[Unwind](https://unwind.beyondvolatility.com)** <br><sub>`Live preview · free`</sub> | Your daily reset. | TypeScript · Next.js · React · Firebase | [Live ↗](https://unwind.beyondvolatility.com) |
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

<sub>What 74 rules the incident record paid for. Each one comes from a real failure in this portfolio, has a check that fires on recurrence, and is maintained in the same file that governs every release — regenerated here, not hand-edited.</sub>

- **Prose is a hope; only something that fires is a fix.** A rule that only lives in a document is a hope. Every recurring failure gets a check that fires on its own — a scheduled job, a CI gate, a hook, or a test — and the fix is not done until that check exists.
- **Built is not wired; correctness and activation are separate claims.** Shipping code is not the same as activating it. A guard that is written and tested but never registered protects nothing, so wiring is verified as its own step.
- **Watchdogs enumerate, never sample, and measure their own coverage.** A monitor that samples will eventually report green over the part it did not look at. Checks enumerate their whole inventory from the live system and fail when their own coverage shrinks.
- **A tool that silently does less than asked fails in the unsafe direction.** A command that accepts an option it does not implement reports success while doing less. Unknown flags are errors, and "could not measure" is never displayed the way a real number is.
- **Green locally and green in CI are evidence about the build, never the deploy.** "CI is green" describes the build, not what users are running. Every release is verified by reading the live surface afterward, and a green pipeline is never the last step.
- **Constant and graceful fallbacks convert failures into silence.** A graceful fallback is a silent failure with better manners. Missing data is reported, never replaced by a plausible default that hides how often the gap occurs.
- **A monitor is only as good as the assertions it still contains.** A health check that returns "ok" over an empty list of assertions is worse than none. Monitors are verified for shape and freshness, not just for having run.
- **Copy the value, never the label; a comment's safety claim is testable.** The label on a thing and the value inside it drift apart. Billing, trial length, and configuration are read from the value the system actually enforces, and any comment claiming "this is safe" gets a test.

<details>
<summary><b>66 more</b></summary>

- **Shared-infrastructure failures wear the costume of code bugs.** When many pipelines share one machine or one budget, an outage looks like a code failure. A monitor establishes whether a red result is fixable by any commit before it files work against the code.
- **A test double must refuse what the real system refuses.** A stand-in used for testing has to say no wherever the real system says no. If it is more permissive, every test passes and the live system still refuses, which is the hardest kind of gap to see.
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
- **Removing a control is only safe once you know which mechanism was the control.** "Remove the guardrail" names an effect, not a file — list every mechanism producing that effect and split enforcement from detection before deleting one of them.
- **A monitor's silence is a finding; publish the silence, not the last verdict.** A monitor that stops running looks exactly like a calm week; make the age of the data a reported number, and let it outrank the verdict.
- **A lesson written at one call site is not a fix.** Two tools that talk to the same API should share the code that signs the request, or the second one will meet a quirk the first already learned.
- **"Shipped" must mean reached people, not reached a lane.** A build that reached your test track has not shipped. Measure the distance between where a release stopped and where your customers are.
- **A safe ceiling nothing opts into is a bug wearing a feature's clothes.** A safety ceiling that nothing switches on protects nobody. When a config value has both a conservative default and a documented safe maximum, verify in production that something actually requests the maximum — don't assume the default was meant to be temporary just because a comment says so.
- **A percentage cannot say "broken" from "nothing to measure".** A conversion rate with no population behind it is not a zero — report what could be measured, what could not, and why, as three different answers, not one misleading percentage.
- **A rule that reads the old document must constrain the new one.** A security rule that only says who may write, while the server later trusts what was written, lets the subject of a decision author its inputs. Write rules constrain the new document, not just the identity making the change.
- **A config value the platform will refuse is not configured.** A config value your tool accepts can still be refused by the program that actually reads it, and a daemon keeps the copy it read at startup.
- **A monitor that can only say "finding" or "silence" cannot report its own illness.** A check that reports only problems cannot tell you it stopped working. Make it prove it ran, and test it against an example it should fail.
- **Tune the threshold only after you can defend the evidence selector.** Pick what proves the job ran before arguing about how long is too long. A proxy anyone else can touch stops proving anything the moment they do.
- **Scheduled work competes for your interactive quota, and it always loses.** Scheduled automation and your own heavy usage can draw on one budget. The schedule loses, quietly, and its status may still read as success.
- **A platform enforces its own operation model, not the one your comment describes.** A permission protects the operation the platform thinks you performed, not the one the comment above it names. Replacing a stored file can count as creating it, so a rule that restricts updates may leave content wide open — and because the rule and its comment agree with each other, review cannot see it. Settle each boundary by making the request and watching which rule answers.
- **A fixture that disagrees with production about a field's TYPE tests the fixture.** Databases that sort values by type quietly return nothing when a query's value is the wrong type — no error, just an empty result. Tests miss it when their sample data uses the type the code expects rather than the type the database holds. Worse, code syncing server state against local state reads that empty answer as a deletion and discards good data.
- **A counter that increments on ATTEMPT will report a healthy system that delivers nothing.** If you count messages when you try to send them rather than when they arrive, your dashboard stays green while nobody hears from you — and any rule like "skip the email, we already sent a notification" starts silencing the one channel that still works. Record what was delivered, make the skip rule depend on it, and when that logic breaks let it send twice rather than stay quiet.
- **An element that captures taps must never need an animation to become visible.** An invisible overlay that still catches taps is among the worst bugs an interface can have: everything looks fine, nothing responds, and people assume the app is broken and leave. Anything covering the screen should be visible the moment it appears; animate only the content inside it.
- **Registering a resource in one place leaves it invisible to the thing that starts it.** A job registered where it is defined but not where it is started never runs, and waiting forever looks exactly like a slow machine.
- **"any" is not "all", and a fleet health check that ORs reports green until the last member dies.** A health check that asks "is any of it alive" will report green until the last one dies. If you meant all of them, count them.
- **Being thorough on the same box as the thing you are waiting for is a way of breaking it.** Running your own thorough checks on the machine that is already busy finishing the job can be the thing that fails it.
- **A liveness check must identify the holder, not its species.** Code that waits for a lock first asks whether whoever holds it is still running. If that check looks for "a process like the holder" rather than the exact one, it matches the asker itself, decides the dead holder is alive, and waits forever. Record the holder's process id and ask about that. And if something else is timing you, give up before it does.
- **an id you never check for uniqueness is not an id.** If your records are keyed by a number someone types, check that no two records share one. Checks that look at each record separately can never catch it, and a duplicate can quietly inherit the original's passing grade.
- **A document that records its own supersession contains both answers.** Documents keep their own history, so the old answer and the new one sit in the same sentence. Any tool reading that text has to know which is current, and should say "I don't know" rather than quietly using the old one.
- **A default nobody declares is a resource everybody claims.** Tools pick defaults, so every project that does not choose a port or a path takes the same one. It works until two run together, and then the second one can quietly take over the first one's data rather than simply failing. Name the defaults, and have something check that no two projects chose alike.
- **Merged is not deployed; ask production what it is running.** Shipping code to the main branch is not the same as running it. Every backend needs something that deploys on merge and then asks the live system what it is actually running — comparing content, not timestamps, because a redeploy of identical files looks like a change and is not one.
- **A cache on a persistent runner is a tax, not a cache.** A build cache only helps when the machine forgets between runs. On a machine that remembers, it adds a slow upload of files already sitting there — and because that cost lands after the tests pass, the job gets killed at its time limit with a perfectly green log, which looks like flakiness rather than configuration.
- **An edit that parses is not an edit that applied; read the value back.** In configuration files a repeated setting usually means the last one wins, so adding a line above an existing block can quietly change nothing at all — the file still parses and the change still looks right when reviewed. Read the value back after editing, and be careful that the tool you check with is not the one performing the overwrite.
- **A credential fallback hides a dead credential; fail instead.** If a job says it runs as a particular identity, make something in it actually use that identity and fail when it cannot. Tools quietly fall back to whatever login they can find, so a dead credential can sit unnoticed for months behind a wall of successful runs.
- **An empty 2xx is not content; check the body before diagnosing the layer above it.** A 200 with no body is a failure wearing a success code; check what came back before deciding what broke.
- **A healthy app endpoint says nothing about its identity provider.** A product can be online while its sign-in provider rejects every user.
- **Credential ignore rules must name the formats people actually download.** Ignore credential files using the extensions vendors actually deliver,
- **A fix written next to one call site is invisible at the next one.** A fix applied by hand at one call site is a patch, not a rule — write the scanner that would have caught the second occurrence in the same file.
- **A credential rotation is not done until the old credential is disabled.** Finishing a credential rotation means disabling the old credential in
- **A shared runner is a shared resource; capacity is a class of incident, and a split runner splits shared baselines too.** When you move CI off a saturated shared runner, keep every trigger of a workflow that carries pixel-exact baselines on the same environment — or the fix itself becomes a new source of false reds.
- **Every runtime that holds a copy of a secret needs a drift check.** A secret copied into several runtimes can go stale in any one of them;
- **A shared staleness clock attributes drift to whatever changed last, correctly or not.** A monitor that watches several things under one trigger must time each one against its own evidence — otherwise an edit to your neighbor reads as proof that you changed.
- **A lockfile regenerated on one OS can silently drop the binaries another OS builds with.** A lockfile shared by several operating systems is only checked by the one CI runs on; test that it still carries the native pieces the other builds need, or the least frequent build finds out first.
- **Never let an agent print a secret value; assume every command trace and config-read response is live until proven otherwise.** Agents should never print a secret's value, even from an operation labeled read-only — a debug trace or a config probe's raw response can carry live credentials without anyone intending it.
- **A release lane that orders steps differently from CI is a different environment; reproduce its order before shipping.** A release pipeline that runs steps in a different order from CI is a different environment, so reproduce its order before trusting a green CI run.
- **A release step that changes a value must update what checks that value in the same commit.** If a release step changes a value a separate check verifies, update that check's target in the very same commit — otherwise the next unrelated change is the one that gets blamed for the drift.
- **Verify a deploy the way a user fetches it.** Check a deploy the way your users fetch it. A cache in the middle can hand a command-line check the new file and every visitor the old one.
- **Every branch of an update handler ends in a navigation.** An update button that can finish without moving the user to the new version is broken, even when it never throws.
- **A gate's answer is its own exit status, and an empty answer is not green.** Check the gate's own exit code before you merge. A pipe can turn a failed check into a green light, and an empty status list is not a pass.
- **One authority per topic; a retired competitor is deleted, not archived.** Give every topic exactly one home and delete the copies; an archived duplicate still misleads whoever searches for it next.

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
