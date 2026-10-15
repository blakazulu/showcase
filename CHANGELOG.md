# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2026-10-05

### Added

- Portfolio of shipped projects as a statically exported Next.js 15 site, deployed to Netlify.
- Typed project data in one place, with helpers and unit tests.
- A static detail page for every project, with its own SEO metadata and links to related projects.
- Aurora hero ("I ship real products.") over a CSS aurora background with an optional Three.js shader accent, shown site-wide.
- The project list as a terminal "deploy log": live KPI chips that count up, a self-typing prompt that reflects the active filter, category filter chips, and expandable project rows with an animated build-step reveal.
- Project order is shuffled on every visit, and the first row opens automatically.
- Two-tone Phosphor icons for every project.
- Magic Rings background on project detail pages, tinted to the project's category color.
- Store badges and links: Google Play ("Android app") for ChatHop and Microsoft Store ("Windows app") for ScalpelPDF.
- New projects Prism, Merge a Mutant and Findra, and a new Game category (21 projects in total).
- Shayach accessibility widget, matched to the site, as a draggable floating button.
- Lottie "deploy log" animation in the site's colors, with a player project to preview it.
- CV builder skill that turns shipped work into ATS-safe English and Hebrew CVs, exported to DOCX and PDF, with a minimal modern design (Inter and Heebo, teal accent).
- Playwright tests across six phone, tablet and desktop sizes, and unit tests for the components.

### Changed

- Replaced the original single-file `showcase.html` page with the Next.js app.
- Home rebuilt as an interactive 3D desk scene.
- Rewrote the copy for every project as a hook, a one-line pitch and a longer description, keeping every fact true.
- Private projects no longer show a "Private" label on their cards or detail pages.
- Public projects without a live site now show a neutral status color instead of the green "Live" one.

### Removed

- AIEMD Platform from the showcase.

### Fixed

- Safe-area spacing on phones with notches and rounded corners.
- Hebrew CV issues: the phone number's "+" moving to the wrong side, English skill labels reordering, and Word pushing right-to-left paragraphs to the left.
- MortgageFix now links to its current live site.
