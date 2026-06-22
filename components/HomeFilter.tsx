"use client";
import { useEffect, useMemo, useState } from "react";
import s from "./HomeFilter.module.css";
import ProjectList from "./ProjectList";
import CountUp from "./CountUp";
import { PROJECTS } from "@/lib/projects";
import { sortByDateDesc, LANE_ORDER, getStats } from "@/lib/helpers";

const CATS = ["All", ...LANE_ORDER];
const stats = getStats(PROJECTS);

export default function HomeFilter() {
  const [active, setActive] = useState("All");
  // Deterministic order for SSR/first paint (kept hidden), then randomized on
  // the client before reveal — so visitors see a fresh random order from load
  // (and a fresh "featured" tile) with no visible re-shuffle, and no hydration
  // mismatch.
  const [ordered, setOrdered] = useState(() => sortByDateDesc(PROJECTS));
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const a = [...PROJECTS];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    setOrdered(a);
    setReady(true);
  }, []);
  const list = useMemo(
    () => ordered.filter((p) => active === "All" || p.cats.includes(active as never)),
    [active, ordered]
  );

  const flag = active === "All" ? "--all" : `--cat=${active.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <section className={s.section} id="log">
      <div className="wrap">
        <div className={s.window}>
          <header className={s.bar}>
            <span className={s.lights}>
              <i className={s.r} /><i className={s.y} /><i className={s.g} />
            </span>
            <span className={s.path}>liraz@portfolio: ~/projects</span>
            <span className={s.kpis}>
              <span><b><CountUp to={stats.shipped} /></b> shipped</span>
              <span><b><CountUp to={stats.live} /></b> live</span>
              <span><b><CountUp to={stats.ai} /></b> AI</span>
              <span><b><CountUp to={stats.npm} /></b> npm</span>
            </span>
          </header>

          <div className={s.body}>
            <p className={s.cmd}>
              <span className={s.pr}>$</span> liraz <span className={s.fl}>--projects</span>{" "}
              <span className={s.fl}>{flag}</span> <span className={s.fl}>--sort=newest</span>
            </p>
            <p className={s.out}>
              › {list.length} project{list.length === 1 ? "" : "s"} ·{" "}
              {list.filter((p) => p.live).length} live — rendering log
            </p>

            <div className={s.chips} role="group" aria-label="Filter projects by category">
              {CATS.map((c) => (
                <button
                  key={c}
                  className={`${s.chip} ${c === active ? s.on : ""}`}
                  aria-pressed={c === active}
                  onClick={() => setActive(c)}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className={`grid-reveal ${ready ? "is-ready" : ""}`}>
              <ProjectList projects={list} />
            </div>
            <noscript>
              <style>{`.grid-reveal{opacity:1 !important}`}</style>
            </noscript>
          </div>
        </div>
      </div>
    </section>
  );
}
