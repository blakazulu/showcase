# Next.js React App Migration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single-file `showcase.html` with a Next.js static-export React app that preserves the approved "deploy log" design, content, and the deploy-cadence chart, adding per-project detail pages.

**Architecture:** Next.js 15 App Router, fully static (`output: 'export'`). Server Components by default; two client islands only (`CadenceChart`, `HomeFilter`). A typed data module (`lib/`) is the single source of truth, consumed by the home page, the cadence chart, and per-project pages. Styling is CSS Modules + a global design-token sheet, ported ~1:1 from the existing `showcase.html`.

**Tech Stack:** Next.js 15, React 19, TypeScript, CSS Modules, `next/font/google`, Vitest + React Testing Library, Netlify static deploy.

## Global Constraints

- Next.js **15.x**, React **19.x**, TypeScript **5.x**, Node **20+**.
- `next.config.mjs` MUST set `output: 'export'` and `images: { unoptimized: true }`.
- **No 3D / Three.js** in this phase.
- **Design tokens are authoritative** — copy the `:root` values verbatim from `showcase.html`; do not invent new colors. No gradients/glow (flat color only).
- **Honesty rule (from `docs/GOALS.md`):** descriptions are sourced from README/live site, never inflated. Detail pages expand only existing data; `highlights`/`screenshots` stay empty until real content exists. Status labels: `Private` = live but source-closed, `Fork`/`Standalone` labeled as such.
- **Deploy safety:** every push to `main` auto-deploys to `sbz-showcase.netlify.app`. Do NOT `git push` until the final build gate passes AND the user approves. Local `git commit` per task is fine. Work happens on `main` (no feature branch — do not create branches without explicit user approval).
- All project content (the 19 entries) and all CSS are ported from the current `showcase.html`, which remains present until Task 11.
- **Fully responsive:** every UI must work mobile-first across all resolutions (small phones → large desktops): no horizontal overflow/scroll, readable type, usable tap targets, sticky/edge UI never overlaps content.
- **Safe areas:** the page must respect iOS/Android safe-area insets. Viewport set to `viewport-fit=cover` (Next: `export const viewport = { viewportFit: "cover" }`); fixed/sticky/edge elements (top bar, sticky filter bar, `.wrap`, footer) pad with `env(safe-area-inset-*)`.
- **Playwright verification:** UI changes are validated with Playwright across a device/viewport matrix (small/large phones, tablet, desktop), asserting no overflow, safe-area clearance, and core interactions.

---

## File Structure

```
app/
  layout.tsx                root layout: fonts, <body>, global metadata
  globals.css               :root tokens, reset, body drafting-grid, keyframes
  page.tsx                  home page (composition)
  projects/[slug]/page.tsx  per-project static detail page
components/
  TopBar.tsx        TopBar.module.css
  Hero.tsx          Hero.module.css
  CadenceChart.tsx  CadenceChart.module.css     ('use client')
  StatStrip.tsx     StatStrip.module.css
  FilterBar.tsx     FilterBar.module.css        ('use client')
  ProjectGrid.tsx   ProjectGrid.module.css
  ProjectCard.tsx   ProjectCard.module.css
  HomeFilter.tsx                                ('use client') wraps FilterBar+ProjectGrid
  Footer.tsx        Footer.module.css
  ProjectDetail.tsx ProjectDetail.module.css
lib/
  types.ts          Project, Category, Visibility
  projects.ts       PROJECTS: Project[]
  helpers.ts        COLORS, LANE_ORDER, PRIORITY, primaryCat, fmtDate, slug, sortByDateDesc, getStats
  __tests__/helpers.test.ts
next.config.mjs · tsconfig.json · package.json · netlify.toml · vitest.config.ts
```

---

## Task 1: Scaffold Next.js app + global styles + fonts

**Files:**
- Create: `package.json`, `next.config.mjs`, `tsconfig.json`, `next-env.d.ts` (auto), `app/layout.tsx`, `app/globals.css`, `app/page.tsx` (temporary)
- Modify: `.gitignore`

**Interfaces:**
- Produces: a buildable Next app; `app/globals.css` exposes all design tokens as CSS variables on `:root`; fonts exposed as CSS variables `--font-display`, `--font-body`, `--font-mono` via `next/font`.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "showcase",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run"
  },
  "dependencies": {
    "next": "^15.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@testing-library/react": "^16.1.0",
    "@testing-library/jest-dom": "^6.6.3",
    "@types/node": "^20.17.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "jsdom": "^25.0.1",
    "typescript": "^5.7.2",
    "vitest": "^2.1.8",
    "@vitejs/plugin-react": "^4.3.4"
  }
}
```

- [ ] **Step 2: Create `next.config.mjs`**

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
};
export default nextConfig;
```

- [ ] **Step 3: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules", "out"]
}
```

- [ ] **Step 4: Update `.gitignore`** (append; keep existing `.claude/`)

```
# Claude Code local tooling / installed skills
.claude/

