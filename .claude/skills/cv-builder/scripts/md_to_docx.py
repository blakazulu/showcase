#!/usr/bin/env python
"""Convert a CV markdown file (see references/cv-contract.md) to an ATS-safe DOCX.

Usage:
    python md_to_docx.py cv/liraz-en.md            # -> cv/liraz-en.docx
    python md_to_docx.py cv/liraz-he.md out.docx   # explicit output

One column, standard headings, contact block as plain-text paragraphs at the top
(never a Word header/footer), no tables/text boxes/graphics. After writing, it
prints the DOCX's extracted plain text so you can eyeball reading order and confirm
the contact line survived (the guide's "export to TXT and inspect" ATS self-test).
"""
import sys
import os

# Windows consoles default to cp1252; force UTF-8 so the Hebrew self-test dump
# prints instead of crashing.
try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from docx import Document
    from docx.shared import Pt, RGBColor
    from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_TAB_ALIGNMENT
    from docx.oxml.ns import qn
    from docx.oxml import OxmlElement
except ImportError:
    sys.exit(
        "Missing dependency 'python-docx'. Install it with:\n    pip install python-docx"
    )

from cv_parse import parse_cv, AI_TELL_CHARS  # local module next to this script


INK = RGBColor(0x11, 0x18, 0x27)
MUTED = RGBColor(0x6B, 0x72, 0x80)
ACCENT = RGBColor(0x0F, 0x76, 0x6E)
FONT = "Calibri"          # installed everywhere Word runs; Inter/Heebo are PDF-only
FONT_CS = "Arial"         # complex-script (Hebrew) font

PAGE_W, PAGE_H = Pt(595.3), Pt(841.9)   # A4
MARGIN_X, MARGIN_Y = Pt(42.5), Pt(37)   # 15mm / 13mm, same as cv.css
TEXT_W = PAGE_W - 2 * MARGIN_X


def _set_rtl(paragraph):
    """Mark a paragraph (and its runs) right-to-left for Hebrew."""
    pPr = paragraph._p.get_or_add_pPr()
    pPr.append(OxmlElement("w:bidi"))
    for run in paragraph.runs:
        run._r.get_or_add_rPr().append(OxmlElement("w:rtl"))


def _set_page(document):
    for section in document.sections:
        section.page_width, section.page_height = PAGE_W, PAGE_H
        section.left_margin = section.right_margin = MARGIN_X
        section.top_margin = section.bottom_margin = MARGIN_Y


def _para(document, rtl, space_before=0, space_after=2):
    p = document.add_paragraph()
    pf = p.paragraph_format
    pf.space_before = Pt(space_before)
    pf.space_after = Pt(space_after)
    pf.line_spacing = 1.15
    # No explicit alignment for RTL: a w:bidi paragraph already starts at the right,
    # and jc="right" inside a bidi paragraph means "end", which pushes it LEFT.
    return p


def _run(p, text, bold=False, size=10, color=INK):
    r = p.add_run(text)
    r.bold = bold
    r.font.size = Pt(size)
    r.font.name = FONT
    r.font.color.rgb = color
    rPr = r._r.get_or_add_rPr()
    fonts = rPr.find(qn("w:rFonts"))
    if fonts is None:
        fonts = OxmlElement("w:rFonts")
        rPr.insert(0, fonts)
    fonts.set(qn("w:cs"), FONT_CS)
    szcs = OxmlElement("w:szCs")
    szcs.set(qn("w:val"), str(int(size * 2)))
    rPr.append(szcs)
    if bold:
        rPr.append(OxmlElement("w:bCs"))
    return r


def _border(paragraph, side, color, sz, space):
    pPr = paragraph._p.get_or_add_pPr()
    pbdr = pPr.find(qn("w:pBdr"))
    if pbdr is None:
        pbdr = OxmlElement("w:pBdr")
        pPr.append(pbdr)
    el = OxmlElement(f"w:{side}")
    el.set(qn("w:val"), "single")
    el.set(qn("w:sz"), str(sz))
    el.set(qn("w:space"), str(space))
    el.set(qn("w:color"), color)
    pbdr.append(el)


def _end_tab(paragraph):
    """Tab stop at the far edge so a date / result lands flush with the margin."""
    paragraph.paragraph_format.tab_stops.add_tab_stop(TEXT_W, WD_TAB_ALIGNMENT.RIGHT)


