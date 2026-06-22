# Project Showcase — Goals & Mission

## Mission

Turn a scattered collection of repos and deployments into a single, credible portfolio that shows what I can build — and how broadly. The body of work should communicate, at a glance:

- **Range** — web apps, AI-powered products, developer tooling (MCP servers), and browser extensions.
- **Depth** — real, shipped products with thought-through features, not throwaway demos.
- **Ownership** — most projects are designed, built, and deployed end to end (frontend, serverless backend, AI integration, deployment).

A visitor (employer, client, or collaborator) should be able to land on the showcase and within 30 seconds understand who I am as a builder and click straight into live products.

## What we're building

An interactive, self-contained **showcase page** (`showcase.html`) that presents each project as a card with a description, tech stack, and direct links to the live site, GitHub, and npm where they exist. It's backed by a matched inventory (`git_netlify_projects.csv`) of every repo and its corresponding Netlify deployment.

## What we want to achieve

1. **One source of truth** — every project I want to show, in one place, with accurate descriptions and working links.
2. **Accurate matching** — each live site correctly tied to its source repo (done and verified).
3. **Real detail per project** — what each app does, who it's for, and what it's built with — sourced from the actual READMEs and live sites, not guesses.
4. **A presentable artifact** — clean, filterable, looks intentional, easy to share or host.
5. **Honest scope** — clearly distinguish public products, private/personal builds, and forks.

## Scope

**In scope (19 entries):**

- 12 public projects with full detail (CYCLE, Past Palette, Save The Past, ArcheoTriage, STEM Explorers, חשבונייה / Math Practice, KeyQuest, FloatJet, AI Image Generator, Search MCP, Hotjar Blocker, ScalpelPDF).
- 5 private/personal apps that are live (home, aiemd_platform, ChatHop, az-ma-kore, lumi-kid).
- 2 standalone Netlify sites with no Git repo (Bolt build, Netlify Drop).

**Out of scope (for now):** the ~40 older repos and forks not selected for the showcase.

## Success criteria

- Page loads as a single file, no build step, works offline-ish (logos/links resolve when online).
- Every public project has an accurate description, tech stack, and at least one working link.
- Category filters work (Web App, AI, Dev Tool, Education, Extension, Content).
- Nothing misleading: private = labeled private, forks = labeled forks.

## Current status

- ✅ Repo + Netlify inventory built and matched (`git_netlify_projects.csv`).
- ✅ Showcase page built with all 19 cards, filters, and stats (`showcase.html`).
- ✅ 12 public projects fully detailed from their READMEs.
- ✅ 7 remaining cards (5 private + 2 standalone) enriched with real descriptions sourced from their live sites — no placeholders left. Corrected two inventory drifts in the process: `az-ma-kore` is a national Pikud HaOref alert-analysis dashboard (not "alarms in Dimona"), and `lumi-kid` is an AI English tutor with Meitzav prep (not a generic "personal teacher").

## Next steps

1. (Optional) Add real embedded screenshots — requires a way to host the captured images.
2. (Optional) Host the showcase on its own domain or as a GitHub Pages / Netlify site.
3. (Optional) Reconcile `git_netlify_projects.csv` descriptions with the corrected live-site facts so the inventory and page stay in sync.