# Next.js / Node
node_modules/
.next/
out/
*.tsbuildinfo
next-env.d.ts
```

- [ ] **Step 5: Create `app/globals.css`**

Copy the entire `:root{…}` token block, the `*`/`html`/`body`/`a`/`.wrap`/`::selection`/`:focus-visible` base rules, the drafting-grid `body` background, and the `@media (prefers-reduced-motion: no-preference)` keyframes (`pulse`, `rise`) **verbatim from `showcase.html`'s `<style>`**. Then replace the font-family token values to consume `next/font` variables:

**IMPORTANT — keep `.flash` GLOBAL here** (not in any CSS Module). The CadenceChart adds a literal `"flash"` class to a card element by id; a module-scoped class would be hashed and never match. Add to globals.css:

```css
.flash{ animation: flash 1.1s ease; }
@keyframes flash{ 0%,100%{box-shadow:0 0 0 0 transparent} 30%{box-shadow:0 0 0 3px var(--cat,var(--accent))} }
```
(`--cat` is set inline on each card, so it resolves.)

```css
:root{
  /* paste color/radius/maxw tokens verbatim from showcase.html */
  --display: var(--font-display), -apple-system, system-ui, sans-serif;
  --body: var(--font-body), -apple-system, system-ui, sans-serif;
  --mono: var(--font-mono), ui-monospace, monospace;
}
/* paste base + body grid + keyframes verbatim */
```

Remove the `.controls`/`.grid`/`.card` etc. component rules from globals — those move into CSS Modules in later tasks. Keep only `:root`, base element rules, `.wrap`, `body` background, and the global keyframes.

- [ ] **Step 6: Create `app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { Archivo, Hanken_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const display = Archivo({ subsets: ["latin"], weight: ["600","700","800"], variable: "--font-display", display: "swap" });
const body = Hanken_Grotesk({ subsets: ["latin"], weight: ["400","500","600","700"], variable: "--font-body", display: "swap" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400","500","600"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: "Liraz Amir — Deploy Log",
  description: "A builder who designs, ships, and runs software across AI apps, developer tooling, browser extensions, and learning platforms. Most of it live right now.",
  metadataBase: new URL("https://sbz-showcase.netlify.app"),
  openGraph: {
    title: "Liraz Amir — Deploy Log",
    description: "Built end to end. Shipped to production. AI apps, dev tools, extensions, and learning platforms.",
    url: "https://sbz-showcase.netlify.app",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} ${mono.variable}`}>{children}</body>
    </html>
  );
}
```

- [ ] **Step 7: Create temporary `app/page.tsx`**

```tsx
export default function Home() {
  return <main className="wrap"><h1>Showcase — scaffolding</h1></main>;
}
```

- [ ] **Step 8: Install and build**

Run: `npm install && npm run build`
Expected: build succeeds; `out/index.html` exists.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js static-export app with tokens and fonts"
```

---

## Task 2: Data layer + helpers (TDD)

**Files:**
- Create: `lib/types.ts`, `lib/helpers.ts`, `lib/projects.ts`, `lib/__tests__/helpers.test.ts`, `vitest.config.ts`
- Test: `lib/__tests__/helpers.test.ts`

**Interfaces:**
- Produces:
  - `Project`, `Category`, `Visibility` (types.ts)
  - `PROJECTS: Project[]` (projects.ts)
  - `COLORS: Record<Category,string>`, `LANE_ORDER: Category[]`, `PRIORITY: Category[]`
  - `primaryCat(p: Project): Category`
  - `fmtDate(iso: string|null): string`
  - `slug(s: string): string`
  - `sortByDateDesc(list: Project[]): Project[]`
  - `getStats(list: Project[]): { shipped:number; live:number; npm:number; ai:number; domains:number }`

- [ ] **Step 1: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: { environment: "jsdom", globals: true, setupFiles: [] },
});
```

- [ ] **Step 2: Create `lib/types.ts`**

```ts
export type Visibility = "Public" | "Private" | "Fork" | "Standalone";
export type Category = "Web App" | "AI" | "Dev Tool" | "Education" | "Extension" | "Content";

export interface Project {
  name: string;
  slug: string;
  tagline: string;
  date: string | null;        // ISO YYYY-MM-DD or null
  cats: Category[];
  vis: Visibility;
  icon: string;
  desc: string;
  tech: string[];
  live?: string;
  github?: string;
  npm?: string;
  highlights?: string[];      // empty for now — honest expansion later
  screenshots?: string[];     // empty for now
}
```

- [ ] **Step 3: Write the failing test `lib/__tests__/helpers.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { primaryCat, fmtDate, slug, sortByDateDesc, getStats } from "../helpers";
import type { Project } from "../types";

const mk = (over: Partial<Project>): Project => ({
  name: "X", slug: "x", tagline: "", date: null, cats: ["Web App"],
  vis: "Public", icon: "x", desc: "", tech: [], ...over,
});

describe("primaryCat", () => {
  it("prefers higher-priority category (AI Image -> Dev Tool)", () => {
    expect(primaryCat(mk({ cats: ["Dev Tool", "AI"] }))).toBe("Dev Tool");
  });
  it("STEM-like (Web App, AI, Education) -> Education", () => {
    expect(primaryCat(mk({ cats: ["Web App", "AI", "Education"] }))).toBe("Education");
  });
  it("falls back to first cat when none in priority list", () => {
    expect(primaryCat(mk({ cats: ["Web App"] }))).toBe("Web App");
  });
});

describe("fmtDate", () => {
  it("formats ISO to D MON YYYY", () => { expect(fmtDate("2026-06-21")).toBe("21 JUN 2026"); });
  it("returns dash for null", () => { expect(fmtDate(null)).toBe("—"); });
});

describe("slug", () => {
  it("kebabs and trims non-alphanumerics", () => {
    expect(slug("Kiryat Begin — Desert Science")).toBe("kiryat-begin-desert-science");
    expect(slug("MortgageFix (משכנתFix)")).toBe("mortgagefix");
  });
});

describe("sortByDateDesc", () => {
  it("newest first, nulls last", () => {
    const out = sortByDateDesc([mk({name:"a",date:null}), mk({name:"b",date:"2025-01-01"}), mk({name:"c",date:"2026-01-01"})]);
    expect(out.map(p=>p.name)).toEqual(["c","b","a"]);
  });
});

describe("getStats", () => {
  it("counts shipped/live/npm/ai/domains", () => {
    const s = getStats([
      mk({ cats:["AI"], live:"x", npm:"n" }),
      mk({ cats:["Dev Tool"] }),
    ]);
    expect(s).toEqual({ shipped:2, live:1, npm:1, ai:1, domains:2 });
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — cannot import from `../helpers` (file not created yet).

- [ ] **Step 5: Create `lib/helpers.ts`**

```ts
import type { Project, Category } from "./types";

export const COLORS: Record<Category, string> = {
  "AI": "#6a3fe0", "Education": "#bf7a0e", "Web App": "#1f3fe0",
  "Dev Tool": "#0e8c8c", "Extension": "#bf492e", "Content": "#51607a",
};
export const LANE_ORDER: Category[] = ["AI", "Education", "Web App", "Dev Tool", "Extension", "Content"];
export const PRIORITY: Category[] = ["Extension", "Dev Tool", "Content", "Education", "AI", "Web App"];

export function primaryCat(p: Project): Category {
  return PRIORITY.find((c) => p.cats.includes(c)) ?? p.cats[0];
}

const MON = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
export function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${+d} ${MON[+m - 1]} ${y}`;
}

export function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function sortByDateDesc(list: Project[]): Project[] {
  return [...list].sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return Date.parse(b.date) - Date.parse(a.date);
  });
}

export interface Stats { shipped: number; live: number; npm: number; ai: number; domains: number; }
export function getStats(list: Project[]): Stats {
  return {
    shipped: list.length,
    live: list.filter((p) => p.live).length,
    npm: list.filter((p) => p.npm).length,
    ai: list.filter((p) => p.cats.includes("AI")).length,
    domains: new Set(list.flatMap((p) => p.cats)).size,
  };
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npm test`
Expected: PASS — all 5 describe blocks green.

- [ ] **Step 7: Create `lib/projects.ts`**

Port the `PROJECTS` array **verbatim from `showcase.html`** (the `const PROJECTS = [...]` block). Transformation rules:
1. Type the export: `import type { Project } from "./types"; export const PROJECTS: Project[] = [ ... ];`
2. Add a `slug` field to each entry using the kebab rule (matches `slug(name)`). Exact slugs:
   `cycle, new-home-owner, aiemd-platform, chathop, math-practice, az-ma-kore, lumi-kid, past-palette, save-the-past, stem-explorers, archeotriage, keyquest, floatjet, ai-image-generator, hotjar-blocker, mortgagefix, kiryat-begin-desert-science, search-mcp, scalpelpdf`
   (Order matches the source array; map each to its entry by name.)
3. Keep `name, tagline, date, cats, vis, icon, desc, tech, live?, github?, npm?` exactly as in source. Do NOT alter any description text (honesty rule).
4. Do not add `highlights`/`screenshots` yet (optional, omitted).

Example (first entry):

```ts
import type { Project } from "./types";

export const PROJECTS: Project[] = [
  { name: "CYCLE", slug: "cycle", tagline: "Cyberpunk HIIT workout timer & music PWA", date: "2026-06-21",
    cats: ["Web App"], vis: "Public", icon: "⏱️",
    desc: "A futuristic, installable PWA for high-intensity workouts. Precision interval timer with 12 built-in plans plus a custom plan builder (26 segment types), smart repetition, pro boxing-gym sounds, and a 180+ track curated YouTube music library with live search. Offline-first.",
    tech: ["Vite","Vanilla JS","Tailwind v4","Netlify Functions","Web Audio API","PWA"],
    live: "https://workouttimerpro.netlify.app", github: "https://github.com/blakazulu/Workout-Timer" },
  // … all 19 entries, ported verbatim with slug added …
];
```

- [ ] **Step 8: Add a data-integrity test** (append to `helpers.test.ts`)

```ts
import { PROJECTS } from "../projects";
describe("PROJECTS data", () => {
  it("has 19 entries with unique slugs", () => {
    expect(PROJECTS).toHaveLength(19);
    expect(new Set(PROJECTS.map(p=>p.slug)).size).toBe(19);
  });
  it("every slug matches slug(name)", () => {
    for (const p of PROJECTS) expect(p.slug).toBe(slug(p.name));
  });
});
```

- [ ] **Step 9: Run tests**

Run: `npm test`
Expected: PASS — including the 19-entry + slug checks.

- [ ] **Step 10: Commit**

```bash
git add lib vitest.config.ts package.json
git commit -m "feat: typed project data + helpers with unit tests"
```

---

## Task 3: Static presentational components (TopBar, Hero, StatStrip, Footer)

**Files:**
- Create: `components/TopBar.tsx` + `.module.css`, `components/Hero.tsx` + `.module.css`, `components/StatStrip.tsx` + `.module.css`, `components/Footer.tsx` + `.module.css`

**Interfaces:**
- Consumes: `getStats`, `PROJECTS` (StatStrip).
- Produces: `<TopBar/>`, `<Hero/>`, `<StatStrip/>`, `<Footer/>` (all server components, no props).

- [ ] **Step 1: TopBar**

Create `components/TopBar.module.css` by porting the `.topbar`, `.brand`, `.topnav` selectors from `showcase.html` (rename to local classes `topbar`, `brand`, `topnav`). Create `components/TopBar.tsx`:

```tsx
import s from "./TopBar.module.css";
export default function TopBar() {
  return (
    <div className={s.topbar}>
      <div className="wrap" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", height:54 }}>
        <div className={s.brand}><b>LIRAZ&nbsp;AMIR</b> <span>/ builder</span></div>
        <nav className={s.topnav}>
          <a href="https://github.com/blakazulu" target="_blank" rel="noopener">GitHub ↗</a>
          <a href="#log">The log ↓</a>
        </nav>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Hero** — port `.hero`, `.eyebrow`, `.eyebrow .pulse`, `h1`, `.lede` selectors into `Hero.module.css`. Create `Hero.tsx` reproducing the hero markup from `showcase.html` (eyebrow with pulse span, `h1` "Built end to end. Shipped to production.", lede paragraph with `<b>` emphasis). Server component, no props.

- [ ] **Step 3: StatStrip** — port `.stats`, `.stats .s b` into `StatStrip.module.css`. Create `StatStrip.tsx`:

```tsx
import s from "./StatStrip.module.css";
import { PROJECTS } from "@/lib/projects";
import { getStats } from "@/lib/helpers";

export default function StatStrip() {
  const { shipped, live, npm, ai, domains } = getStats(PROJECTS);
  const items: [number, string][] = [[shipped,"shipped"],[live,"live"],[npm,"on npm"],[ai,"AI-powered"],[domains,"domains"]];
  return (
    <div className={s.stats}>
      {items.map(([v,l]) => <span key={l} className={s.s}><b>{v}</b>{l}</span>)}
    </div>
  );
}
```

- [ ] **Step 4: Footer** — port `footer`, `footer .row`, `footer .disc` into `Footer.module.css`. Create `Footer.tsx` reproducing the footer markup (builder line + GitHub link + "compiled JUN 2026" + the honesty disclaimer paragraph) from `showcase.html`.

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add components
git commit -m "feat: static components (TopBar, Hero, StatStrip, Footer)"
```

---

## Task 4: ProjectCard component

**Files:**
- Create: `components/ProjectCard.tsx` + `.module.css`
- Test: extend `lib/__tests__/` with `components/__tests__/ProjectCard.test.tsx`

**Interfaces:**
- Consumes: `Project`, `primaryCat`, `COLORS`, `fmtDate`.
- Produces: `<ProjectCard project={p} />`. Card root has `id={p.slug}` and inline `--cat` custom property. Name links to `/projects/${p.slug}`; status derived via local `statusInfo(p)`.

- [ ] **Step 1: Write failing test `components/__tests__/ProjectCard.test.tsx`**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ProjectCard from "../ProjectCard";
import type { Project } from "@/lib/types";

const p: Project = { name:"CYCLE", slug:"cycle", tagline:"t", date:"2026-06-21",
  cats:["Web App"], vis:"Public", icon:"⏱️", desc:"d", tech:["Vite"],
  live:"https://x", github:"https://g" };

describe("ProjectCard", () => {
  it("renders name linking to detail page and a Live link", () => {
    render(<ProjectCard project={p} />);
    expect(screen.getByRole("link", { name: /CYCLE/ })).toHaveAttribute("href", "/projects/cycle");
    expect(screen.getByRole("link", { name: /Live/ })).toHaveAttribute("href", "https://x");
  });
  it("shows formatted date and status", () => {
    render(<ProjectCard project={p} />);
    expect(screen.getByText("21 JUN 2026")).toBeInTheDocument();
    expect(screen.getByText("Live")).toBeInTheDocument();
  });
});
```

Add `import "@testing-library/jest-dom";` at top of the test (or create `vitest.setup.ts` and reference it in `vitest.config.ts` `setupFiles`).

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `../ProjectCard` not found.

- [ ] **Step 3: Create `ProjectCard.module.css`** — port `.card`, `.card:hover`, `.meta`, `.status` (+ `.live/.private/.fork/.norepo`), `.meta .sep`, `.meta .cat`, `.head`, `.ic`, `.head h3`, `.tagline`, `.desc`, `.stack`, `.links` (+ `.primary/.npm`) from `showcase.html`. **Do NOT port `.card.flash` / `@keyframes flash`** — that lives in globals.css (Task 1) as a global class. Keep `--cat` custom-property usage.

- [ ] **Step 4: Create `components/ProjectCard.tsx`**

```tsx
import Link from "next/link";
import s from "./ProjectCard.module.css";
import type { Project } from "@/lib/types";
import { primaryCat, COLORS, fmtDate } from "@/lib/helpers";

function statusInfo(p: Project): [string, string] {
  if (p.vis === "Private") return ["private", "Private"];
  if (p.vis === "Fork") return ["fork", "Fork"];
  if (p.vis === "Standalone") return ["norepo", "No repo"];
  return ["live", p.live ? "Live" : "Public"];
}

export default function ProjectCard({ project: p }: { project: Project }) {
  const cat = primaryCat(p);
  const [sc, sl] = statusInfo(p);
  return (
    <article className={s.card} id={p.slug} style={{ ["--cat" as string]: COLORS[cat] }}>
      <div className={s.meta}>
        <span className={`${s.status} ${s[sc]}`}><span className={s.d} />{sl}</span>
        <span className={s.sep}>/</span><span>{fmtDate(p.date)}</span>
        <span className={s.cat}>{cat}</span>
      </div>
      <div className={s.head}>
        <div className={s.ic}>{p.icon}</div>
        <div>
          <h3><Link href={`/projects/${p.slug}`}>{p.name}</Link></h3>
          <div className={s.tagline}>{p.tagline}</div>
        </div>
      </div>
      <p className={s.desc}>{p.desc}</p>
      <div className={s.stack}>{p.tech.map((t) => <span key={t}>{t}</span>)}</div>
      <div className={s.links}>
        {p.live && <a className={s.primary} href={p.live} target="_blank" rel="noopener">Live ↗</a>}
        {p.github && <a href={p.github} target="_blank" rel="noopener">GitHub</a>}
        {p.npm && <a className={s.npm} href={p.npm} target="_blank" rel="noopener">npm</a>}
      </div>
    </article>
  );
}
```

(Note: the `h3 > a` makes the name a link to the detail page; ensure `ProjectCard.module.css` `.head h3 a` inherits color/has no underline.)

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add components vitest.setup.ts vitest.config.ts
git commit -m "feat: ProjectCard with detail-page link + tests"
```

---

## Task 5: CadenceChart (client island)

**Files:**
- Create: `components/CadenceChart.tsx` (`'use client'`) + `.module.css`

**Interfaces:**
- Consumes: `PROJECTS`, `primaryCat`, `COLORS`, `LANE_ORDER`, `fmtDate`.
- Produces: `<CadenceChart/>` (no props). Renders the deploy-cadence swimlane chart; a dot click scrolls to the card with id `project.slug` on the home page.

- [ ] **Step 1: Create `CadenceChart.module.css`** — port `.cadence`, `.cadence-head` (+ `.lbl/.note`), `.scroll`, `.cgrid`, `.lane-labels` (+ `div`), `.plot`, `.gridcol`, `.lanesep`, `.dot` (+ `:hover/:focus-visible`), `.axis`, `.axis-label`, `.tip` (+ `.on`), `.cadence-foot` from `showcase.html`.

- [ ] **Step 2: Create `components/CadenceChart.tsx`**

Port the `buildCadence()` IIFE from `showcase.html` into a React client component. Compute layout with `useMemo`; render lane labels, gridlines, axis labels, and dots as JSX; tooltip via `useState`; mount animation via `useEffect` gated on `prefers-reduced-motion`. Full component:

```tsx
"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import s from "./CadenceChart.module.css";
import { PROJECTS } from "@/lib/projects";
import { primaryCat, COLORS, LANE_ORDER, fmtDate } from "@/lib/helpers";

const MON = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
const LANE = 26;

export default function CadenceChart() {
  const [tip, setTip] = useState<{ x:string; y:number; text:string } | null>(null);
  const [mounted, setMounted] = useState(false);

  const model = useMemo(() => {
    const dated = PROJECTS.filter((p) => p.date);
    const times = dated.map((p) => Date.parse(p.date!));
    const pad = 14 * 864e5;
    const t0 = Math.min(...times) - pad, t1 = Math.max(...times) + pad;
    const pct = (t: number) => ((t - t0) / (t1 - t0)) * 100;

    const months: { x: number; label: string }[] = [];
    const d0 = new Date(t0), d1 = new Date(t1);
    let y = d0.getFullYear(), m = d0.getMonth();
    while (y < d1.getFullYear() || (y === d1.getFullYear() && m <= d1.getMonth())) {
      const x = pct(Date.UTC(y, m, 1));
      if (x >= 0 && x <= 100) months.push({ x, label: MON[m] + (m === 0 ? " '" + String(y).slice(2) : "") });
      m++; if (m > 11) { m = 0; y++; }
    }

    const order = [...dated].sort((a, b) => Date.parse(a.date!) - Date.parse(b.date!));
    const dots = order.map((p, i) => ({
      slug: p.slug, name: p.name, date: p.date!, color: COLORS[primaryCat(p)],
      x: pct(Date.parse(p.date!)), lane: LANE_ORDER.indexOf(primaryCat(p)), i,
    }));
    const undated = PROJECTS.filter((p) => !p.date).map((p) => p.name);
    const foot = `${dated.length} tracked deploys · earliest ${fmtDate(order[0].date)} → latest ${fmtDate(order[order.length-1].date)}`
      + (undated.length ? `  ·  + ${undated.length} shipped to npm / source without a tracked deploy date (${undated.join(", ")})` : "");
    return { months, dots, foot };
  }, []);

  useEffect(() => { setMounted(true); }, []);
  const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function jumpTo(slug: string) {
    const el = document.getElementById(slug);
    if (!el) return;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash");
  }

  return (
    <section className={s.cadence} aria-label="Deploy cadence over time">
      <div className={s["cadence-head"]}>
        <span className={s.lbl}>Deploy cadence</span>
        <span className={s.note}>each dot = a production deploy · placed by date, grouped by domain</span>
      </div>
      <div className={s.scroll}>
        <div className={s.cgrid}>
          <div className={s["lane-labels"]}>
            {LANE_ORDER.map((c) => <div key={c} style={{ color: COLORS[c] }}>{c}</div>)}
          </div>
          <div className={s.plot} style={{ height: LANE_ORDER.length * LANE }}>
            {model.months.map((mo, i) => <div key={`g${i}`} className={s.gridcol} style={{ left: `${mo.x}%` }} />)}
            {LANE_ORDER.map((_, i) => <div key={`s${i}`} className={s.lanesep} style={{ top: i * LANE }} />)}
            {model.dots.map((d) => (
              <button key={d.slug} className={s.dot}
                style={{
                  left: `${d.x}%`, top: d.lane * LANE + LANE / 2, background: d.color,
                  ...(reduce ? {} : {
                    opacity: mounted ? 1 : 0,
                    transform: `translate(-50%,-50%) scale(${mounted ? 1 : 0.2})`,
                    transition: "opacity .3s, transform .35s cubic-bezier(.2,.8,.2,1)",
                    transitionDelay: `${120 + d.i * 55}ms`,
                  }),
                }}
                aria-label={`${d.name}, ${fmtDate(d.date)}. View card.`}
                onMouseEnter={() => setTip({ x: `${d.x}%`, y: d.lane * LANE + LANE / 2, text: `${d.name} · ${fmtDate(d.date)}` })}
                onFocus={() => setTip({ x: `${d.x}%`, y: d.lane * LANE + LANE / 2, text: `${d.name} · ${fmtDate(d.date)}` })}
                onMouseLeave={() => setTip(null)} onBlur={() => setTip(null)}
                onClick={() => jumpTo(d.slug)}
              />
            ))}
            {tip && <div className={`${s.tip} ${s.on}`} style={{ left: tip.x, top: tip.y }}>{tip.text}</div>}
          </div>
          <div />
          <div className={s.axis}>
            {model.months.map((mo, i) => <div key={`a${i}`} className={s["axis-label"]} style={{ left: `${mo.x}%` }}>{mo.label}</div>)}
          </div>
        </div>
      </div>
      <div className={s["cadence-foot"]}>{model.foot}</div>
    </section>
  );
}
```

- [ ] **Step 3: Typecheck + build**

Run: `npx tsc --noEmit && npm run build`
Expected: no type errors; build succeeds.

- [ ] **Step 4: Commit**

```bash
git add components
git commit -m "feat: CadenceChart client island ported from showcase"
```

---

## Task 6: Filter + grid (client island) + ProjectGrid

**Files:**
- Create: `components/ProjectGrid.tsx` + `.module.css`, `components/FilterBar.tsx` + `.module.css`, `components/HomeFilter.tsx` (`'use client'`)
- Test: `components/__tests__/HomeFilter.test.tsx`

**Interfaces:**
- Consumes: `PROJECTS`, `sortByDateDesc`, `LANE_ORDER`, `ProjectCard`.
- Produces:
  - `<ProjectGrid projects={Project[]} />` — renders the grid of `ProjectCard`.
  - `<FilterBar active={string} cats={string[]} onSelect={(c:string)=>void} count={{shown:number;total:number}} />`.
  - `<HomeFilter/>` — owns `activeCat` state, computes filtered+sorted list, renders FilterBar + ProjectGrid.

- [ ] **Step 1: Write failing test `components/__tests__/HomeFilter.test.tsx`**

```tsx
import { describe, it, expect } from "vitest";
import "@testing-library/jest-dom";
import { render, screen, fireEvent, within } from "@testing-library/react";
import HomeFilter from "../HomeFilter";

describe("HomeFilter", () => {
  it("shows all projects by default and filters on chip click", () => {
    render(<HomeFilter />);
    const grid = screen.getByTestId("project-grid");
    expect(within(grid).getAllByRole("article")).toHaveLength(19);
    fireEvent.click(screen.getByRole("button", { name: "Extension" }));
    // only Hotjar Blocker is an Extension
    expect(within(grid).getAllByRole("article")).toHaveLength(1);
    expect(within(grid).getByText("Hotjar Blocker")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `../HomeFilter` not found.

- [ ] **Step 3: Create `ProjectGrid`** — port `.grid` selector into `ProjectGrid.module.css`. Component:

```tsx
import s from "./ProjectGrid.module.css";
import ProjectCard from "./ProjectCard";
import type { Project } from "@/lib/types";
export default function ProjectGrid({ projects }: { projects: Project[] }) {
  return <div className={s.grid} data-testid="project-grid">{projects.map((p) => <ProjectCard key={p.slug} project={p} />)}</div>;
}
```

- [ ] **Step 4: Create `FilterBar`** — port `.filterbar`, `.filterbar .wrap`, `.chips`, `.chip` (+ `:hover/.on`), `.countout` into `FilterBar.module.css`. Component (`'use client'`):

```tsx
"use client";
import s from "./FilterBar.module.css";
export default function FilterBar({ active, cats, onSelect, count }:{
  active:string; cats:string[]; onSelect:(c:string)=>void; count:{shown:number;total:number};
}) {
  return (
    <div className={s.filterbar} id="log">
      <div className={`wrap ${s.bar}`}>
        <div className={s.chips}>
          {cats.map((c) => (
            <button key={c} className={`${s.chip} ${c===active ? s.on : ""}`} onClick={() => onSelect(c)}>{c}</button>
          ))}
        </div>
        <div className={s.countout}>{count.shown} / {count.total} projects</div>
      </div>
    </div>
  );
}
```

(Note: the original `.filterbar .wrap` padding rule — replicate via a local `bar` class applied alongside global `wrap`, or port the padding into `.filterbar .wrap` global override. Keep sticky behavior from `.filterbar`.)

- [ ] **Step 5: Create `HomeFilter`** (`'use client'`):

```tsx
"use client";
import { useMemo, useState } from "react";
import FilterBar from "./FilterBar";
import ProjectGrid from "./ProjectGrid";
import { PROJECTS } from "@/lib/projects";
import { sortByDateDesc, LANE_ORDER } from "@/lib/helpers";

const CATS = ["All", ...LANE_ORDER];

export default function HomeFilter() {
  const [active, setActive] = useState("All");
  const display = useMemo(() => sortByDateDesc(PROJECTS), []);
  const list = useMemo(() => display.filter((p) => active === "All" || p.cats.includes(active as never)), [active, display]);
  return (
    <>
      <FilterBar active={active} cats={CATS} onSelect={setActive} count={{ shown: list.length, total: PROJECTS.length }} />
      <main style={{ padding: "30px 0 60px" }}>
        <div className="wrap"><ProjectGrid projects={list} /></div>
      </main>
    </>
  );
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npm test`
Expected: PASS — 19 by default, 1 after Extension filter.

- [ ] **Step 7: Commit**

```bash
git add components
git commit -m "feat: filter + grid client island with filter test"
```

---

## Task 7: Compose home page

**Files:**
- Modify: `app/page.tsx` (replace temporary scaffold)

**Interfaces:**
- Consumes: `TopBar, Hero, CadenceChart, StatStrip, HomeFilter, Footer`.

- [ ] **Step 1: Replace `app/page.tsx`**

```tsx
import TopBar from "@/components/TopBar";
import Hero from "@/components/Hero";
import CadenceChart from "@/components/CadenceChart";
import StatStrip from "@/components/StatStrip";
import HomeFilter from "@/components/HomeFilter";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <TopBar />
      <header style={{ padding: "60px 0 18px" }}>
        <div className="wrap">
          <Hero />
          <CadenceChart />
          <StatStrip />
        </div>
      </header>
      <HomeFilter />
      <Footer />
    </>
  );
}
```

(Note: if `Hero` already includes the `<header class="hero">` wrapper and `.wrap` from the port, drop the extra wrapper here and render `<Hero/>` directly — match the original DOM so the ported CSS applies. Reconcile against `showcase.html` structure: hero, cadence, and stats all sit inside one `header.hero > .wrap`.)

- [ ] **Step 2: Build + smoke test**

Run: `npm run build && npx serve out` (or open `out/index.html`)
Expected: home renders with hero, cadence chart (animated dots), stat strip, sticky filter, 19 cards; chips filter; dot click scrolls to card and flashes it.

- [ ] **Step 3: Commit**

```bash
git add app
git commit -m "feat: compose home page"
```

---

## Task 8: Per-project detail pages

**Files:**
- Create: `app/projects/[slug]/page.tsx`, `components/ProjectDetail.tsx` + `.module.css`

**Interfaces:**
- Consumes: `PROJECTS`, `primaryCat`, `COLORS`, `fmtDate`, `Project`.
- Produces: static route per slug via `generateStaticParams`; per-project `generateMetadata`.

- [ ] **Step 1: Create `components/ProjectDetail.tsx` + `.module.css`**

A server component taking `{ project: Project }`. Layout (honest expansion of existing data): back link to `/`; status + deploy date + domain (mono meta row, reuse status colors); large `h1` name (Archivo); tagline (category color); full description; complete stack chips; link buttons (Live/GitHub/npm, same styles as card); a small "Shipped {fmtDate(date)}" line; and conditional sections rendered ONLY if present: `highlights` (`<ul>`) and `screenshots`. No invented content. Style by porting card link/stack/status classes + a detail-specific layout in `ProjectDetail.module.css` (use tokens; flat color; `--cat` set on root). **Build it responsive/mobile-first** (fluid `h1` via `clamp()`, readable measure, no horizontal overflow on small phones); the global `.wrap` already handles horizontal gutters incl. safe-area insets after Task 9. Set `--cat` with the `React.CSSProperties` cast per Executor Notes.

```tsx
import Link from "next/link";
import s from "./ProjectDetail.module.css";
import type { Project } from "@/lib/types";
import { primaryCat, COLORS, fmtDate } from "@/lib/helpers";

export default function ProjectDetail({ project: p }: { project: Project }) {
  const cat = primaryCat(p);
  const status = p.vis === "Private" ? "Private" : p.vis === "Fork" ? "Fork" : p.vis === "Standalone" ? "No repo" : (p.live ? "Live" : "Public");
  return (
    <article className={s.detail} style={{ ["--cat" as string]: COLORS[cat] }}>
      <div className="wrap">
        <Link href="/" className={s.back}>← All projects</Link>
        <div className={s.meta}><span>{status}</span><span>/</span><span>{fmtDate(p.date)}</span><span className={s.cat}>{cat}</span></div>
        <h1 className={s.title}><span className={s.ic}>{p.icon}</span>{p.name}</h1>
        <p className={s.tagline}>{p.tagline}</p>
        <p className={s.desc}>{p.desc}</p>
        <div className={s.stack}>{p.tech.map((t) => <span key={t}>{t}</span>)}</div>
        <div className={s.links}>
          {p.live && <a className={s.primary} href={p.live} target="_blank" rel="noopener">Live ↗</a>}
          {p.github && <a href={p.github} target="_blank" rel="noopener">GitHub</a>}
          {p.npm && <a className={s.npm} href={p.npm} target="_blank" rel="noopener">npm</a>}
        </div>
        {p.highlights?.length ? (<section className={s.section}><h2>Highlights</h2><ul>{p.highlights.map((h)=><li key={h}>{h}</li>)}</ul></section>) : null}
      </div>
    </article>
  );
}
```

- [ ] **Step 2: Create `app/projects/[slug]/page.tsx`**

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PROJECTS } from "@/lib/projects";
import ProjectDetail from "@/components/ProjectDetail";

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const p = PROJECTS.find((x) => x.slug === params.slug);
  if (!p) return {};
  return {
    title: `${p.name} — Liraz Amir`,
    description: p.tagline,
    openGraph: { title: `${p.name} — Liraz Amir`, description: p.desc, type: "article" },
  };
}

export default function ProjectPage({ params }: { params: { slug: string } }) {
  const p = PROJECTS.find((x) => x.slug === params.slug);
  if (!p) notFound();
  return <ProjectDetail project={p} />;
}
```

(Note: Next 15 may type `params` as a Promise in some setups. If `npm run build` reports `params` should be awaited, change the signatures to `async` and `const { slug } = await params;`. Apply the same to `generateMetadata`.)

- [ ] **Step 3: Build to verify all detail pages export**

Run: `npm run build`
Expected: `out/projects/<slug>/index.html` exists for all 19 slugs (e.g. `out/projects/cycle/index.html`).

- [ ] **Step 4: Commit**

```bash
git add app components
git commit -m "feat: per-project static detail pages with SEO metadata"
```

---

## Task 9: Responsive & safe-area hardening

**Files:**
- Modify: `app/layout.tsx` (viewport), `app/globals.css` (safe-area gutters), and any component module with breakpoint gaps found during the audit.

**Interfaces:**
- Produces: a layout that respects iOS/Android safe areas and has no horizontal overflow at any width.

- [ ] **Step 1: Set `viewport-fit=cover`** in `app/layout.tsx` — add a Next viewport export alongside `metadata`:

```tsx
import type { Viewport } from "next";
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};
```

- [ ] **Step 2: Add safe-area gutters in `app/globals.css`** — fold the safe-area insets into the horizontal gutter so all `.wrap`-bounded content clears notches/cutouts, and pad the sticky/edge chrome:

```css
.wrap{
  max-width:var(--maxw);
  margin:0 auto;
  padding-left:max(24px, env(safe-area-inset-left));
  padding-right:max(24px, env(safe-area-inset-right));
}
```
Also extend the top bar's top padding and the footer's bottom padding with `env(safe-area-inset-top)` / `env(safe-area-inset-bottom)` respectively (use `max()` so desktop is unaffected), and ensure the sticky filter bar's effective top accounts for `env(safe-area-inset-top)`. Keep existing values as the `max()` floor — desktop must look identical.

- [ ] **Step 3: Breakpoint audit (manual + reason about each)** — verify at 320, 360, 390, 414, 768, 1024, 1280, 1440, 1920 widths:
  - No element causes horizontal scroll (watch the cadence chart `min-width` scroll container, long `desc` strings, stack chips, Hebrew/RTL strings, the stats strip).
  - Sticky top bar + filter bar remain usable and don't overlap content.
  - Cards reflow (grid is `auto-fill minmax(330px,1fr)` → 1 column on narrow; confirm 330px min doesn't overflow a 320px viewport — if it does, lower the min or add a small-screen override).
  - Tap targets ≥ ~40px on phones.
  Fix any issues found in the relevant component module (keep changes token-based, no redesign).

- [ ] **Step 4: Build gate**

Run: `npm run build`
Expected: succeeds. (Playwright verification of these fixes happens in Task 10.)

- [ ] **Step 5: Commit**

```bash
git add app components
git commit -m "feat: responsive safe-area hardening (viewport-fit, env insets, breakpoint audit)"
```

---

## Task 10: Playwright responsive test suite

**Files:**
- Create: `playwright.config.ts`, `e2e/responsive.spec.ts`
- Modify: `package.json` (add `@playwright/test` devDep + `test:e2e` script), `.gitignore` (add `playwright-report/`, `test-results/`)

**Interfaces:**
- Produces: an e2e suite that builds + serves the static `out/` and asserts responsiveness across a device/viewport matrix.

- [ ] **Step 1: Add Playwright** — `npm i -D @playwright/test` and `npx playwright install --with-deps chromium webkit`. Add scripts to `package.json`: `"test:e2e": "playwright test"`.

- [ ] **Step 2: Create `playwright.config.ts`** — serve the static export and define the matrix:

```ts
import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e",
  webServer: {
    command: "npx serve out -l 4173",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  use: { baseURL: "http://localhost:4173" },
  projects: [
    { name: "iphone-se", use: { ...devices["iPhone SE"] } },
    { name: "iphone-14-pro-max", use: { ...devices["iPhone 14 Pro Max"] } },
    { name: "pixel-7", use: { ...devices["Pixel 7"] } },
    { name: "ipad", use: { ...devices["iPad (gen 7)"] } },
    { name: "desktop-1280", use: { viewport: { width: 1280, height: 800 } } },
    { name: "desktop-1920", use: { viewport: { width: 1920, height: 1080 } } },
  ],
});
```
(`serve` is already available via `npx`; if not, add `serve` as a devDep. Build must run before e2e: document that `npm run build` precedes `npm run test:e2e`, or add a `pretest:e2e` script that runs `next build`.)

- [ ] **Step 3: Write `e2e/responsive.spec.ts`** — assert, on the home page, at every project (viewport):

```ts
import { test, expect } from "@playwright/test";

test.describe("home responsiveness", () => {
  test("no horizontal overflow", async ({ page }) => {
    await page.goto("/");
    const overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow).toBeLessThanOrEqual(1); // allow sub-pixel rounding
  });

  test("renders all 19 cards", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("article")).toHaveCount(19);
  });

  test("category filter narrows the grid", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Extension" }).click();
    await expect(page.locator("article")).toHaveCount(1);
  });

  test("cadence dot click scrolls to a card and resets filter", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Education" }).click();
    await page.locator(".dot, [class*='dot']").first().click();
    await expect(page.locator("article")).toHaveCount(19); // reset to All
  });
});

test("detail page renders and has no overflow", async ({ page }) => {
  await page.goto("/projects/cycle/");
  await expect(page.getByRole("heading", { name: /CYCLE/ })).toBeVisible();
  const overflow = await page.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  expect(overflow).toBeLessThanOrEqual(1);
});
```
(If the `.dot` class selector is hashed by CSS Modules, target dots by their `aria-label` via `page.getByRole("button", { name: /View project/ }).first()` instead. Adjust the selector to whatever the build emits — verify against `out/`.)

- [ ] **Step 4: Run the suite**

Run: `npm run build && npm run test:e2e`
Expected: all projects (viewports) pass. Fix any responsive failures in the relevant component module (re-run Task 9 audit reasoning), then re-run until green.

- [ ] **Step 5: Commit**

```bash
git add playwright.config.ts e2e package.json package-lock.json .gitignore
git commit -m "test: Playwright responsive suite across device/viewport matrix"
```

---

## Task 11: Deploy config, remove legacy, docs, final gate

**Files:**
- Create: `netlify.toml`
- Delete: `showcase.html`
- Modify: `CLAUDE.md`

**Interfaces:**
- Produces: deployable static build; updated project docs.

- [ ] **Step 1: Create `netlify.toml`**

```toml
[build]
  command = "npm run build"
  publish = "out"

[build.environment]
  NODE_VERSION = "20"
```

- [ ] **Step 2: Delete the legacy file**

```bash
git rm showcase.html
```

- [ ] **Step 3: Rewrite `CLAUDE.md`** for the new architecture: Next.js static-export app; commands (`npm run dev`, `npm run build`, `npm test`); the `lib/` single-source-of-truth data model; client-island boundaries (`CadenceChart`, `HomeFilter`); CSS-Modules + tokens convention; the deploy-on-push safety rule; and the honesty/content rule. Remove the old "single self-contained HTML" description.

- [ ] **Step 4: Final verification gate**

Run: `npm test && npx tsc --noEmit && npm run build && npm run test:e2e`
Expected: unit tests pass; no type errors; `out/index.html` + all 19 `out/projects/<slug>/index.html` present; Playwright responsive suite green across the full device/viewport matrix. Manually open `out/index.html` and one detail page to confirm rendering, filtering, and chart interactivity.

- [ ] **Step 5: Commit (do NOT push yet)**

```bash
git add -A
git commit -m "chore: netlify config, remove legacy showcase.html, update docs"
```

- [ ] **Step 6: Hand back to user for push approval**

Report build results. Ask the user to approve `git push origin main` (which triggers the production Netlify deploy). Do not push without explicit approval.

---

## Notes for the executor
- **Inline CSS custom properties:** TypeScript's `React.CSSProperties` has no string index signature, so cast the style object when setting `--cat`: `style={{ "--cat": COLORS[cat] } as React.CSSProperties}`. Apply in `ProjectCard` and `ProjectDetail` (replaces the `["--cat" as string]` shorthand shown in those tasks).
- Port CSS selectors **verbatim** from `showcase.html` into the named modules; do not redesign. The local class names should match the kebab class names used in the original markup so the ported rules apply unchanged.
- After Task 11, `showcase.html` is gone; if you need to re-check the original styles mid-execution, do earlier tasks first or recover it from `git show HEAD:showcase.html`.
- **Responsive/safe-area (Global Constraints):** all remaining UI is mobile-first; Task 9 adds `viewport-fit=cover` + `env(safe-area-inset-*)` gutters; Task 10's Playwright suite is the cross-resolution gate. Re-run `npm run test:e2e` after any UI change.
- Keep all 19 descriptions byte-for-byte identical to the source (honesty rule).
