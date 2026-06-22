import Link from "next/link";
import s from "./ProjectCard.module.css";
import type { Project } from "@/lib/types";
import { primaryCat, COLORS, fmtDate } from "@/lib/helpers";

function statusInfo(p: Project): [string, string] {
  if (p.vis === "Private") return ["private", "Private"];
  if (p.vis === "Fork") return ["fork", "Fork"];
  if (p.vis === "Standalone") return ["norepo", "No repo"];
  return ["live", p.live ? "Live" : "Public"];
}

export default function ProjectCard({ project: p }: { project: Project }) {
  const cat = primaryCat(p);
  const [sc, sl] = statusInfo(p);
  return (
    <article className={s.card} id={p.slug} style={{ "--cat": COLORS[cat] } as React.CSSProperties}>
      <div className={s.meta}>
        <span className={`${s.status} ${s[sc]}`}><span className={s.d} />{sl}</span>
        <span className={s.sep}>/</span><span>{fmtDate(p.date)}</span>
        <span className={s.cat}>{cat}</span>
      </div>
      <div className={s.head}>
        <div className={s.ic}>{p.icon}</div>
        <div>
          <h3><Link href={`/projects/${p.slug}`}>{p.name}</Link></h3>
          <div className={s.tagline}>{p.tagline}</div>
        </div>
      </div>
      <p className={s.desc}>{p.desc}</p>
      <div className={s.stack}>{p.tech.map((t) => <span key={t}>{t}</span>)}</div>
      <div className={s.links}>
        {p.live && <a className={s.primary} href={p.live} target="_blank" rel="noopener">Live ↗</a>}
        {p.github && <a href={p.github} target="_blank" rel="noopener">GitHub</a>}
        {p.npm && <a className={s.npm} href={p.npm} target="_blank" rel="noopener">npm</a>}
      </div>
    </article>
  );
}
