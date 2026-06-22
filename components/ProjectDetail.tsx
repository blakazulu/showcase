import Link from "next/link";
import s from "./ProjectDetail.module.css";
import ProjectCard from "./ProjectCard";
import ProjectIcon from "./ProjectIcon";
import MagicRingsLayer from "./MagicRingsLayer";
import type { Project } from "@/lib/types";
import { PROJECTS } from "@/lib/projects";
import { primaryCat, COLORS, fmtDate, sortByDateDesc } from "@/lib/helpers";

function statusLabel(p: Project): [string, string] {
  if (p.vis === "Private") return ["private", "Private"];
  if (p.vis === "Fork") return ["fork", "Fork"];
  if (p.vis === "Standalone") return ["norepo", "No repo"];
  return p.live ? ["live", "Live"] : ["public", "Public"];
}

export default function ProjectDetail({ project: p }: { project: Project }) {
  const cat = primaryCat(p);
  const [sc, sl] = statusLabel(p);
  const related = sortByDateDesc(
    PROJECTS.filter((x) => x.slug !== p.slug && primaryCat(x) === cat)
  ).slice(0, 3);

  return (
    <article className={s.detail} style={{ "--cat": COLORS[cat] } as React.CSSProperties}>
      <div className={s.glow} aria-hidden="true" />
      <MagicRingsLayer color={COLORS[cat]} />

      <div className="wrap">
        <Link href="/" className={s.back}>
          <span className={s.pr}>$</span> cd ~/projects
        </Link>

        <div className={s.meta}>
          {p.vis !== "Private" && (
            <>
              <span className={`${s.status} ${s[sc]}`}>
                <span className={s.d} />
                {sl}
              </span>
              <span className={s.sep}>/</span>
            </>
          )}
          <span>{fmtDate(p.date)}</span>
          <span className={s.cat}>{cat}</span>
          {p.play && <span className={s.android}>Android app</span>}
        </div>

        <h1 className={s.title}>
          <span className={s.ic} aria-hidden="true"><ProjectIcon slug={p.slug} size={30} /></span>
          <span className={s.grad}>{p.name}</span>
        </h1>

        <p className={s.tagline}>{p.tagline}</p>
        <p className={s.desc}>{p.desc}</p>

        <div className={s.stack}>
          {p.tech.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>

        <div className={s.links}>
          {p.live && (
            <a className={s.primary} href={p.live} target="_blank" rel="noopener">
              visit live ↗
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
              Google Play ↗
            </a>
          )}
        </div>

        <p className={s.shipped}>
          <span className={s.pr}>›</span> shipped {fmtDate(p.date)} ·{" "}
          {p.vis === "Public" ? "open source" : sl.toLowerCase()}
        </p>

        {p.highlights && p.highlights.length > 0 && (
          <section className={s.section}>
            <h2>Highlights</h2>
            <ul>
              {p.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          </section>
        )}

        {p.screenshots && p.screenshots.length > 0 && (
          <section className={s.section}>
            <h2>Screenshots</h2>
            <div className={s.screenshots}>
              {p.screenshots.map((src) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={src} src={src} alt={`${p.name} screenshot`} loading="lazy" />
              ))}
            </div>
          </section>
        )}

        {related.length > 0 && (
          <section className={s.related}>
            <p className={s.kicker}>// related — more {cat.toLowerCase()}</p>
            <div className={s.relgrid}>
              {related.map((r) => (
                <ProjectCard key={r.slug} project={r} />
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
