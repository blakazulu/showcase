"""Parser for the CV markdown contract (references/cv-contract.md).

parse_cv(text) -> {
    "front":    {name, title, location, phone, email, lang, dir, ...},
    "links":    [(label, url), ...],
    "sections": [ {heading, blocks: [ {type, ...} ]}, ... ],
    "dir":      "ltr" | "rtl",
}

Block types: {"type": "entry", "fields": [...]}, {"type": "bullet", "text": str},
{"type": "para", "text": str}. Kept dependency-free (no YAML lib) so DOCX export
needs only python-docx.

Text is normalized on parse: em/en dashes, curly quotes, ellipsis chars and
exotic spaces become plain ASCII so exports read as human-written and don't trip
AI-detection tools.
"""

SEP = " | "

# code point -> replacement. Only \u escapes here (never literal special chars,
# which get mangled by editors/round-trips).
_NORMALIZE = {
    # dashes -> hyphen
    0x2014: "-", 0x2013: "-", 0x2015: "-", 0x2012: "-", 0x2212: "-",
    # single quotes / prime -> straight apostrophe
    0x2018: "'", 0x2019: "'", 0x201A: "'", 0x201B: "'", 0x2032: "'",
    # double quotes / double prime -> straight quote
    0x201C: '"', 0x201D: '"', 0x201E: '"', 0x201F: '"', 0x2033: '"',
    # ellipsis -> three dots
    0x2026: "...",
    # exotic spaces -> normal space
    0x00A0: " ", 0x2007: " ", 0x2008: " ", 0x2009: " ", 0x200A: " ",
    0x2002: " ", 0x2003: " ", 0x2004: " ", 0x2005: " ", 0x2006: " ",
    0x202F: " ", 0x205F: " ", 0x3000: " ",
    # zero-width junk -> removed
    0x200B: "", 0xFEFF: "", 0x2060: "",
}

# characters that must never survive into an export (post-hoc verification)
AI_TELL_CHARS = "".join(chr(c) for c in _NORMALIZE if _NORMALIZE[c] != " ")


def normalize_text(s):
    """Replace AI-tell punctuation with plain ASCII equivalents."""
    return s.translate(_NORMALIZE)


def parse_cv(text):
    text = normalize_text(text)
    lines = text.replace("\r\n", "\n").replace("\r", "\n").split("\n")

    front = {}
    i = 0
    # front matter: optional leading blank lines, then --- ... ---
    while i < len(lines) and lines[i].strip() == "":
        i += 1
    if i < len(lines) and lines[i].strip() == "---":
        i += 1
        while i < len(lines) and lines[i].strip() != "---":
            raw = lines[i]
            if ":" in raw:
                key, _, val = raw.partition(":")
                front[key.strip().lower()] = val.strip()
            i += 1
        i += 1  # skip closing ---

    links = []
    if front.get("links"):
        for pair in front["links"].split(SEP):
            pair = pair.strip()
            if not pair:
                continue
            if "=" in pair:
                lbl, _, url = pair.partition("=")
                links.append((lbl.strip(), url.strip()))
            else:
                links.append((pair, pair))

    direction = (front.get("dir") or "ltr").lower()
    if direction not in ("ltr", "rtl"):
        direction = "ltr"

    sections = []
    current = None
    para_buf = []

    def flush_para():
        if para_buf and current is not None:
            current["blocks"].append({"type": "para", "text": " ".join(para_buf).strip()})
        para_buf.clear()

    for raw in lines[i:]:
        line = raw.rstrip()
        stripped = line.strip()

        if stripped.startswith("## "):
            flush_para()
            current = {"heading": stripped[3:].strip(), "blocks": []}
            sections.append(current)
        elif stripped.startswith("### "):
            flush_para()
            if current is None:
                current = {"heading": "", "blocks": []}
                sections.append(current)
            fields = [f.strip() for f in stripped[4:].split(SEP) if f.strip()]
            current["blocks"].append({"type": "entry", "fields": fields})
        elif stripped.startswith("- "):
            flush_para()
            if current is None:
                current = {"heading": "", "blocks": []}
                sections.append(current)
            current["blocks"].append({"type": "bullet", "text": stripped[2:].strip()})
        elif stripped == "":
            flush_para()
        else:
            if current is None:
                current = {"heading": "", "blocks": []}
                sections.append(current)
            para_buf.append(stripped)
    flush_para()

    return {"front": front, "links": links, "sections": sections, "dir": direction}
