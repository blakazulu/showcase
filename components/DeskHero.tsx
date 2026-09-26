"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import s from "./DeskHero.module.css";
import { getStats } from "@/lib/helpers";
import { PROJECTS } from "@/lib/projects";
import type { Project } from "@/lib/types";
import type { DeskMode, SlotId } from "@/lib/desk";
import { MODE_LABELS, MODE_ORDER, SLOTS, modeProjects, slotItem } from "@/lib/desk";

const DeskScene = dynamic(() => import("./DeskScene"), { ssr: false });

const stats = getStats(PROJECTS);
const EMPTY_SPINS: Record<SlotId, number> = { monitor: 0, phone: 0, papers: 0, plan: 0, postcard: 0 };

function supportsWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function DeskHero() {
  const [mode, setMode] = useState<DeskMode>("products");
  const [selected, setSelected] = useState<SlotId | null>(null);
  const [spins, setSpins] = useState(EMPTY_SPINS);
  const [webgl, setWebgl] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const regionRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const view = useRef({ scroll: 0 });

  useEffect(() => {
    setWebgl(supportsWebGL());
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const on = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    let raf = 0;
    const measure = () => {
      const el = regionRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = r.height - vh;
      view.current.scroll = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reducedMotion]);

  const openSlot = useCallback((id: SlotId) => {
    setSelected(id);
    setSpins((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
  }, []);

  const close = useCallback(() => setSelected(null), []);

  useEffect(() => {
    if (!selected) return;
    cardRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, close]);

  const scrollToLog = useCallback(() => {
    document.getElementById("log")?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
  }, [reducedMotion]);

  const item = selected ? slotItem(selected) : null;
  const strip: Project[] = useMemo(() => modeProjects(mode), [mode]);

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
          This is my desk. Every object on it is something I built.
        </p>
        <div className={s.actions}>
          <button className={s.primary} onClick={scrollToLog}>
            All {stats.shipped} projects <span aria-hidden="true">↓</span>
          </button>
          <a className={s.ghost} href="https://github.com/blakazulu" target="_blank" rel="noopener">
            GitHub <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>

      <div className={s.region} ref={regionRef} data-motion={reducedMotion ? "off" : "on"}>
        <div className={s.stage}>
          <div className={s.canvasWrap} aria-hidden="true">
            {webgl ? (
              <DeskScene mode={mode} reducedMotion={reducedMotion} spins={spins} view={view} onSelect={openSlot} />
            ) : (
              <img
                className={s.poster}
                src="/textures/desk-poster.jpg"
                alt=""
                loading="lazy"
                decoding="async"
              />
            )}
          </div>

          <div className={s.hud}>
            <div className={s.modeRow} role="group" aria-label="Desk mode">
              {MODE_ORDER.map((m) => (
                <button
                  key={m}
                  className={`${s.modeBtn} ${m === mode ? s.modeOn : ""}`}
                  aria-pressed={m === mode}
                  onClick={() => setMode(m)}
                >
                  {MODE_LABELS[m]}
                </button>
              ))}
            </div>

            <div className={s.strip} aria-label={`${MODE_LABELS[mode]} on the list`}>
              {strip.map((p) => (
                <a key={p.slug} className={s.chip} href={`/projects/${p.slug}/`}>
                  {p.name}
                </a>
              ))}
            </div>

            <div className={s.objects} role="group" aria-label="Objects on the desk">
              {SLOTS.map((slot) => (
                <button key={slot.id} className={s.objBtn} onClick={() => openSlot(slot.id)}>
                  <span className={s.objLabel}>{slot.label}</span>
                  <span className={s.objName}>{slot.item.name}</span>
                </button>
              ))}
            </div>

            <button className={s.listBtn} onClick={scrollToLog}>
              Browse the full list <span aria-hidden="true">↓</span>
            </button>
          </div>

          {webgl && !reducedMotion && (
            <p className={s.hint} aria-hidden="true">
              scroll to lean in · click an object
            </p>
          )}

          {item && (
            <div className={s.cardBackdrop} onClick={close}>
              <div
                className={s.card}
                role="dialog"
                aria-modal="false"
                aria-label={item.name}
                tabIndex={-1}
                ref={cardRef}
                onClick={(e) => e.stopPropagation()}
              >
                <button className={s.cardClose} onClick={close} aria-label="Close">
                  ×
                </button>
                <span className={s.cardKicker}>{SLOTS.find((x) => x.id === selected)?.label}</span>
                <h2 className={s.cardName}>{item.name}</h2>
                <p className={s.cardTagline}>{item.tagline}</p>
                <p className={s.cardShort}>{item.short}</p>
                <div className={s.cardLinks}>
                  {item.project && (
                    <a className={s.cardPrimary} href={`/projects/${item.project.slug}/`}>
                      Full story <span aria-hidden="true">→</span>
                    </a>
                  )}
                  {item.live && (
                    <a href={item.live} target="_blank" rel="noopener">
                      live <span aria-hidden="true">↗</span>
                    </a>
                  )}
                  {item.github && (
                    <a href={item.github} target="_blank" rel="noopener">
                      github <span aria-hidden="true">↗</span>
                    </a>
                  )}
                  {item.project?.play && (
                    <a href={item.project.play} target="_blank" rel="noopener">
                      play <span aria-hidden="true">↗</span>
                    </a>
                  )}
                  {item.project?.store && (
                    <a href={item.project.store} target="_blank" rel="noopener">
                      store <span aria-hidden="true">↗</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
