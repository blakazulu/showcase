# Terminal Project Log Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the home page's bento-card grid with an interactive terminal "deploy log" — each project is an `ls -l`-style row that expands inline to reveal CI-style build steps plus its pitch and links.

**Architecture:** The `HomeFilter` console (terminal window chrome, KPI chips, prompt line, category filter buttons) is unchanged; only its *output* changes. The single `<ProjectGrid>` line is swapped for a new `<ProjectList>` that renders one `<ProjectRow>` per project. Each row is a native `<details name="projects">` element — giving free keyboard support, a no-JS fallback, and a native single-open accordion. The newest project (by date) renders pre-expanded. The now-unused `ProjectGrid`/`ProjectCard` are deleted.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript (strict), CSS Modules + design tokens, Vitest + Testing Library, Playwright.

## Global Constraints

- TypeScript strict; static export (`output: 'export'`) must keep working — no server-only APIs in new components.
- Components are Server Components by default; only add `"use client"` if a component needs browser-only APIs. `ProjectList` and `ProjectRow` need **no** client JS (native `<details>` handles toggling/accordion).
- Each component has a **co-located CSS Module**. No ad-hoc colors — use design tokens from `app/globals.css` (`--cat`, `--ink`, `--line`, `--live`, `--mono`, etc.). The per-row accent is `COLORS[primaryCat(p)]` applied as the `--cat` custom property via `style={{ "--cat": … } as React.CSSProperties}`.
- Animations live in the component's CSS Module, gated under `@media (prefers-reduced-motion: no-preference)`.
- Status-label rule (matches existing `ProjectCard`): the `Private` status indicator (glyph **and** label) is hidden in the UI; the `vis` data stays accurate. Other states show: `Live` / `Public` / `Fork` / `No repo`.
- Content rule: all project copy (`tagline`, `desc`) comes verbatim from `lib/projects.ts`; introduce no new factual claims. The build-step lines are decorative terminal flavor only.
- Fully mobile-first; must pass the Playwright 6-viewport matrix and the horizontal-overflow gate (`scrollWidth - clientWidth <= 1`).
- Commands: `npm test` (Vitest), `npm run test:e2e` (Playwright, runs `next build` first).

---

### Task 1: `ProjectRow` component

A single expandable terminal row. Native `<details>`; no client JS.

**Files:**
- Create: `components/ProjectRow.tsx`
- Create: `components/ProjectRow.module.css`
- Test: `components/__tests__/ProjectRow.test.tsx`

**Interfaces:**
- Consumes: `Project` type (`@/lib/types`); `primaryCat`, `COLORS`, `fmtDate` (`@/lib/helpers`); `Link` (`next/link`).
- Produces: `default export ProjectRow({ project: Project; open?: boolean })` — renders an `<article>` (root) containing one `<details name="projects">`. When `open` is true the `<details>` has the `open` attribute.

- [ ] **Step 1: Write the failing test**

```tsx
// components/__tests__/ProjectRow.test.tsx
import { describe, it, expect } from "vitest";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import ProjectRow from "../ProjectRow";
import type { Project } from "@/lib/types";

const pub: Project = { name: "CYCLE", slug: "cycle", tagline: "hook", date: "2026-06-21",
  cats: ["Web App"], vis: "Public", icon: "⏱️", desc: "long pitch", tech: ["Vite", "PWA"],
  live: "https://x", github: "https://g" };

const priv: Project = { name: "ChatHop", slug: "chathop", tagline: "hook", date: "2026-06-09",
  cats: ["Web App"], vis: "Private", icon: "💬", desc: "long pitch", tech: ["JS"],
  live: "https://c" };

describe("ProjectRow", () => {
  it("renders the name, status label, date, pitch and a detail-page link", () => {
    render(<ProjectRow project={pub} />);
    expect(screen.getByText("CYCLE")).toBeInTheDocument();
    expect(screen.getByText("Live")).toBeInTheDocument();
    expect(screen.getByText("21 JUN 2026")).toBeInTheDocument();
    expect(screen.getByText("long pitch")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /open/i })).toHaveAttribute("href", "/projects/cycle");
    expect(screen.getByRole("link", { name: /live/i })).toHaveAttribute("href", "https://x");
  });

  it("hides the Private status indicator but still renders the row", () => {
    render(<ProjectRow project={priv} />);
    expect(screen.getByText("ChatHop")).toBeInTheDocument();
    expect(screen.queryByText("Private")).not.toBeInTheDocument();
  });

  it("renders the open attribute only when open is true", () => {
    const { container, rerender } = render(<ProjectRow project={pub} />);
    expect(container.querySelector("details")?.hasAttribute("open")).toBe(false);
    rerender(<ProjectRow project={pub} open />);
    expect(container.querySelector("details")?.hasAttribute("open")).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- ProjectRow`
