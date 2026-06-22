import Link from "next/link";
import s from "./ProjectDetail.module.css";
import type { Project } from "@/lib/types";
import { primaryCat, COLORS, fmtDate } from "@/lib/helpers";

export default function ProjectDetail({ project: p }: { project: Project }) {
  const cat = primaryCat(p);
  const status =
    p.vis === "Private"
      ? "Private"
      : p.vis === "Fork"
      ? "Fork"
      : p.vis === "Standalone"
      ? "No repo"
      : p.live
      ? "Live"
      : "Public";

  const statusClass =
    p.vis === "Private"
      ? s.private
      : p.vis === "Fork"
      ? s.fork
      : p.vis === "Standalone"
      ? s.norepo
      : p.live
      ? s.live
      : s.public;

  return (
    <article
      className={s.detail}
      style={{ "--cat": COLORS[cat] } as React.CSSProperties}
    >
      <div className="wrap">
        <Link href="/" className={s.back}>
          ← All projects
        </Link>

        <div className={s.meta}>
          <span className={`${s.status} ${statusClass}`}>
            <span className={s.d} />
            {status}
          </span>
          <span className={s.sep}>/</span>
          <span>{fmtDate(p.date)}</span>
          <span className={s.cat}>{cat}</span>
        </div>

        <h1 className={s.title}>
          <span className={s.ic}>{p.icon}</span>
          {p.name}
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
            <a
              className={s.primary}
              href={p.live}
              target="_blank"
              rel="noopener"
            >
              Live ↗
            </a>
          )}
          {p.github && (
            <a href={p.github} target="_blank" rel="noopener">
              GitHub
            </a>
          )}
          {p.npm && (
            <a
              className={s.npm}
              href={p.npm}
              target="_blank"
              rel="noopener"
            >
              npm
            </a>
          )}
        </div>

        <p className={s.shipped}>Shipped {fmtDate(p.date)}</p>

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
      </div>
    </article>
  );
}
