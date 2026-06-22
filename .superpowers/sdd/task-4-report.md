# Task 4 Report: ProjectCard Component

## TDD Evidence

### RED Phase
**Command:** `npm test`
**Output (truncated):**
```
FAIL  components/__tests__/ProjectCard.test.tsx [ components/__tests__/ProjectCard.test.tsx ]
Error: Failed to resolve import "../ProjectCard" from "components/__tests__/ProjectCard.test.tsx". Does the file exist?
  Plugin: vite:import-analysis
```
**Why it failed:** `components/ProjectCard.tsx` did not yet exist. The test file was written first (Step 1), then run to confirm failure (Step 2), as required by TDD discipline.

### GREEN Phase
**Command:** `npm test`
**Output:**
```
RUN  v2.1.9 C:/Code/Personal/showcase

✓ lib/__tests__/helpers.test.ts (11 tests) 3ms
✓ components/__tests__/ProjectCard.test.tsx (2 tests) 39ms

Test Files  2 passed (2)
      Tests  13 passed (13)
   Start at  09:38:16
   Duration  761ms
```
All 13 tests pass.

---

## Files Changed

| File | Action |
|------|--------|
| `components/__tests__/ProjectCard.test.tsx` | Created — test file per brief verbatim |
| `components/ProjectCard.tsx` | Created — component per brief, with `as React.CSSProperties` for `--cat` |
| `components/ProjectCard.module.css` | Created — CSS ported from showcase.html |
| `vitest.setup.ts` | Created — `import "@testing-library/jest-dom";` |
| `vitest.config.ts` | Modified — added `@/` alias resolution + `setupFiles: ["./vitest.setup.ts"]` |

---

## CSS Verification vs showcase.html

CSS was verified by grepping showcase.html for all selectors. Ported verbatim:
- `.card` — position, background, border (with `var(--cat,var(--accent))`), border-radius, padding, flex, gap, transition
- `.card:hover` — translateY, border-left-width, border-color, box-shadow
- `.meta` — flex, mono font, 10.5px, letter-spacing, uppercase, ink-3
- `.status` — inline-flex, gap, font-weight:600
- `.status .d` — 7×7 dot, border-radius 50%, currentColor
- `.live/.private/.fork/.norepo` — color variants (`var(--live)`, `var(--private)`, `var(--fork)`)
- `.meta .sep` — color: var(--line)
- `.meta .cat` — margin-left:auto, var(--cat,var(--accent)), font-weight:600
- `.head` — flex, align flex-start, gap:11px
- `.ic` — 38×38, border-radius, flex centered, 20px, color-mix backgrounds
- `.head h3` — display/mono/700/19px/letter-spacing/line-height
- `.head h3 a` — color:inherit, text-decoration:none (added per brief instruction)
- `.tagline` — 13px, var(--cat,var(--accent)), font-weight:600, margin-top:1px
- `.desc` — 13.5px, var(--ink-2), line-height:1.6
- `.stack` — flex-wrap, gap:5px, margin-top:1px
- `.stack span` — mono, 10.5px, ink-2, border, padding, border-radius:3px, card bg
- `.links` — flex-wrap, gap:7px, margin-top:auto, padding-top:5px
- `.links a` — inline-flex, mono, 11.5px, uppercase, padding, border-radius, border, bg, transition
- `.links a:hover` — border-color:var(--ink), color:var(--ink)
- `.primary` / `.primary:hover` — accent bg/color
- `.npm` / `.npm:hover` — c-dev color/border with color-mix

**Skipped as instructed:** `.card.flash` and `@keyframes flash` (live in globals.css per Task 1).

---

## TypeScript Check
**Command:** `npx tsc --noEmit`
**Output:** (clean — no output = no errors)

---

## Self-Review

1. The `--cat` custom property is set via `style={{ "--cat": COLORS[cat] } as React.CSSProperties}` as required by the brief's Executor Notes (not the `["--cat" as string]` shorthand that's in the brief's Step 4 code).
2. The `statusInfo` function returns `["norepo", "No repo"]` for `Standalone` vis, matching showcase.html's behavior.
3. The card root has `id={p.slug}` for CadenceChart scrolling compatibility.
4. The `vitest.config.ts` was updated to resolve `@/` alias (pointing to project root), which was required because Vitest doesn't inherit Next.js tsconfig paths automatically.
5. The test imports `@testing-library/jest-dom` directly at the top of the test file AND via `vitest.setup.ts` — the setup file is the primary mechanism; the import in the test file is additional per brief suggestion.

---

## Concerns

- **Minor (cosmetic):** The `.primary` and `.npm` CSS classes use `!important` to override `.links a` specificity. The original showcase.html uses cascading specificity (`.links a.primary`) which works in plain CSS but CSS Modules scopes class names, so `.links a.primary` compound selector would need both classes to be from the same module. Using `!important` achieves the same visual result but is slightly less elegant. An alternative would be to keep `.links a.primary` as a compound selector — both approaches work correctly.

- **vitest.config.ts path alias:** The `@/` alias resolution was not present before this task. The existing `helpers.test.ts` does not use `@/` imports (uses relative paths), so this was a new requirement introduced by `ProjectCard.tsx` importing from `@/lib/helpers`. This is now fixed for all future component tests.

---

## Commit
`bf91706` — feat: ProjectCard with detail-page link + tests

---

## Fix: compound selectors + dedup import

### Rules changed

**`components/ProjectCard.module.css`** — replaced 4 flat rules carrying 8 `!important` declarations with 4 compound-selector rules under `.links a`:

```css
/* Before (flat rules with !important) */
.primary { background: var(--accent) !important; border-color: var(--accent) !important; color: #fff !important; }
.primary:hover { background: var(--accent-deep) !important; border-color: var(--accent-deep) !important; }
.npm { color: var(--c-dev) !important; border-color: color-mix(in srgb, var(--c-dev) 40%, var(--line)) !important; }
.npm:hover { border-color: var(--c-dev) !important; color: var(--c-dev) !important; }

/* After (compound selectors, no !important) */
.links a.primary { background: var(--accent); border-color: var(--accent); color: #fff; }
.links a.primary:hover { background: var(--accent-deep); border-color: var(--accent-deep); }
.links a.npm { color: var(--c-dev); border-color: color-mix(in srgb, var(--c-dev) 40%, var(--line)); }
.links a.npm:hover { border-color: var(--c-dev); color: var(--c-dev); }
```

**`components/__tests__/ProjectCard.test.tsx`** — removed redundant `import "@testing-library/jest-dom";` (already loaded globally via `vitest.setup.ts` referenced in `vitest.config.ts`).

### !important count after fix

`grep -c "!important" components/ProjectCard.module.css` → **0**

### npm test output

```
RUN  v2.1.9 C:/Code/Personal/showcase

✓ components/__tests__/ProjectCard.test.tsx (2 tests) 39ms

Test Files  1 passed (1)
      Tests  2 passed (2)
   Start at  09:41:20
   Duration  1.11s
```

### npm run build output

```
▲ Next.js 15.5.19
✓ Compiled successfully in 595ms
✓ Generating static pages (4/4)
✓ Exporting (2/2)

Route (app)           Size  First Load JS
┌ ○ /                123 B        103 kB
└ ○ /_not-found      993 B        104 kB
```

Build succeeded with no errors.