Expected: FAIL — cannot resolve `../ProjectRow`.

- [ ] **Step 3: Write the component**

```tsx
// components/ProjectRow.tsx
import Link from "next/link";
import s from "./ProjectRow.module.css";
import type { Project } from "@/lib/types";
import { primaryCat, COLORS, fmtDate } from "@/lib/helpers";

// Decorative CI flavor — not a factual claim about any project's pipeline.
const STEPS: ReadonlyArray<readonly [string, string]> = [
  ["resolving project graph", "0.4s"],
  ["installing dependencies", "3.1s"],
  ["compiling build", "6.2s"],
  ["optimizing assets", "1.8s"],
  ["publishing to edge", "0.9s"],
];

// status class + visible label. Mirrors ProjectCard's statusInfo.
function statusInfo(p: Project): [string, string] {
  if (p.vis === "Private") return ["private", "Private"];
  if (p.vis === "Fork") return ["fork", "Fork"];
  if (p.vis === "Standalone") return ["norepo", "No repo"];
  return p.live ? ["live", "Live"] : ["public", "Public"];
}
const GLYPH: Record<string, string> = { live: "●", public: "○", fork: "⑂", norepo: "◇" };

export default function ProjectRow({
  project: p,
  open = false,
}: {
  project: Project;
  open?: boolean;
}) {
  const cat = primaryCat(p);
  const [sc, sl] = statusInfo(p);
  const showStatus = p.vis !== "Private";
  return (
    <article className={s.row} style={{ "--cat": COLORS[cat] } as React.CSSProperties}>
      <details name="projects" open={open}>
        <summary className={s.summary}>
          <span className={s.tri} aria-hidden>▸</span>
          <span className={`${s.glyph} ${showStatus ? s[sc] : ""}`} aria-hidden>
            {showStatus ? GLYPH[sc] : ""}
          </span>
          <span className={s.name}>
            {p.name}
            {showStatus && <span className={s.status}> {sl}</span>}
          </span>
          <span className={s.tech}>{p.tech.slice(0, 3).join(" · ")}</span>
          <span className={s.date}>{fmtDate(p.date)}</span>
        </summary>

        <div className={s.panel}>
          <ul className={s.steps} aria-hidden>
            {STEPS.map(([label, dur]) => (
              <li key={label} className={s.step}>
                <span className={s.ck}>✓</span>
                {label}
                <span className={s.dur}>{dur}</span>
              </li>
            ))}
          </ul>
          <p className={s.tagline}>{p.tagline}</p>
          <p className={s.desc}>{p.desc}</p>
          <div className={s.links}>
            <Link className={s.open} href={`/projects/${p.slug}`}>open ↗</Link>
            {p.live && <a href={p.live} target="_blank" rel="noopener">live ↗</a>}
            {p.github && <a href={p.github} target="_blank" rel="noopener">github</a>}
            {p.npm && <a className={s.npm} href={p.npm} target="_blank" rel="noopener">npm</a>}
            {p.play && <a className={s.play} href={p.play} target="_blank" rel="noopener">play ↗</a>}
            {p.store && <a className={s.store} href={p.store} target="_blank" rel="noopener">store ↗</a>}
          </div>
        </div>
      </details>
    </article>
  );
}
```

