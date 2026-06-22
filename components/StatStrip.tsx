import s from "./StatStrip.module.css";
import { PROJECTS } from "@/lib/projects";
import { getStats } from "@/lib/helpers";

export default function StatStrip() {
  const { shipped, live, npm, ai, domains } = getStats(PROJECTS);
  const items: [number, string][] = [[shipped,"shipped"],[live,"live"],[npm,"on npm"],[ai,"AI-powered"],[domains,"domains"]];
  return (
    <div className={s.stats}>
      {items.map(([v,l]) => <span key={l} className={s.s}><b>{v}</b>{l}</span>)}
    </div>
  );
}
