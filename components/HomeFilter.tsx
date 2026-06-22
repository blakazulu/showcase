"use client";
import { useMemo, useState } from "react";
import s from "./HomeFilter.module.css";
import ProjectGrid from "./ProjectGrid";
import { PROJECTS } from "@/lib/projects";
import { sortByDateDesc, LANE_ORDER, getStats } from "@/lib/helpers";

const CATS = ["All", ...LANE_ORDER];
const stats = getStats(PROJECTS);

export default function HomeFilter() {
  const [active, setActive] = useState("All");
  const display = useMemo(() => sortByDateDesc(PROJECTS), []);
  const list = useMemo(
    () => display.filter((p) => active === "All" || p.cats.includes(active as never)),
    [active, display]
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
              <span><b>{stats.shipped}</b> shipped</span>
              <span><b>{stats.live}</b> live</span>
              <span><b>{stats.ai}</b> AI</span>
              <span><b>{stats.npm}</b> npm</span>
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

            <ProjectGrid projects={list} />
          </div>
        </div>
      </div>
    </section>
  );
}