- [ ] **Step 4: Write the CSS module**

```css
/* components/ProjectRow.module.css */
.row{
  position:relative;
  border-bottom:1px solid var(--line);
  --cat:var(--accent);
}
.row:last-child{border-bottom:0}
.row details{margin:0}

.summary{
  list-style:none;cursor:pointer;
  display:grid;
  grid-template-columns:16px 16px 1fr auto;
  grid-template-areas:
    "tri glyph name date"
    "tri glyph tech tech";
  gap:2px 12px;align-items:center;
  padding:13px 12px;border-radius:9px;border:1px solid transparent;
  font-family:var(--mono);
  transition:background .12s ease, border-color .12s ease;
}
.summary::-webkit-details-marker{display:none}
.summary::marker{content:""}
.summary:hover{
  background:var(--card-hi);
  border-color:color-mix(in srgb,var(--cat) 40%,var(--line));
}
.summary:focus-visible{outline:2px solid var(--accent-glow);outline-offset:2px}

.tri{grid-area:tri;color:var(--ink-3);font-size:13px;transition:transform .15s ease}
details[open] .tri{transform:rotate(90deg)}
.glyph{grid-area:glyph;font-size:15px;color:var(--ink-2)}
.glyph.live{color:var(--live)}
.glyph.public{color:var(--ink-2)}
.glyph.fork,.glyph.norepo{color:var(--fork)}

.name{grid-area:name;min-width:0;color:var(--ink);font-weight:600;font-size:15px;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.status{color:var(--ink-3);font-weight:500;font-size:12px}
.tech{grid-area:tech;color:var(--ink-3);font-size:12.5px;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.date{grid-area:date;justify-self:end;color:var(--ink-3);font-size:12.5px;white-space:nowrap}

/* single-row "ls -l" layout once there's width */
@media (min-width:640px){
  .summary{
    grid-template-columns:16px 16px minmax(0,1fr) auto auto;
    grid-template-areas:"tri glyph name tech date";
    column-gap:16px;
  }
  .tech{justify-self:end}
}

.panel{
  padding:6px 12px 18px 44px;
  margin:0 0 6px 7px;
  border-left:2px solid color-mix(in srgb,var(--cat) 70%,transparent);
  background:color-mix(in srgb,var(--cat) 6%,transparent);
  border-radius:0 9px 9px 0;
}
.steps{list-style:none;font-family:var(--mono);font-size:13px;margin-bottom:12px}
.step{color:var(--ink-3);padding:2px 0}
.ck{color:var(--live);margin-right:10px}
.dur{opacity:.55;margin-left:8px}

.tagline{color:var(--cat);font-weight:700;font-size:15px;margin-bottom:6px}
.desc{color:var(--ink);font-size:14px;line-height:1.6;margin-bottom:16px;max-width:640px}

.links{display:flex;gap:8px;flex-wrap:wrap}
.links a{
  font-family:var(--mono);font-size:12px;letter-spacing:.03em;
  padding:6px 11px;border-radius:7px;border:1px solid var(--line-2);
  background:var(--card-hi);color:var(--ink-2);
  transition:border-color .15s ease, color .15s ease;
}
.links a:hover{border-color:var(--cat);color:#fff}
.links a.open{background:var(--accent);border-color:var(--accent);color:#fff}
.links a.npm{color:var(--c-ext)}
.links a.play,.links a.store{color:var(--live)}

/* build-step reveal — animate only when motion is allowed */
@media (prefers-reduced-motion: no-preference){
  details[open] .step{opacity:0;animation:stepIn .26s ease forwards}
  details[open] .step:nth-child(1){animation-delay:.03s}
  details[open] .step:nth-child(2){animation-delay:.12s}
  details[open] .step:nth-child(3){animation-delay:.21s}
  details[open] .step:nth-child(4){animation-delay:.30s}
  details[open] .step:nth-child(5){animation-delay:.39s}
}
@keyframes stepIn{from{opacity:0;transform:translateX(-6px)}to{opacity:1;transform:none}}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm test -- ProjectRow`
Expected: PASS (3 tests).

