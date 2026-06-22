# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Next.js 15 App Router portfolio — Liraz Amir's 18 shipped projects as a filterable, static-exported site deployed to Netlify (`sbz-showcase.netlify.app`) on every push to `main`. The design is **"Aurora hero → console-styled terminal log"**: a bold gradient hero ("I ship real products.") over a flowing aurora (CSS gradient base + an optional Three.js shader accent), bridging into a terminal-window "deploy log" — KPI chips, a prompt line that reflects the active filter, category chips, and an expandable terminal-row list of projects. Stack: React 19, TypeScript strict, Three.js + `@react-three/fiber` + `@react-three/drei` (shader accent only — *not* the centerpiece), CSS Modules + design tokens, static export (`output: 'export'`). Theme is dark. Read `docs/GOALS.md` first; it holds the mission, scope, and honesty constraints. `docs/git_netlify_projects.csv` is the raw project inventory.

## Commands

- `npm run dev` — local dev server (hot reload)
- `npm run build` — static export to `out/` (runs `next build`)
- `npm test` — Vitest unit tests (`lib/__tests__/` helpers/data + `components/__tests__/` ProjectRow/ProjectList/HomeFilter)
- `npm run test:e2e` — Playwright responsive matrix (runs `next build` first; tests home + detail pages across 6 viewports)
- `npm run lint` — Next.js lint

Configs: `next.config.mjs` (`output: 'export'`, `images.unoptimized`), `vitest.config.ts` (jsdom; excludes `e2e/`), `playwright.config.ts` (6-viewport matrix, serves `out/`), `netlify.toml` (build + publish `out/`).

## Architecture

### `lib/` — single source of truth

- `types.ts` — `Project`, `Visibility`, `Category` types
- `projects.ts` — the 18 projects array (the only place project data lives)
- `helpers.ts` — `COLORS`, `LANE_ORDER`, `PRIORITY`, `primaryCat`, `fmtDate`, `slug`, `sortByDateDesc`, `getStats`. `COLORS` are brightened to glow on the dark surface and are the single source of category color (tile `--cat` accent, chips).

### Components (`components/`)

Each component has a co-located CSS Module. Client islands are `AuroraHero`, `AuroraShader`, `HomeFilter`; everything else (`ProjectRow`, `ProjectList`, `ProjectDetail`, `Footer`) is a Server Component:

- **`AuroraHero`** (`"use client"`) — the hero: bold gradient headline + CTAs + a console prompt line bridging into the log. Background is a CSS aurora (animated gradient blobs, always present) with `AuroraShader` layered over it via `mix-blend:screen`. Detects `prefers-reduced-motion` / low-power and only mounts the shader when capable.
- **`AuroraShader`** (`"use client"`) — a single full-screen R3F `<ScreenQuad>` fragment shader (flowing fbm aurora, one draw call). Dynamic-imported with `ssr:false` so static export stays intact. Purely a visual accent; the site is fully usable without it.
- **`HomeFilter`** (`"use client"`) — the "deploy log" console: a terminal window (traffic-light chrome + sticky header with live KPI chips), a prompt line that updates with the active filter (`--all` / `--cat=…`), an output count line, category filter chips (`<button>` per category), and `ProjectList`.
- **`ProjectRow`** — a console-styled, expandable terminal row (the project "deploy log" line). A native `<details name="projects">` (free keyboard support, no-JS fallback, native single-open accordion): the `<summary>` is an `ls -l` line (disclosure triangle · status glyph · name + status label, hidden for `Private` · tech · date), and the panel reveals a staggered `✓` build-step animation, the `tagline`, the long `desc`, and the link row (`open ↗` to `/projects/[slug]` plus `live`/`github`/`npm`/`play`/`store`). Accent driven by `COLORS[primaryCat(p)]` (`--cat`).
- **`ProjectList`** — the terminal output region (`data-testid="project-list"`); renders one `ProjectRow` per project and pre-expands the newest project by date (`sortByDateDesc(projects)[0]`).

### Pages

- `app/page.tsx` — Home: `AuroraHero` → `HomeFilter` (the console log) → `Footer`.
- `app/projects/[slug]/page.tsx` — per-project detail pages via `generateStaticParams` (one per project slug) + `generateMetadata`.

### Derived rendering (never hardcode computed values)

- KPI chips (shipped/live/AI/npm) and the output count line are computed at runtime from `PROJECTS` via `getStats` / the filtered list.
- Category bucketing via `PRIORITY` / `primaryCat`; row accent driven by `COLORS[primaryCat(p)]` (the `--cat` CSS var).
- List order: `sortByDateDesc` (nulls last), filtered by the active chip; newest project pre-expanded.

### CSS conventions

- `.flash` and `@keyframes flash` live in `app/globals.css` (global). All other animations live in component module files, gated under `@media (prefers-reduced-motion: no-preference)`.
- Design tokens in `app/globals.css` `:root`: dark palette (near-black surfaces, cobalt accent, brightened category glow colors), IBM Plex Mono for metadata/dates/console UI. `color-scheme: dark`. Do not introduce ad-hoc colors outside the token block. `html`/`body` use `overflow-x: clip` to keep the aurora and any wide tiles from triggering horizontal scroll (the Playwright overflow gate).
- `style={{ "--cat": COLORS[cat] } as React.CSSProperties}` pattern for CSS custom properties in TSX (TypeScript safe cast).

## Responsive / safe-area rule

Fully mobile-first. `viewport-fit=cover` + `env(safe-area-inset-*)` via `max()` floors. Run `npm run test:e2e` after any UI change — it's the cross-resolution gate across 6 device viewports.

## Deploy safety

Push to `main` auto-deploys to production — **only push with explicit user approval**. `netlify.toml` at repo root tells Netlify to run `npm run build` and publish `out/`.

## Content rule (non-negotiable)

Credibility is the point. Copy uses a **truthful-marketing** voice — punchy and benefit-led, but every concrete fact must be real (sourced from the project's README or live site). Frame real features compellingly; never invent claims, metrics, or capabilities. Each project carries three tiers: `tagline` (hook), `short` (one-sentence pitch shown in row summaries), `desc` (long paragraph on detail pages + the expanded project row). Status labels must stay accurate: `Private` = live but source-closed, `Fork` = forked repo, `Standalone` = no linked Git repo (note: the "Private" label is intentionally hidden in the UI, but the data/`vis` stays accurate). Two known live-site corrections vs. the CSV: `az-ma-kore` is a national Pikud HaOref alert-analysis dashboard (not "Dimona alarms"); `lumi-kid` is an AI English tutor with Meitzav prep (not a generic "personal teacher"). Match the live truth, not the inventory shorthand.
