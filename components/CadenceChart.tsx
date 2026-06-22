"use client";
import { useEffect, useMemo, useState } from "react";
import s from "./CadenceChart.module.css";
import { PROJECTS } from "@/lib/projects";
import { primaryCat, COLORS, LANE_ORDER, fmtDate } from "@/lib/helpers";

const MON = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
const LANE = 26;

export default function CadenceChart() {
  const [tip, setTip] = useState<{ x:string; y:number; text:string } | null>(null);
  const [mounted, setMounted] = useState(false);

  const model = useMemo(() => {
    const dated = PROJECTS.filter((p) => p.date);
    const times = dated.map((p) => Date.parse(p.date!));
    const pad = 14 * 864e5;
    const t0 = Math.min(...times) - pad, t1 = Math.max(...times) + pad;
    const pct = (t: number) => ((t - t0) / (t1 - t0)) * 100;

    const months: { x: number; label: string }[] = [];
    const d0 = new Date(t0), d1 = new Date(t1);
    let y = d0.getFullYear(), m = d0.getMonth();
    while (y < d1.getFullYear() || (y === d1.getFullYear() && m <= d1.getMonth())) {
      const x = pct(Date.UTC(y, m, 1));
      if (x >= 0 && x <= 100) months.push({ x, label: MON[m] + (m === 0 ? " '" + String(y).slice(2) : "") });
      m++; if (m > 11) { m = 0; y++; }
    }

    const order = [...dated].sort((a, b) => Date.parse(a.date!) - Date.parse(b.date!));
    const dots = order.map((p, i) => ({
      slug: p.slug, name: p.name, date: p.date!, color: COLORS[primaryCat(p)],
      x: pct(Date.parse(p.date!)), lane: LANE_ORDER.indexOf(primaryCat(p)), i,
    }));
    const undated = PROJECTS.filter((p) => !p.date).map((p) => p.name);
    const foot = `${dated.length} tracked deploys · earliest ${fmtDate(order[0].date)} → latest ${fmtDate(order[order.length-1].date)}`
      + (undated.length ? `  ·  + ${undated.length} shipped to npm / source without a tracked deploy date (${undated.join(", ")})` : "");
    return { months, dots, foot };
  }, []);

  useEffect(() => { setMounted(true); }, []);
  const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function jumpTo(slug: string) {
    const el = document.getElementById(slug);
    if (!el) return;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash");
  }

  return (
    <section className={s.cadence} aria-label="Deploy cadence over time">
      <div className={s["cadence-head"]}>
        <span className={s.lbl}>Deploy cadence</span>
        <span className={s.note}>each dot = a production deploy · placed by date, grouped by domain</span>
      </div>
      <div className={s.scroll}>
        <div className={s.cgrid}>
          <div className={s["lane-labels"]}>
            {LANE_ORDER.map((c) => <div key={c} style={{ color: COLORS[c] }}>{c}</div>)}
          </div>
          <div className={s.plot} style={{ height: LANE_ORDER.length * LANE }}>
            {model.months.map((mo, i) => <div key={`g${i}`} className={s.gridcol} style={{ left: `${mo.x}%` }} />)}
            {LANE_ORDER.map((_, i) => <div key={`s${i}`} className={s.lanesep} style={{ top: i * LANE }} />)}
            {model.dots.map((d) => (
              <button key={d.slug} className={s.dot}
                style={{
                  left: `${d.x}%`, top: d.lane * LANE + LANE / 2, background: d.color,
                  ...(reduce ? {} : {
                    opacity: mounted ? 1 : 0,
                    transform: `translate(-50%,-50%) scale(${mounted ? 1 : 0.2})`,
                    transition: "opacity .3s, transform .35s cubic-bezier(.2,.8,.2,1)",
                    transitionDelay: `${120 + d.i * 55}ms`,
                  }),
                }}
                aria-label={`${d.name}, ${fmtDate(d.date)}. View card.`}
                onMouseEnter={() => setTip({ x: `${d.x}%`, y: d.lane * LANE + LANE / 2, text: `${d.name} · ${fmtDate(d.date)}` })}
                onFocus={() => setTip({ x: `${d.x}%`, y: d.lane * LANE + LANE / 2, text: `${d.name} · ${fmtDate(d.date)}` })}
                onMouseLeave={() => setTip(null)} onBlur={() => setTip(null)}
                onClick={() => jumpTo(d.slug)}
              />
            ))}
            {tip && <div className={`${s.tip} ${s.on}`} style={{ left: tip.x, top: tip.y }}>{tip.text}</div>}
          </div>
          <div />
          <div className={s.axis}>
            {model.months.map((mo, i) => <div key={`a${i}`} className={s["axis-label"]} style={{ left: `${mo.x}%` }}>{mo.label}</div>)}
          </div>
        </div>
      </div>
      <div className={s["cadence-foot"]}>{model.foot}</div>
    </section>
  );
}