- [ ] **Step 6: Commit**

```bash
git add components/ProjectRow.tsx components/ProjectRow.module.css components/__tests__/ProjectRow.test.tsx
git commit -m "feat: add expandable terminal ProjectRow"
```

---

### Task 2: `ProjectList` component

Renders the rows in the terminal output area; pre-expands the newest project.

**Files:**
- Create: `components/ProjectList.tsx`
- Create: `components/ProjectList.module.css`
- Test: `components/__tests__/ProjectList.test.tsx`

**Interfaces:**
- Consumes: `ProjectRow` (Task 1); `Project` type; `sortByDateDesc` (`@/lib/helpers`).
- Produces: `default export ProjectList({ projects: Project[] })` — renders a `<div data-testid="project-list">` with one `ProjectRow` per project (keyed by `slug`). The row whose project has the most recent date (`sortByDateDesc(projects)[0]`) is passed `open`.

- [ ] **Step 1: Write the failing test**

```tsx
// components/__tests__/ProjectList.test.tsx
import { describe, it, expect } from "vitest";
import "@testing-library/jest-dom";
import { render, screen, within } from "@testing-library/react";
import ProjectList from "../ProjectList";
import type { Project } from "@/lib/types";

const mk = (slug: string, date: string | null): Project => ({
  name: slug, slug, tagline: "t", date, cats: ["Web App"], vis: "Public",
  icon: "x", desc: "d", tech: ["Vite"],
});

const projects = [mk("old", "2025-01-01"), mk("newest", "2026-06-21"), mk("mid", "2025-09-09")];

describe("ProjectList", () => {
  it("renders one article per project", () => {
    render(<ProjectList projects={projects} />);
    const list = screen.getByTestId("project-list");
    expect(within(list).getAllByRole("article")).toHaveLength(3);
  });

  it("pre-expands the project with the most recent date", () => {
    const { container } = render(<ProjectList projects={projects} />);
    const openDetails = container.querySelectorAll("details[open]");
    expect(openDetails).toHaveLength(1);
    // the open row is the 'newest' article
    expect(openDetails[0].closest("article")).toContainElement(screen.getByText("newest"));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- ProjectList`
Expected: FAIL — cannot resolve `../ProjectList`.

- [ ] **Step 3: Write the component**

