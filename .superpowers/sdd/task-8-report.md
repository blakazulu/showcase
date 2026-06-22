# Task 8 Report — Per-project static detail pages

## Files Created

| File | Purpose |
|------|---------|
| `app/projects/[slug]/page.tsx` | Dynamic static route: `generateStaticParams`, `generateMetadata`, page component |
| `components/ProjectDetail.tsx` | Server component rendering the full project detail layout |
| `components/ProjectDetail.module.css` | Module CSS with detail-specific layout, tokens, responsive rules |

## Next 15 `params` Typing

Both `generateMetadata` and the page default export are `async` functions. `params` is typed as `Promise<{ slug: string }>` and awaited with `const { slug } = await params;`. This follows the Next.js 15 async params pattern required for static export with `generateStaticParams`.

## Build Result

```
✓ Compiled successfully in 1668ms
✓ Generating static pages (23/23)
✓ Exporting (2/2)
```

`npx tsc --noEmit` — no errors, no output (clean).

All 19 detail pages exported to `out/projects/<slug>/index.html`.

### Confirmed slugs

aiemd-platform, ai-image-generator, archeotriage, az-ma-kore, chathop, cycle, floatjet, hotjar-blocker, keyquest, kiryat-begin-desert-science, lumi-kid, math-practice, mortgagefix, new-home-owner, past-palette, save-the-past, scalpelpdf, search-mcp, stem-explorers

Spot-checked: `out/projects/cycle/index.html` ✓ | `out/projects/mortgagefix/index.html` ✓ | `out/projects/search-mcp/index.html` ✓

## Responsive Measures

- **Fluid `h1`**: `clamp(1.75rem, 4vw + 0.5rem, 3.25rem)` — scales smoothly from 28px at 320px to ~52px at 1200px
- **Fluid tagline**: `clamp(0.9rem, 1.5vw + 0.5rem, 1.125rem)`
- **Fluid description**: `clamp(0.875rem, 1vw + 0.5rem, 1rem)`, capped at `max-width: 70ch` for readability on wide screens
- **Fluid icon**: `clamp(44px, 6vw, 64px)` size, `clamp(22px, 3vw, 32px)` font-size
- **Stack chips**: `flex-wrap: wrap` with `white-space: nowrap` per chip — no overflow
- **Link row**: `flex-wrap: wrap` — buttons wrap naturally on narrow screens
- **`@media (max-width: 480px)`**: smaller padding/gap on link buttons for 320px phones
- **`.wrap` className**: applied directly on the inner div — uses global `max-width: var(--maxw); padding: 0 24px` for horizontal gutters
- **`overflow-wrap: break-word; word-break: break-word`** on `h1` to handle very long project names

## `--cat` Custom Property

Set as `style={{ "--cat": COLORS[cat] } as React.CSSProperties}` on the `<article>` root — the correct React CSSProperties cast (NOT the `["--cat" as string]` shorthand).

## Conditional Sections

`highlights` and `screenshots` sections are guarded with `p.highlights && p.highlights.length > 0` and `p.screenshots && p.screenshots.length > 0` respectively. Since both fields are absent/empty in current data, neither section renders.

## Self-Review

- No invented content — only fields present in each `Project` object are displayed
- Server component only — no `'use client'` directive
- Flat color throughout — no gradients or invented color values
- All link styles mirror the card (`primary`, `npm`, plain) via CSS classes
- Status color classes (`live`, `private`, `fork`, `norepo`) mirror `ProjectCard.module.css` naming and token usage
- `fmtDate(p.date)` handles `null` gracefully (returns `"—"`)
- `notFound()` called when slug doesn't match any project

## Concerns

None. Build is clean, all 19 pages exported, TypeScript is strict-clean.

## Commit

`f787656` — feat: per-project static detail pages with SEO metadata

---

## Fix: neutral Public status color

### Problem

A Public project with no live URL (e.g. "Search MCP") was displaying a green dot — identical to the "Live" green — because `ProjectCard.tsx` always returned `["live", ...]` for Public projects, and `ProjectDetail.tsx` always resolved to `s.live` for the Public case (both with and without a live URL).

### Changes

**`components/ProjectCard.module.css`** — Added `.public { color: var(--ink-3); }` next to the existing status color rules.

**`components/ProjectDetail.module.css`** — Added `.public { color: var(--ink-3); }` next to the existing status color rules.

**`components/ProjectCard.tsx`** — Changed the final `statusInfo` return from `["live", p.live ? "Live" : "Public"]` to `p.live ? ["live", "Live"] : ["public", "Public"]`. Public+live → green "Live"; Public+no-live → neutral "Public".

**`components/ProjectDetail.tsx`** — Changed the `statusClass` final fallback from the duplicated `s.live` to `p.live ? s.live : s.public`. Keeps the `status` label logic ("Live"/"Public") unchanged.

### Verification

- **`npm test`** — 14 tests passed (3 test files). ProjectCard test suite unaffected; the test project has a live URL so it still renders "Live".
- **`npx tsc --noEmit`** — clean (no output).
- **`npm run build`** — succeeded; all 19 static pages generated cleanly.

### Sanity

- CYCLE (Public + live URL) → still resolves `["live", "Live"]` → green dot, "Live" label. ✓
- Search MCP (Public, no live URL) → now resolves `["public", "Public"]` → neutral `var(--ink-3)` dot, "Public" label. ✓
