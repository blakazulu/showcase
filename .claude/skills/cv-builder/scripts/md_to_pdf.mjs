#!/usr/bin/env node
/**
 * Convert a CV markdown file (see references/cv-contract.md) to an ATS-safe,
 * selectable-text PDF by rendering clean one-column HTML through the repo's
 * existing Playwright/Chromium.
 *
 * Usage (from repo root):
 *   node .claude/skills/cv-builder/scripts/md_to_pdf.mjs cv/general/liraz-en.md
 *   node .claude/skills/cv-builder/scripts/md_to_pdf.mjs cv/general/liraz-he.md out.pdf
 */
import { readFileSync } from "node:fs";
import { dirname, join, resolve, basename } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SEP = " | ";

// Replace AI-tell punctuation (em/en dashes, curly quotes, ellipsis, exotic
// spaces, zero-width junk) with plain ASCII so the PDF reads as human-written.
// Only \u escapes here - never literal special chars (editors mangle them).
const NORMALIZE = [
  [/[—–―‒−]/g, "-"],
  [/[‘’‚‛′]/g, "'"],
  [/[“”„‟″]/g, '"'],
  [/…/g, "..."],
  [/[            　]/g, " "],
  [/[​﻿⁠]/g, ""],
];
function normalizeText(s) {
  for (const [re, rep] of NORMALIZE) s = s.replace(re, rep);
  return s;
}

function parseCv(text) {
  text = normalizeText(text);
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  const front = {};
  let i = 0;
  while (i < lines.length && lines[i].trim() === "") i++;
  if (i < lines.length && lines[i].trim() === "---") {
    i++;
    while (i < lines.length && lines[i].trim() !== "---") {
      const raw = lines[i];
      const c = raw.indexOf(":");
      if (c !== -1) front[raw.slice(0, c).trim().toLowerCase()] = raw.slice(c + 1).trim();
      i++;
    }
    i++; // closing ---
  }

  const links = [];
  if (front.links) {
    for (const pair of front.links.split(SEP)) {
      const p = pair.trim();
      if (!p) continue;
      const eq = p.indexOf("=");
      if (eq !== -1) links.push([p.slice(0, eq).trim(), p.slice(eq + 1).trim()]);
      else links.push([p, p]);
    }
  }

  let dir = (front.dir || "ltr").toLowerCase();
  if (dir !== "ltr" && dir !== "rtl") dir = "ltr";

  const sections = [];
  let current = null;
  let paraBuf = [];
  const ensure = () => {
    if (!current) {
      current = { heading: "", blocks: [] };
      sections.push(current);
    }
  };
  const flush = () => {
    if (paraBuf.length && current) current.blocks.push({ type: "para", text: paraBuf.join(" ").trim() });
    paraBuf = [];
  };

  for (const raw of lines.slice(i)) {
    const s = raw.trim();
    if (s.startsWith("## ")) {
      flush();
      current = { heading: s.slice(3).trim(), blocks: [] };
      sections.push(current);
    } else if (s.startsWith("### ")) {
      flush();
      ensure();
      current.blocks.push({ type: "entry", fields: s.slice(4).split(SEP).map((f) => f.trim()).filter(Boolean) });
    } else if (s.startsWith("- ")) {
      flush();
      ensure();
      current.blocks.push({ type: "bullet", text: s.slice(2).trim() });
    } else if (s === "") {
      flush();
    } else {
      ensure();
      paraBuf.push(s);
    }
  }
  flush();

  return { front, links, sections, dir };
}

const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

function renderHtml(cv, css) {
  const { front, links, sections, dir } = cv;
  const contact = [front.location, front.phone, front.email].filter(Boolean).map(esc).join("  |  ");
  const linkHtml = links
    .map(([lbl, url]) => `<a href="${esc(url)}">${esc(lbl)}: ${esc(url)}</a>`)
    .join("  |  ");

  const sectionHtml = sections
    .map((section) => {
      const blocks = [];
      let bulletOpen = false;
      const closeBullets = () => {
        if (bulletOpen) {
          blocks.push("</ul>");
          bulletOpen = false;
        }
      };
      for (const b of section.blocks) {
        if (b.type === "entry") {
          closeBullets();
          const [first, ...rest] = b.fields;
          const restHtml = rest.length ? ` <span class="rest">${SEP.trim()} ${rest.map(esc).join("  |  ")}</span>` : "";
          blocks.push(`<div class="entry"><div class="entry-head"><span class="primary">${esc(first)}</span>${restHtml}</div></div>`);
        } else if (b.type === "bullet") {
          if (!bulletOpen) {
            blocks.push('<ul class="bullets">');
            bulletOpen = true;
          }
          blocks.push(`<li>${esc(b.text)}</li>`);
        } else if (b.type === "para") {
          closeBullets();
          blocks.push(`<p class="para">${esc(b.text)}</p>`);
        }
      }
      closeBullets();
      const head = section.heading ? `<div class="section-heading">${esc(section.heading)}</div>` : "";
      return `<div class="section">${head}${blocks.join("")}</div>`;
    })
    .join("");

  return `<!doctype html>
<html dir="${dir}" lang="${esc(front.lang || (dir === "rtl" ? "he" : "en"))}">
<head><meta charset="utf-8"><style>${css}</style></head>
<body><div class="cv">
  <div class="name">${esc(front.name || "")}</div>
  ${front.title ? `<div class="title">${esc(front.title)}</div>` : ""}
  ${contact ? `<div class="contact">${contact}</div>` : ""}
  ${linkHtml ? `<div class="links">${linkHtml}</div>` : ""}
  ${sectionHtml}
</div></body></html>`;
}

async function loadChromium() {
  try {
    return (await import("playwright")).chromium;
  } catch {
    try {
      return (await import("playwright-core")).chromium;
    } catch {
      console.error(
        "Could not import Playwright. Run this from the repo root so node_modules resolves,\n" +
          "and ensure Chromium is installed (npx playwright install chromium)."
      );
      process.exit(1);
    }
  }
}

async function main() {
  const src = process.argv[2];
  if (!src) {
    console.error("Usage: node md_to_pdf.mjs <cv.md> [out.pdf]");
    process.exit(1);
  }
  const out = process.argv[3] || src.replace(/\.md$/i, "") + ".pdf";
  const cv = parseCv(readFileSync(resolve(src), "utf-8"));
  const css = readFileSync(join(__dirname, "..", "assets", "cv.css"), "utf-8");
  const html = renderHtml(cv, css);

  const chromium = await loadChromium();
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle" });
    await page.pdf({
      path: resolve(out),
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
    });
  } finally {
    await browser.close();
  }
  console.log(`Wrote ${out} (selectable-text PDF from ${basename(src)})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
