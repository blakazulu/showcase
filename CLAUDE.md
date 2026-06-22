# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Next.js 15 App Router portfolio — Liraz Amir's 19 shipped projects as a filterable, static-exported site deployed to Netlify (`sbz-showcase.netlify.app`) on every push to `main`. Stack: React 19, TypeScript strict, CSS Modules + design tokens, static export (`output: 'export'`). Read `docs/GOALS.md` first; it holds the mission, scope, and honesty constraints. `docs/git_netlify_projects.csv` is the raw project inventory.

## Commands

- `npm run dev` — local dev server (hot reload)
- `npm run build` — static export to `out/` (runs `next build`)
- `npm test` — Vitest unit tests (`components/__tests__/`)
- `npm run test:e2e` — Playwright responsive matrix (runs `next build` first; tests home + detail pages across 6 viewports)

## Architecture

### `lib/` — single source of truth

- `types.ts` — `Project`, `Visibility`, `Category` types
- `projects.ts` — the 19 projects array (the only place project data lives)
- `helpers.ts` — `COLORS`, `LANE_ORDER`, `PRIORITY`, `primaryCat`, `fmtDate`, `slug`, `sortByDateDesc`, `getStats`

### Components (`components/`)

Each component has a co-located CSS Module. Two client islands, everything else is a Server Component:

- **`CadenceChart`** (`"use client"`) — SVG deploy-cadence chart; dots plotted from `date` fields; undated projects excluded + footnoted. Clicking a dot dispatches `window.dispatchEvent(new Event("showcase:reset-filter"))` then scrolls to the card and flashes it (`article.flash`).
- **`HomeFilter`** (`"use client"`) — category filter chips + project grid. Listens for `showcase:reset-filter` to reset to "All".

### Pages

- `app/page.tsx` — Home: `Hero` wraps `CadenceChart` + `StatStrip` as children for single-`.wrap` alignment; `HomeFilter` below.
- `app/projects/[slug]/page.tsx` — per-project detail pages via `generateStaticParams` (one per project slug) + `generateMetadata`.

### Cross-island event contract

CadenceChart dot click → `showcase:reset-filter` window event → HomeFilter resets to "All" → chart scrolls to card (which carries the global `flash` class from `app/globals.css`).

### Derived rendering (never hardcode computed values)

- Stats strip (shipped/live/on-npm/AI/domains) computed at runtime from `PROJECTS` via `getStats`.
- Cadence dots placed from `date` fields; `date: null` projects are excluded from the timeline and listed in the chart footnote.
- Category bucketing via `PRIORITY` / `primaryCat`; spine color driven by `COLORS[primaryCat(p)]`.
- Card grid: `sortByDateDesc` (nulls last), filtered by active chip.

### CSS conventions

- `.flash` and `@keyframes flash` live in `app/globals.css` (global). All other animations live in component module files, gated under `@media (prefers-reduced-motion: no-preference)`.
- Design tokens in `app/globals.css` `:root`: cool-putty palette, flat color only (no gradients/glow), cobalt accent, IBM Plex Mono for metadata/dates. Do not introduce ad-hoc colors outside the token block.
- `style={{ "--cat": COLORS[cat] } as React.CSSProperties}` pattern for CSS custom properties in TSX (TypeScript safe cast).

## Responsive / safe-area rule

Fully mobile-first. `viewport-fit=cover` + `env(safe-area-inset-*)` via `max()` floors. Run `npm run test:e2e` after any UI change — it's the cross-resolution gate across 6 device viewports.

## Deploy safety

Push to `main` auto-deploys to production — **only push with explicit user approval**. `netlify.toml` at repo root tells Netlify to run `npm run build` and publish `out/`.

## Content rule (non-negotiable)

Credibility is the point. Descriptions must be sourced from the project's README or live site — never inflated or guessed. Status labels must stay accurate: `Private` = live but source-closed, `Fork` = forked repo, `Standalone` = no linked Git repo. Two known live-site corrections vs. the CSV: `az-ma-kore` is a national Pikud HaOref alert-analysis dashboard (not "Dimona alarms"); `lumi-kid` is an AI English tutor with Meitzav prep (not a generic "personal teacher"). Match the live truth, not the inventory shorthand.
