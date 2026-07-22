# CV markdown contract

`cv/liraz-en.md` and `cv/liraz-he.md` MUST follow this structure exactly. Both
exporters (`md_to_docx.py`, `md_to_pdf.mjs`) parse it deterministically - deviating
breaks the export. It is intentionally plain: no YAML library needed, no tables,
no columns.

## Structure

```
---
name: Liraz Amir
title: Full-Stack Engineer
location: Tel Aviv
phone: +972-5X-XXX-XXXX
email: name@example.com
links: LinkedIn=https://linkedin.com/in/xxx | GitHub=https://github.com/blakazulu | Portfolio=https://sbz-showcase.netlify.app
lang: en
dir: ltr
---

## Summary
Two to four lines of plain prose in the target role's vocabulary. Consecutive
non-blank lines join into one paragraph; a blank line starts a new paragraph.

## Experience
### Company Name | Role Title | 2023-Present | Tel Aviv
- Action + scope + method + metric.
- Second achievement bullet.

### Previous Company | Role Title | 2020-2023
- Achievement bullet.

## Projects
### Project Name | Tech, Stack, List | one-line verified result
- Optional supporting bullet.

## Education
### B.Sc. Computer Science | Tel Aviv University | 2019

## Military Service
- One or two civilianized lines. Omit the whole section if it adds nothing.

## Skills
Languages: TypeScript, Python | Frontend: React, Next.js | Cloud: Google Cloud, Netlify

## Languages
Hebrew (native) | English (fluent)
```

## Parsing rules (both exporters implement these identically)

- **Front matter:** the file opens with a `---` line, then `key: value` lines, then a
  closing `---`. Recognized keys: `name`, `title`, `location`, `phone`, `email`,
  `links`, `lang`, `dir`.
  - `links` value is `Label=URL` pairs separated by ` | ` (space-pipe-space).
  - `dir` is `ltr` (default) or `rtl`. `rtl` triggers right-to-left rendering.
- **`## Heading`** starts a section. **`### a | b | c`** is an entry; fields are split
  on ` | ` (space-pipe-space). **`- text`** is a bullet. Any other non-blank line is
  paragraph text; a blank line ends the paragraph.
- **Header block** (name/title/contact/links) renders from front matter as plain-text
  paragraphs at the very top - never a Word header/footer.
- **Entry line** renders as: first field bold, remaining fields normal, joined with
  ` | `. Bullets follow beneath it.
- **Prose sections** (Summary, Skills, Languages) render their lines as paragraphs;
  the ` | ` separators stay inline.

## Hard style rules

- **Plain ASCII punctuation only - the CV must read as human-written.** No em-dashes
  or en-dashes anywhere, including date ranges (`2023-Present`, `2020-2023` with a
  plain hyphen). No curly/smart quotes - use straight `"` and `'`. No ellipsis glyph -
  type `...`. No non-breaking or exotic spaces. The exporters normalize all of these
  automatically and the DOCX self-test flags any survivor, but author clean source.
- **No emojis.**
- Hebrew master: `lang: he`, `dir: rtl`. Keep English tech terms in normal spelling
  inside the `## Skills` line. One reading direction per line - do not mix an RTL
  sentence and an LTR clause on the same line.
- Keep contact to what's operationally useful: name, title, city, phone, email, and
  current recruiter-safe links. No birth year, marital status, ID number, or photo.

## Minimal valid example

```
---
name: Test Person
title: Software Engineer
location: Tel Aviv
phone: +972-50-000-0000
email: test@example.com
links: GitHub=https://github.com/x
lang: en
dir: ltr
---

## Summary
Engineer who ships.

## Experience
### Acme | Engineer | 2022-Present
- Built a thing that did a measurable thing.

## Skills
Languages: TypeScript | Tools: Git
```
