# Design: Migrate showcase to a Next.js React app

**Date:** 2026-06-22
**Status:** Approved (pending spec review)

## Goal

Replace the single-file `showcase.html` with a full React app, preserving the approved
"deploy log" design and all sourced project content. Same mission as `docs/GOALS.md`:
a credible, shareable portfolio that conveys range + depth + velocity in 30 seconds and
routes visitors to live products. No 3D in this phase.

## Decisions (from brainstorming)

| Question | Decision |
|---|---|
| Framework | **Next.js 15 (App Router) + React 19 + TypeScript**, `output: 'export'` (fully static) |
| 3D / Three.js | **None this phase** (skills installed for later work) |
| Routing | **Home + per-project detail pages** (`/projects/[slug]`) |
| Styling | **CSS Modules + design tokens** (port existing CSS ~1:1) |
| Deploy | **Netlify**, auto-deploy on push to `github.com/blakazulu/showcase` → `sbz-showcase.netlify.app` |
| Legacy file | **Delete `showcase.html`** (no `legacy/` folder) |

## Architecture

### Rendering model
Static export. Default to React Server Components (static HTML). Exactly two client islands:
- **`CadenceChart`** (`'use client'`) — hover tooltip + mount animation; dot click scrolls to card.
- **`HomeFilter`** (`'use client'`) — wraps FilterBar + ProjectGrid, owns `activeCat` state.

All other components (TopBar, Hero, StatStrip, ProjectCard, Footer, detail page) are server components.

### Routes
- `/` — TopBar → Hero → CadenceChart → StatStrip → HomeFilter(FilterBar + ProjectGrid) → Footer.
- `/projects/[slug]` — static page per project via `generateStaticParams`; `generateMetadata`
  produces per-project title/description/OG tags. **Honest expansion only**: status, deploy date,
  full description, complete stack, all links, timeline position, plus empty-for-now
  `highlights[]` / `screenshots[]` slots to fill when real content exists. No invented case studies.

### Data layer (single source of truth)
- `lib/types.ts` — `Project`, `Category`, `Visibility` types. Project fields:
  `name, slug, tagline, date (ISO|null), cats[], vis, icon, desc, tech[], live?, github?, npm?,
  highlights?[], screenshots?[]`.
- `lib/projects.ts` — `PROJECTS: Project[]` ported verbatim from current data (content unchanged).
- `lib/helpers.ts` — pure functions: `COLORS`, `LANE_ORDER`, `PRIORITY`, `primaryCat`, `fmtDate`,
  `slug`, `getStats`, `sortByDateDesc`. Imported by home, detail pages, and the chart.

### Styling
- `app/globals.css` — `:root` tokens (colors, fonts, radius), reset, drafting-grid `body`
  background, shared keyframes, `prefers-reduced-motion` gating.
- One `*.module.css` per component, mirroring current class structure.
- Fonts via `next/font/google` (Archivo, Hanken Grotesk, IBM Plex Mono) — self-hosted at build.

### Component inventory
`components/`: `TopBar`, `Hero`, `CadenceChart`, `StatStrip`, `FilterBar`, `ProjectGrid`,
`ProjectCard`, `Footer`, `ProjectDetail` — each with a co-located `.module.css`.

## Build & deploy

- `next.config.mjs`: `output: 'export'`, `images.unoptimized: true` (required for static export).
- `netlify.toml`: `command = "next build"`, `publish = "out"`. **Mandatory** — without it,
  deleting `showcase.html` and pushing would break the live site.
- `.gitignore`: add `node_modules/`, `.next/`, `out/` (keep existing `.claude/`).
- **Deploy safety:** every push to `main` is a production deploy. Do not push until
  `next build` succeeds locally and produces `out/` with the home page + all project pages,
  and the user approves the push.

## Testing & verification

- **Vitest** unit tests for pure helpers: `primaryCat` bucketing (priority order),
  `fmtDate` (incl. `null`), `slug`, `getStats` counts. These hold real logic.
- **Integration gate:** `next build` must succeed and emit `out/index.html` plus one
  `out/projects/<slug>/index.html` per project.
- Manual smoke test of `out/` (open in browser / `npx serve out`) before pushing.

## Repo layout (after migration)

```
showcase/
  app/
    layout.tsx            globals + root metadata + fonts
    page.tsx              home
    globals.css
    projects/[slug]/page.tsx
  components/*.tsx + *.module.css
  lib/{types,projects,helpers}.ts
  lib/__tests__/helpers.test.ts
  public/                 favicons (screenshots later)
  next.config.mjs · tsconfig.json · package.json · netlify.toml · vitest.config.ts
  CLAUDE.md               (updated for new architecture)
  docs/GOALS.md · docs/git_netlify_projects.csv · docs/superpowers/specs/…
  .claude/skills/…        (gitignored, local)
  [DELETED] showcase.html
```

## Out of scope (this phase)
- Three.js / 3D anything.
- Real per-project case-study copy or screenshots (structure ready; content added later).
- CMS / data backend (data stays a typed TS module).
- Reconciling `docs/git_netlify_projects.csv` with the corrected live-site facts.

## Risks
- **Live-site breakage on push** — mitigated by `netlify.toml` + local build gate before push.
- **Static export constraints** — no server features (route handlers, ISR, image optimization);
  acceptable, the site is fully static.
- **Design drift** — mitigated by porting CSS ~1:1 via CSS Modules rather than restyling.
