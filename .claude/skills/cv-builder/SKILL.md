---
name: cv-builder
description: Build and maintain Liraz's ATS-safe CV. Use when asked to review the work/projects, review the existing CV, draft/update a CV or resume, tailor a CV to a job posting, or export a CV to DOCX/PDF. Personal to this repo; applies the Israel/ATS method in docs/cv_report.md and pulls real evidence from lib/projects.ts + the existing CV.
---

# cv-builder

A personal, three-phase workflow that turns Liraz's real work into two ATS-safe
master CVs - one **English** (`cv/liraz-en.md`), one **Hebrew** (`cv/liraz-he.md`) -
then exports each to DOCX + PDF. It applies the Israel/ATS method distilled in
`references/israel-ats-rules.md` (full sourcing lives in `docs/cv_report.md`).

**Non-negotiable rule: every concrete claim on the CV must be real** - sourced
from `lib/projects.ts`, the project's live site / GitHub, or the existing CV.
Never invent employers, dates, metrics, or capabilities. If a claim can't be
verified, flag it and leave it out. This mirrors the repo's content rule in
`CLAUDE.md`.

**Writing style - the CV must read as human-written, never AI-generated.** Use
plain ASCII punctuation only: normal hyphens (never em-dashes or en-dashes,
including in date ranges - write `2023-Present`), straight quotes `"` and `'`
(never curly/smart quotes), `...` typed as three dots (never the ellipsis glyph),
and normal spaces (never non-breaking or exotic spaces). No emojis. Write the way
a person writes: vary sentence length, avoid the tic of stock connective phrases
("moreover", "furthermore", "in today's fast-paced world"), and don't over-hedge.
The exporters run an automatic normalization pass (see below), but write clean
source anyway - the goal is text that passes as human at a glance and by tooling.

**Automatic safety net:** both exporters normalize the text on the way out
(em/en dashes -> hyphen, curly quotes -> straight, ellipsis glyph -> `...`,
exotic/zero-width spaces -> normal or removed). The DOCX self-test then scans the
result and prints `OK: no AI-tell punctuation` or a warning listing any survivors.
So even a stray smart quote pasted into a source file cannot reach the final DOCX/PDF.

## Content preferences (Liraz - always apply)

- **Never mention the "Az Ma Kore" project** on any CV or cover letter. Do not use it
  as a project entry or example, in any language.
- **MyPart AngularJS bullet:** phrase the migration as "Migrated production systems from
  AngularJS to the latest Angular versions" (Hebrew: "לגרסאות Angular העדכניות"). Do not
  pin a specific major version number.

## When to use

Trigger on: "review my work / projects for the CV", "review my CV", "build /
update / draft my CV or resume", "tailor my CV to this job", "make a Hebrew CV",
"export the CV to PDF/DOCX".

## Setup (one time)

The DOCX generator needs one pure-Python package:

```
pip install python-docx
```

The PDF generator reuses the repo's existing Playwright/Chromium - no new install.
Run all commands from the repo root (`C:\Code\Personal\showcase`).

## Output location

Everything the skill produces goes in `cv/` (gitignored - keeps contact details
out of the auto-deploying repo). The **general masters** live in `cv/general/`;
each **tailored target** gets its own subfolder `cv/<target>/` holding its CVs and
cover letter:

```
cv/
  evidence-ledger.md          # Phase 1 output: verified career spine + project evidence
  gap-report.md               # Phase 2 output: keep / fix / drop critique of the old CV
  general/
    liraz-en.md, liraz-he.md  # Phase 3 masters (source of truth)
    liraz-en.docx/.pdf, liraz-he.docx/.pdf
  <target>/                   # e.g. geophysics/ - one folder per job applied to
    liraz-en.md, liraz-he.md  # tailored to that posting
    liraz-en.docx/.pdf, liraz-he.docx/.pdf
    cover-letter-he.md        # cover letter (language as the role needs)
```

Create the folders if they don't exist. Confirm `cv/` is in `.gitignore` before writing.

---

## Phase 1 - Review the work (gather evidence)

Goal: assemble a verified **evidence ledger** before writing a single CV line.

1. **Project evidence.** Read `lib/projects.ts` (all projects: `name`, `tagline`,
   `short`, `desc`, `tech`, `date`, `cats`, `vis`, `live`/`github`/`npm`/`play`/`store`).
   These are the shipped-work proof points.
