# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single-file, no-build personal portfolio: `showcase.html` presents Liraz Amir's shipped projects as a filterable index. There is no package manager, bundler, test runner, or framework — it is hand-authored HTML/CSS/vanilla JS with web fonts from Google Fonts. Read `GOALS.md` first; it is the spec and the source of intent (mission, scope, success criteria, status).

## Commands

- **Preview:** open `showcase.html` directly in a browser (`Start-Process showcase.html` on Windows). No server needed — it works from `file://`, though the live-site links and Google Fonts require network.
- **Sanity-check the embedded JS** (there is no test suite) by parsing/running the `<script>` block against a stubbed DOM with Node, e.g. stub `window.matchMedia`, `requestAnimationFrame`, `setTimeout`, and `document.{getElementById,createElement}`, then `new Function(js)()`. This catches syntax/reference errors before opening the page.

## Architecture

Three files form one pipeline — changing project facts means touching the right layer:

1. **`git_netlify_projects.csv`** — the raw inventory (every repo ↔ Netlify deployment, with visibility, language, deploy source, and `Last Published` date). This is the upstream source of truth for *which* projects exist and their deploy dates.
2. **`GOALS.md`** — mission, scope (19 entries: public / private / fork / no-repo), and the **honesty constraint** that governs all content (see below).
3. **`showcase.html`** — the artifact. All rendered content lives in the `PROJECTS` array near the top of the inline `<script>`; everything on the page is derived from it. The CSV and the array are maintained by hand and can drift — when they disagree, the array is what ships, but reconcile deliberately.

### `PROJECTS` data model

Each entry: `name, tagline, date` (ISO `YYYY-MM-DD` or `null`), `cats[]`, `vis` (`Public|Private|Fork|Standalone`), `icon`, `desc`, `tech[]`, and optional `live` / `github` / `npm` links. Adding or editing a project = editing this array; nothing else is required.

### Derived rendering (don't hardcode what's computed)

- **Stats strip** (shipped/live/on-npm/AI-powered/domains) is computed from `PROJECTS` at runtime — never hardcode counts.
- **Deploy-cadence chart** (the hero signature) is built from `date` fields: dots are plotted by date across **swimlanes**, one per domain. `date: null` projects are intentionally excluded from the timeline and listed in the chart footnote instead — do not invent dates to place them.
- **Categories & colors:** `LANE_ORDER` sets lane stacking and the `COLORS` map; `PRIORITY` + `primaryCat()` pick the single lane/spine color for a multi-category project (e.g. AI Image Generator resolves to *Dev Tool*, STEM/Lumi to *Education*). The same color drives the card's left spine and category tag, so the chart and cards stay visually linked. Adjust bucketing by editing `PRIORITY`, not per-card.
- **Card grid** is sorted newest-first (nulls last) and filtered by the chips built from `LANE_ORDER`.

### Design system (see the `:root` token block)

Deliberate "deploy log / drafting-table" identity: cool putty paper, **flat color only — no gradients/glow**, cobalt accent, faint drafting grid, small radius. Type roles: Archivo (display), Hanken Grotesk (body), IBM Plex Mono (all metadata/dates/status). Keep changes within these tokens rather than introducing new ad-hoc colors. Motion is gated behind `prefers-reduced-motion`; preserve that.

## Content rule (non-negotiable, from GOALS.md)

Credibility is the whole point. Descriptions must be sourced from the project's README or live site — never inflated or guessed. Labels must stay accurate: `Private` = live but source-closed, `Fork` and `Standalone` (no-repo) labeled as such. Two known live-site corrections already applied vs. the CSV: `az-ma-kore` is a national Pikud HaOref alert-analysis dashboard (not "Dimona alarms"), and `lumi-kid` is an AI English tutor with Meitzav prep (not a generic "personal teacher") — match the live truth, not the inventory shorthand.