def build(cv, out_path):
    rtl = cv["dir"] == "rtl"
    doc = Document()
    doc.styles["Normal"].font.name = FONT
    doc.styles["Normal"].font.size = Pt(10)
    _set_page(doc)
    fm = cv["front"]

    # --- header block (plain-text paragraphs at the top of the body, never a Word header) ---
    p = _para(doc, rtl, space_after=2)
    _run(p, fm.get("name", ""), bold=True, size=26)
    if rtl:
        _set_rtl(p)
    if fm.get("title"):
        p = _para(doc, rtl, space_after=4)
        _run(p, fm["title"], size=12, color=MUTED)
        if rtl:
            _set_rtl(p)
    contact_bits = [b for b in (fm.get("location"), fm.get("phone"), fm.get("email")) if b]
    if contact_bits:
        p = _para(doc, rtl, space_after=1)
        if rtl:
            # LRM before each bit keeps "+972-..." from flipping its "+" in a Hebrew line
            contact_bits = ["‎" + b for b in contact_bits]
        _run(p, "  |  ".join(contact_bits), size=9)
        if rtl:
            _set_rtl(p)
    if cv["links"]:
        p = _para(doc, rtl, space_after=4)
        # URLs stay LTR even in a Hebrew CV; keep "Label: url" so ATS sees the full link
        _run(p, "  |  ".join(f"{lbl}: {url}" for lbl, url in cv["links"]), size=9, color=ACCENT)

    # --- sections ---
    for section in cv["sections"]:
        heading = section["heading"]
        projects = "Projects" in heading or "פרויקטים" in heading
        skills = "Skills" in heading or "מיומנויות" in heading

        p = _para(doc, rtl, space_before=10, space_after=4)
        _run(p, heading, bold=True, size=11.5)
        _border(p, "right" if rtl else "left", "0F766E", 24, 5)
        _border(p, "bottom", "E5E7EB", 6, 2)
        if rtl:
            _set_rtl(p)

        for block in section["blocks"]:
            if block["type"] == "entry":
                fields = list(block["fields"])
                ep = _para(doc, rtl, space_before=5, space_after=0 if projects else 1)
                ep.paragraph_format.keep_with_next = True
                _end_tab(ep)
                if projects:
                    name, tech, result = (fields + ["", "", ""])[:3]
                    _run(ep, name, bold=True, size=10.5)
                    if result:
                        _run(ep, "\t" + result, bold=True, size=9, color=ACCENT)
                    if rtl:
                        _set_rtl(ep)
                    if tech:
                        tp = _para(doc, rtl, space_after=1)
                        tp.paragraph_format.keep_with_next = True
                        _run(tp, tech, size=8.5, color=MUTED)
                        if rtl:
                            _set_rtl(tp)
                else:
                    date = fields.pop() if len(fields) > 1 and any(ch.isdigit() for ch in fields[-1]) and len(fields[-1]) < 20 else ""
                    _run(ep, fields[0], bold=True, size=10.5)
                    if len(fields) > 1:
                        _run(ep, "  |  " + "  |  ".join(fields[1:]), size=10, color=MUTED)
                    if date:
                        _run(ep, "\t" + date, size=9, color=MUTED)
                    if rtl:
                        _set_rtl(ep)
            elif block["type"] == "bullet":
                bp = doc.add_paragraph(style="List Bullet")
                bp.paragraph_format.space_after = Pt(1.5)
                bp.paragraph_format.line_spacing = 1.15
                _run(bp, block["text"], size=10)
                if rtl:
                    _set_rtl(bp)
            elif block["type"] == "para":
                pp = _para(doc, rtl, space_after=2)
                text = block["text"]
                c = text.find(":")
                if skills and 0 < c < 40:
                    # RLM after the colon anchors an English label ("Front-End:") to the right in Hebrew
                    _run(pp, text[: c + 1] + ("‏" if rtl else ""), bold=True, size=10)
                    _run(pp, text[c + 1 :], size=10)
                else:
                    _run(pp, text, size=10)
                if rtl:
                    _set_rtl(pp)

    doc.save(out_path)
    return doc


def self_test_dump(out_path, fm):
    """Re-read the DOCX and print extracted text; flag missing contact info."""
    doc = Document(out_path)
    lines = [p.text for p in doc.paragraphs if p.text.strip()]
    text = "\n".join(lines)
    print("\n----- ATS self-test: extracted DOCX text -----")
    print(text)
    print("----- end extracted text -----")
    missing = []
    for key in ("phone", "email"):
        val = fm.get(key, "")
        if val and val not in text:
            missing.append(f"{key} ({val})")
    if missing:
        print("WARNING: contact info NOT found in extracted text: " + ", ".join(missing))
    else:
        print("OK: contact info present in extracted text.")

    tells = sorted({ch for ch in text if ch in AI_TELL_CHARS})
    if tells:
        print("WARNING: AI-tell characters survived: " + " ".join(f"U+{ord(c):04X}" for c in tells))
    else:
        print("OK: no AI-tell punctuation (plain hyphens/quotes only).")


def main():
    if len(sys.argv) < 2:
        sys.exit("Usage: python md_to_docx.py <cv.md> [out.docx]")
    src = sys.argv[1]
    out = sys.argv[2] if len(sys.argv) > 2 else os.path.splitext(src)[0] + ".docx"
    with open(src, encoding="utf-8") as f:
        cv = parse_cv(f.read())
    build(cv, out)
    print(f"Wrote {out}")
    self_test_dump(out, cv["front"])


if __name__ == "__main__":
    main()