2. **Career spine.** Read the existing CV (default `docs/liraz_amir_cv.pdf`) for
   employers, roles, dates, education, military/national service, skills, languages,
   and contact details. `projects.ts` has *what was built*; the CV has *the career
   timeline* - you need both.
3. **Extra sources (optional).** If the user points at more (another repo, a
   LinkedIn export, a job history note), ingest those too.
4. **Honesty-check (built in).** For every fact headed to the CV, confirm it
   against a real source. Live-site / GitHub links in `projects.ts` are checkable
   (use WebFetch if a claim needs confirming). Respect `vis`: `Private` projects
   are real and shippable but source-closed - present them without linking a repo.
   Honor the two live-truth corrections in `CLAUDE.md` (`az-ma-kore` = national
   Pikud HaOref alert analysis; `lumi-kid` = AI English tutor with Meitzav prep).
   Anything you can't verify: mark `UNVERIFIED` in the ledger and keep it off the CV.
5. Write `cv/evidence-ledger.md`: the career spine (employers/roles/dates/education/
   service), a curated project shortlist with one-line verified results, a skills
   inventory, and an `UNVERIFIED` list. This is the raw material for Phases 2-3.

## Phase 2 - Review the existing CV

Score `docs/liraz_amir_cv.pdf` against `references/israel-ats-rules.md`. Produce
`cv/gap-report.md` with three buckets - **keep / fix / drop** - covering:

- **ATS format traps:** columns, tables, text boxes, contact info in a header/footer,
  graphics/icons/photo, image-only PDF, file > 2.5 MB, abbreviated job titles.
- **Israeli privacy:** drop birth year, marital/family status, ID number, photo,
  religion, reserve-duty details (not strategically useful and legally awkward).
- **Content quality:** one clear target title under the name; a 2-4 line summary in
  the employer's vocabulary; every bullet as `action + scope + method + metric`;
  keyword alignment to target roles; the whole case-for-interview on page one.

Be concrete - quote the weak line, show the rewrite.

## Phase 3 - Create the new CV

Write `cv/liraz-en.md` and `cv/liraz-he.md` following the **CV markdown contract**
in `references/cv-contract.md` exactly (the exporters parse that structure). Rules:

- **Two separate masters, never interleaved.** English master is fully English;
  Hebrew master is Hebrew with English tech terms kept in their normal spelling
  inside the Skills line, one reading direction per line (`dir: rtl` in front matter).
- One column, standard headings, contact block as plain text at the top (never a
  header/footer). Order: Summary, Experience, Projects, Education, Military Service
  (only if it adds value), Skills, Languages.
- Bullets: `action + scope + method + metric`, full titles/skills spelled out.
- Pull project bullets from the Phase 1 ledger only - verified facts.
- **Tailoring (optional per run):** if the user pastes a target job description,
  extract its titles/tools/domain nouns and re-tune the summary + top of Experience
  to mirror that wording *where true* - never keyword-stuff, never hide text. Keep
  the masters stable; save a tailored copy as `cv/liraz-en-<role>.md` if asked.

### Export

From the repo root, run both exporters on every `.md` CV (masters and tailored):

```
python .claude/skills/cv-builder/scripts/md_to_docx.py cv/general/liraz-en.md
node   .claude/skills/cv-builder/scripts/md_to_pdf.mjs  cv/general/liraz-en.md
```

Each script writes the export next to the source (`cv/general/liraz-en.docx`, etc.).
Loop it over `cv/general/liraz-{en,he}.md` and `cv/<target>/liraz-{en,he}.md`.
Cover letters are prose, not the CV contract - keep them as `.md`/text for pasting
into an email or application field; don't run them through the CV exporters.

### ATS self-test (the guide's "export to TXT and inspect" step)

`md_to_docx.py` prints the DOCX's extracted plain text after generating. Check:
the contact line (phone + email) survives as real text, section order is linear,
and nothing scrambled. PDFs from the HTML renderer are always selectable text
(not images). If the extracted text loses contact info or reorders content, fix
the markdown and re-export.

## References

- `references/israel-ats-rules.md` - the distilled do/don't checklist (Phase 2 scorecard).
- `references/cv-contract.md` - the exact CV markdown structure + EN/HE skeletons.
- `docs/cv_report.md` - full, sourced Israel/ATS guide behind the rules.
