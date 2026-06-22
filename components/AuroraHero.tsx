"use client";
import { useCallback } from "react";
import s from "./AuroraHero.module.css";
import TypeText from "./TypeText";
import { getStats } from "@/lib/helpers";
import { PROJECTS } from "@/lib/projects";

const stats = getStats(PROJECTS);

export default function AuroraHero() {
  const scrollToLog = useCallback(() => {
    document.getElementById("log")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <header className={s.hero}>
      <div className={`wrap ${s.copy}`}>
        <span className={s.eyebrow}>
          <span className={s.dot} /> Liraz Amir · builder &amp; shipper
        </span>
        <h1 className={s.title}>
          I ship <span className={s.grad}>real products.</span>
        </h1>
        <p className={s.lede}>
          {stats.shipped} deployed apps across AI, developer tooling, browser
          extensions and learning platforms — designed, built and run end to end.
          Most of it live right now.
        </p>
        <div className={s.actions}>
          <button className={s.primary} onClick={scrollToLog}>
            See the work <span aria-hidden="true">↓</span>
          </button>
          <a
            className={s.ghost}
            href="https://github.com/blakazulu"
            target="_blank"
            rel="noopener"
          >
            GitHub <span aria-hidden="true">↗</span>
          </a>
        </div>

        <div className={s.prompt} aria-hidden="true">
          <span className={s.pr}>$</span>{" "}
          <span className={s.cmd}>
            <TypeText text="liraz --projects --status=live" />
          </span>
          <span className={s.cursor} />
        </div>
      </div>
    </header>
  );
}
