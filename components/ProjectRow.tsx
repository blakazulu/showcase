// components/ProjectRow.tsx
import Link from "next/link";
import s from "./ProjectRow.module.css";
import type { Project } from "@/lib/types";
import { primaryCat, COLORS, fmtDate } from "@/lib/helpers";

// Decorative CI flavor — not a factual claim about any project's pipeline.
const STEPS: ReadonlyArray<readonly [string, string]> = [
  ["resolving project graph", "0.4s"],
  ["installing dependencies", "3.1s"],
  ["compiling build", "6.2s"],
  ["optimizing assets", "1.8s"],
  ["publishing to edge", "0.9s"],
];

// status class + visible label (same status rule used on the detail page).
function statusInfo(p: Project): [string, string] {
  if (p.vis === "Private") return ["private", "Private"];
  if (p.vis === "Fork") return ["fork", "Fork"];
  if (p.vis === "Standalone") return ["norepo", "No repo"];
  return p.live ? ["live", "Live"] : ["public", "Public"];
}
const GLYPH: Record<string, string> = { live: "●", public: "○", fork: "⑂", norepo: "◇" };

export default function ProjectRow({
  project: p,
  open = false,
}: {
  project: Project;
  open?: boolean;
}) {
  const cat = primaryCat(p);
  const [sc, sl] = statusInfo(p);
  const showStatus = p.vis !== "Private";
  return (
    <article className={s.row} style={{ "--cat": COLORS[cat] } as React.CSSProperties}>
      <details name="projects" open={open}>
        <summary className={s.summary}>
          <span className={s.tri} aria-hidden>▸</span>
          <span className={`${s.glyph} ${showStatus ? s[sc] : ""}`} aria-hidden>
            {showStatus ? GLYPH[sc] : ""}
          </span>
          <span className={s.name}>
            {p.name}
            {showStatus && <span className={s.status}> {sl}</span>}
          </span>
          <span className={s.tech}>{p.tech.slice(0, 3).join(" · ")}</span>
          <span className={s.date}>{fmtDate(p.date)}</span>
        </summary>

        <div className={s.panel}>
          <ul className={s.steps} aria-hidden>
            {STEPS.map(([label, dur]) => (
              <li key={label} className={s.step}>
                <span className={s.ck}>✓</span>
                {label}
                <span className={s.dur}>{dur}</span>
              </li>
            ))}
          </ul>
          <p className={s.tagline}>{p.tagline}</p>
          <p className={s.desc}>{p.desc}</p>
          <div className={s.links}>
            <Link className={s.open} href={`/projects/${p.slug}`}>open ↗</Link>
            {p.live && <a href={p.live} target="_blank" rel="noopener">live ↗</a>}
            {p.github && <a href={p.github} target="_blank" rel="noopener">github</a>}
            {p.npm && <a className={s.npm} href={p.npm} target="_blank" rel="noopener">npm</a>}
            {p.play && <a className={s.play} href={p.play} target="_blank" rel="noopener">play ↗</a>}
            {p.store && <a className={s.store} href={p.store} target="_blank" rel="noopener">store ↗</a>}
          </div>
        </div>
      </details>
    </article>
  );
}
