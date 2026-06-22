import s from "./Hero.module.css";

export default function Hero({ children }: { children?: React.ReactNode }) {
  return (
    <header className={s.hero}>
      <div className="wrap">
        <span className={s.eyebrow}><span className={s.pulse}></span> Deployment log · May 2025 — Jun 2026</span>
        <h1>Built end to end. Shipped to production.</h1>
        <p className={s.lede}>I design, build, and run software across <b>AI apps, developer tooling, browser extensions, and learning platforms</b> — frontend, serverless backend, AI integration, deploy. Most of it is live right now. Here&apos;s the record.</p>
        {children}
      </div>
    </header>
  );
}