```tsx
// components/ProjectList.tsx
import s from "./ProjectList.module.css";
import ProjectRow from "./ProjectRow";
import type { Project } from "@/lib/types";
import { sortByDateDesc } from "@/lib/helpers";

export default function ProjectList({ projects }: { projects: Project[] }) {
  // Newest by date opens by default, regardless of the (shuffled) display order.
  const newestSlug = sortByDateDesc(projects)[0]?.slug;
  return (
    <div className={s.list} data-testid="project-list">
      {projects.map((p) => (
        <ProjectRow key={p.slug} project={p} open={p.slug === newestSlug} />
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Write the CSS module**

```css
/* components/ProjectList.module.css */
.list{
  display:flex;flex-direction:column;
  border:1px solid var(--line);
  border-radius:11px;
  background:linear-gradient(180deg,var(--card-2),var(--card));
  overflow:hidden;
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm test -- ProjectList`
Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
git add components/ProjectList.tsx components/ProjectList.module.css components/__tests__/ProjectList.test.tsx
git commit -m "feat: add ProjectList terminal output with newest pre-expanded"
```

---

### Task 3: Wire into `HomeFilter`, remove the old grid, update docs

Swap the output, delete the now-unused card/grid + their test, update the `HomeFilter` unit test, and refresh CLAUDE.md.

**Files:**
- Modify: `components/HomeFilter.tsx` (the import + the one `<ProjectGrid …>` line, ~`:6` and `:77`)
- Modify: `components/__tests__/HomeFilter.test.tsx`
- Delete: `components/ProjectGrid.tsx`, `components/ProjectGrid.module.css`
- Delete: `components/ProjectCard.tsx`, `components/ProjectCard.module.css`
- Delete: `components/__tests__/ProjectCard.test.tsx`
- Modify: `CLAUDE.md` (architecture section bullets describing ProjectCard/ProjectGrid)

**Interfaces:**
- Consumes: `ProjectList` (Task 2).
- Produces: home page renders `<ProjectList projects={list} />` inside the existing `grid-reveal` wrapper; the terminal window, KPIs, prompt line, chips, count line, and client shuffle are unchanged.

- [ ] **Step 1: Update the `HomeFilter` unit test (write it first, expect fail)**

Replace the body of `components/__tests__/HomeFilter.test.tsx` with:

```tsx
import { describe, it, expect } from "vitest";
import "@testing-library/jest-dom";
import { render, screen, fireEvent, within } from "@testing-library/react";
import HomeFilter from "../HomeFilter";

describe("HomeFilter", () => {
  it("shows all projects by default and filters on chip click", () => {
    render(<HomeFilter />);
    const list = screen.getByTestId("project-list");
    expect(within(list).getAllByRole("article")).toHaveLength(18);
    fireEvent.click(screen.getByRole("button", { name: "Extension" }));
    // only Hotjar Blocker is an Extension
    expect(within(list).getAllByRole("article")).toHaveLength(1);
    expect(within(list).getByText("Hotjar Blocker")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test -- HomeFilter`
Expected: FAIL — `getByTestId("project-list")` not found (HomeFilter still renders `ProjectGrid`/`project-grid`).

- [ ] **Step 3: Swap the output in `HomeFilter.tsx`**

Change the import (line ~4):

```tsx
import ProjectList from "./ProjectList";
```
(remove `import ProjectGrid from "./ProjectGrid";`)

Change the render (inside the `grid-reveal` wrapper, line ~77):

```tsx
            <div className={`grid-reveal ${ready ? "is-ready" : ""}`}>
              <ProjectList projects={list} />
            </div>
```
(replace `<ProjectGrid projects={list} />`)

- [ ] **Step 4: Run the `HomeFilter` test to verify it passes**

Run: `npm test -- HomeFilter`
Expected: PASS (1 test).

- [ ] **Step 5: Delete the unused card/grid and its test**

```bash
git rm components/ProjectGrid.tsx components/ProjectGrid.module.css \
       components/ProjectCard.tsx components/ProjectCard.module.css \
       components/__tests__/ProjectCard.test.tsx
```

- [ ] **Step 6: Update CLAUDE.md architecture bullets**

In `CLAUDE.md`, under "Components", replace the `ProjectCard` and `ProjectGrid` bullets with bullets describing the new components. Use this text:

```markdown
- **`ProjectRow`** — a console-styled, expandable terminal row (the project "deploy log" line). A native `<details name="projects">` (free keyboard support, no-JS fallback, native single-open accordion): the `<summary>` is an `ls -l` line (disclosure triangle · status glyph · name + status label, hidden for `Private` · tech · date), and the panel reveals a staggered `✓` build-step animation, the `tagline`, the long `desc`, and the link row (`open ↗` to `/projects/[slug]` plus `live`/`github`/`npm`/`play`/`store`). Accent driven by `COLORS[primaryCat(p)]` (`--cat`).
- **`ProjectList`** — the terminal output region (`data-testid="project-list"`); renders one `ProjectRow` per project and pre-expands the newest project by date (`sortByDateDesc(projects)[0]`).
```

Also update the `HomeFilter` bullet's tail and the "Pages" / "Derived rendering" mentions of `ProjectGrid`/`ProjectCard`/`first tile is featured` to reference `ProjectList`/`ProjectRow` and "newest project pre-expanded" (the `featured` spanning-tile concept no longer exists).

- [ ] **Step 7: Run the full unit suite**

Run: `npm test`
Expected: PASS — no references to deleted `ProjectCard`/`ProjectGrid` remain; `ProjectRow`, `ProjectList`, `HomeFilter` green.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: render projects as a terminal log; drop bento card/grid"
```

---

### Task 4: Responsive + e2e verification

Add a light accordion e2e check and confirm the full responsive matrix (incl. the overflow gate) is green.

**Files:**
- Modify: `e2e/responsive.spec.ts`

**Interfaces:**
- Consumes: the built site (`next build` → `out/`, run automatically by `npm run test:e2e`). Existing assertions rely on each project row being an `<article>` (still true) and the category buttons (`All`, `Extension`, `Education`) — all unchanged.

- [ ] **Step 1: Add an accordion expand test**

Append to `e2e/responsive.spec.ts`, inside the `home responsiveness` describe block:

```ts
  test("newest row starts open and rows behave as a single-open accordion", async ({ page }) => {
    await page.goto("/");
    // newest project is pre-expanded — exactly one open panel on load
    await expect(page.locator("details[open]")).toHaveCount(1);
    // open a currently-closed row; the accordion keeps exactly one open
    const closedSummary = page.locator("article:not(:has(details[open])) summary").first();
    await closedSummary.click();
    await expect(page.locator("details[open]")).toHaveCount(1);
  });
```

- [ ] **Step 2: Run the full responsive matrix**

Run: `npm run test:e2e`
Expected: PASS across all 6 viewports — including `no horizontal overflow`, `renders all 18 cards in the log` (18 `article`s), `category filter narrows the grid`, `clearing a filter restores all 18`, the new accordion test, and the detail-page test.

If `no horizontal overflow` fails on a narrow viewport, the culprit is the `.summary` grid — verify `.name`/`.tech` have `min-width:0` + `overflow:hidden` and that the mobile two-row layout (default, below 640px) is active. Fix in `components/ProjectRow.module.css` and re-run.

- [ ] **Step 3: Build sanity check**

Run: `npm run build`
Expected: static export to `out/` succeeds (no `"use client"`/SSR errors from the new components).

- [ ] **Step 4: Commit**

```bash
git add e2e/responsive.spec.ts
git commit -m "test: e2e accordion check for terminal project log"
```

---

## Self-Review

**Spec coverage:**
- Swap `HomeFilter` output `ProjectGrid → ProjectList` — Task 3. ✓
- New `ProjectList` + `ProjectRow` (+ CSS modules) — Tasks 1, 2. ✓
- Remove `ProjectGrid` + `ProjectCard` + tests — Task 3. ✓
- Detail pages / hero / footer / `lib` untouched — no task modifies them. ✓
- Native `<details name="projects">` for accordion + keyboard + no-JS — Task 1, verified Task 4. ✓
- Build-step reveal, reduced-motion gated — Task 1 (CSS). ✓
- Keep random shuffle + grid-reveal — Task 3 leaves `HomeFilter`'s shuffle/reveal intact. ✓
- Newest auto-expanded — Task 2 (`open` on `sortByDateDesc(projects)[0]`), verified Task 4. ✓
- `--cat` accent from `COLORS[primaryCat(p)]`; Private label hidden, data intact — Task 1 (+ test). ✓
- Responsive mobile-first + overflow gate — Task 1 CSS, verified Task 4. ✓
- Tests: ProjectRow, ProjectList, updated HomeFilter, dropped ProjectCard/Grid, e2e toggle — Tasks 1–4. ✓
- Content rule (copy verbatim; build steps decorative) — Task 1 (`tagline`/`desc` from data; comment on `STEPS`). ✓

**Placeholder scan:** none — every code/test/CSS step is complete.

**Type consistency:** `ProjectRow({ project, open })` produced in Task 1 is consumed exactly that way in Task 2's `ProjectList`. `ProjectList({ projects })` produced in Task 2 is consumed exactly that way in Task 3's `HomeFilter`. `data-testid="project-list"` set in Task 2 matches the selector in Task 3's `HomeFilter` test. The `article` element (root of `ProjectRow`) matches the `getAllByRole("article")` / `page.locator("article")` selectors in Tasks 2–4 and the pre-existing e2e count assertions.
