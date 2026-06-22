# Terminal Project Log — Design

**Date:** 2026-06-22
**Status:** Approved (pending spec review)

## Problem

The home page presents the 18 projects as a bento grid of `ProjectCard`s. The
cards are visually fine and the hover/spotlight motion is liked, but every tile
is structurally identical, so the grid reads as a generic, repetitive pattern.
The owner wants a genuinely different way to *showcase* the projects — not a
polish pass on the card.

## Direction

Lean fully into the site's existing identity ("Aurora hero → console-styled
deploy log"). The `HomeFilter` console already renders a terminal window
(traffic-light chrome, KPI chips, a `$ liraz --projects --cat=… --sort=newest`
prompt line, category filter buttons, and a count line). Today its *output* is a
bento grid; we replace that output with an **interactive terminal listing**:
each project is an `ls -l`-style row that expands inline to "run a build"
(staggered `✓ step` reveal borrowed from a CI/CD log) and then show the tagline,
the long pitch, and the links.

This is a contained change: the terminal frame, KPIs, prompt, and chips all stay
exactly as they are. Only the rendered output changes — `<ProjectGrid>` becomes
`<ProjectList>`.

## Scope

**Changes**
- `components/HomeFilter.tsx` — replace the single `<ProjectGrid projects={list} />`
  line with `<ProjectList projects={list} />`. The window, KPIs, prompt line,
  chips, count line, shuffle logic, and `grid-reveal` machinery are unchanged.

**New**
- `components/ProjectList.tsx` (+ `ProjectList.module.css`) — server component;
  maps the filtered `Project[]` to `ProjectRow`s in the terminal output area.
- `components/ProjectRow.tsx` (+ `ProjectRow.module.css`) — client component; one
  expandable terminal row per project.

**Removed**
- `components/ProjectCard.tsx` + `ProjectCard.module.css`
- `components/ProjectGrid.tsx` + `ProjectGrid.module.css`
- Their tests in `components/__tests__/`.
  (Both are only used by the home page; nothing else imports them.)

**Untouched**
- `app/projects/[slug]/page.tsx` and `ProjectDetail` (detail pages).
- `AuroraHero`, `AuroraShader`, `Footer`.
- `lib/` data, types, and helpers — `COLORS`, `primaryCat`, `fmtDate`,
  `sortByDateDesc`, `getStats`, `LANE_ORDER` are reused as-is.

## Component design

### `ProjectList` (Server Component)

- Props: `{ projects: Project[] }` (the already-filtered, already-ordered list
  from `HomeFilter`).
- Renders a container (the terminal output region) and one `<ProjectRow>` per
  project, passing `project` and an `initiallyOpen` flag.
- Determines `initiallyOpen`: the row whose `project` has the most recent `date`
  (max non-null date) starts expanded — independent of the shuffled display
  order. Computed from the full `PROJECTS`/list via the existing date helper so
  it is deterministic for SSR.

### `ProjectRow` (Client Component)

- Props: `{ project: Project; initiallyOpen?: boolean }`.
- Renders a native `<details name="projects" open={initiallyOpen}>`:
  - `<summary>` = the `ls -l` line: a disclosure triangle, the status glyph
    (colored via `--cat`), the project name, the tech stack (compact), and the
    date (`fmtDate`). Status follows the existing rule — the `Private` *label* is
    hidden but the glyph/state stays accurate (`live`/`public`/`fork`/`norepo`).
  - Panel = the build-step reveal (`✓ resolving project graph` … `✓ publishing
    to edge`, each with a short faux duration), then the `tagline`, the `desc`
    (long pitch), then the link row: `open ↗` (to `/projects/[slug]`) plus any of
    `live` / `github` / `npm` / `play` / `store`, styled like today's card foot.
- `--cat` custom property set from `COLORS[primaryCat(project)]` (same pattern as
  the current card: `style={{ "--cat": … } as React.CSSProperties}`).
- The detail-page link lives **inside the panel**, never inside `<summary>` — no
  nested interactive elements.

## Behavior decisions (confirmed)

1. **Order: keep the random shuffle.** `HomeFilter`'s existing
   deterministic-SSR-then-client-shuffle + `grid-reveal` reveal is retained
   unchanged — the list order is randomized per visit.
2. **Accordion: one open at a time.** Achieved natively with
   `<details name="projects">` (modern browsers make same-named `<details>`
   mutually exclusive — no JS needed).
3. **Initial state: newest project auto-expanded.** The most recent project by
   date renders with `open`, even though its position in the list is shuffled.

## Interaction, motion & accessibility

- **Keyboard / a11y:** native `<details>/<summary>` provides focus, Enter/Space
  toggling, and the expanded/collapsed semantics for free.
- **No-JS fallback:** rows render and expand without JS (native element).
  Filtering chips are already JS-only; with JS off, all rows simply show.
- **Build-step reveal:** a short staggered animation (~600ms total) plays the
  first time a panel opens; instant on reopen. Animation lives in
  `ProjectRow.module.css`, gated under
  `@media (prefers-reduced-motion: no-preference)` per project convention; under
  reduced motion the steps appear instantly.
- **Hover:** keep a lightweight accent on row hover (border/background shift in
  `--cat`), consistent with the current console aesthetic.

## Responsive

- Fully mobile-first. The `<summary>` uses a grid that collapses on narrow
  viewports (name on its own line, stack + date beneath) so nothing overflows.
- Must pass the Playwright 6-viewport matrix and the horizontal-overflow gate.
  Run `npm run test:e2e` after implementation.

## Testing

- **Unit (Vitest):**
  - `ProjectRow` — renders the status glyph/label per visibility rule, the name,
    the tech chips, the date, and the panel's links (including the detail-page
    link); `Private` label hidden but row still renders.
  - `ProjectList` — renders exactly one row per project; marks the newest as
    `initiallyOpen`.
  - `HomeFilter` — update the existing test: filtering by category still narrows
    the rendered rows; count line still reflects the filtered length.
  - Remove the `ProjectCard` / `ProjectGrid` tests.
- **E2E (Playwright):** existing home + detail matrix; add a light assertion that
  project rows are present and a summary toggles its panel. Keep within the
  current 6-viewport run.

## Out of scope (YAGNI)

- A free-text command input / real shell parser. Interaction stays
  chips-for-filtering + click-to-expand. (Possible future enhancement.)
- Any change to detail pages, hero, or the data model.
- A `featured`/spanning concept — it does not apply to a linear log and is
  dropped with `ProjectCard`.

## Content rule

All copy stays truthful-marketing per `CLAUDE.md` — `tagline`/`short`/`desc` come
straight from `lib/projects.ts`; no new claims are introduced. The build-step
lines (`resolving project graph`, etc.) are decorative terminal flavor, not
factual claims about any project's pipeline.
