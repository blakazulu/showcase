"use client";
import Link from "next/link";
import s from "./ProjectCard.module.css";
import ProjectIcon from "./ProjectIcon";
import type { Project } from "@/lib/types";
import { primaryCat, COLORS, fmtDate } from "@/lib/helpers";

// Magic-Bento-style cursor spotlight: track the pointer position as CSS vars
// so the tile's radial glow (::after) follows the cursor.
function onSpotlightMove(e: React.MouseEvent<HTMLElement>) {
  const t = e.currentTarget;
  const r = t.getBoundingClientRect();
  t.style.setProperty("--mx", `${e.clientX - r.left}px`);
  t.style.setProperty("--my", `${e.clientY - r.top}px`);
}

function statusInfo(p: Project): [string, string] {
  if (p.vis === "Private") return ["private", "Private"];
  if (p.vis === "Fork") return ["fork", "Fork"];
  if (p.vis === "Standalone") return ["norepo", "No repo"];
  return p.live ? ["live", "Live"] : ["public", "Public"];
}

export default function ProjectCard({
  project: p,
  featured = false,
}: {
  project: Project;
  featured?: boolean;
}) {
  const cat = primaryCat(p);
  const [sc, sl] = statusInfo(p);
  return (
    <article
      className={`${s.tile} ${featured ? s.featured : ""}`}
      id={p.slug}
      onMouseMove={onSpotlightMove}
      style={{ "--cat": COLORS[cat] } as React.CSSProperties}
    >
      <div className={s.top}>
        {p.vis !== "Private" && (
          <span className={`${s.status} ${s[sc]}`}>
            <span className={s.d} />
            {sl}
          </span>
        )}
        <span className={s.badges}>
          {p.play && <span className={s.android}>Android app</span>}
          <span className={s.cat}>{cat}</span>
        </span>
      </div>

      <div className={s.body}>
        <h3 className={s.name}>
          <Link href={`/projects/${p.slug}`}>
            <span className={s.ic}><ProjectIcon slug={p.slug} size={featured ? 26 : 22} /></span>
            {p.name}
          </Link>
        </h3>
        <p className={s.tagline}>{p.tagline}</p>
        {p.short && <p className={s.short}>{p.short}</p>}
        {featured && <p className={s.desc}>{p.desc}</p>}
      </div>

      <div className={s.stack}>
        {(featured ? p.tech : p.tech.slice(0, 4)).map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>

      <div className={s.foot}>
        <span className={s.date}>{fmtDate(p.date)}</span>
        <div className={s.links}>
          {p.live && (
            <a className={s.primary} href={p.live} target="_blank" rel="noopener">
              live ↗
            </a>
          )}
          {p.github && (
            <a href={p.github} target="_blank" rel="noopener">
              github
            </a>
          )}
          {p.npm && (
            <a className={s.npm} href={p.npm} target="_blank" rel="noopener">
              npm
            </a>
          )}
          {p.play && (
            <a className={s.play} href={p.play} target="_blank" rel="noopener">
              play ↗
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
