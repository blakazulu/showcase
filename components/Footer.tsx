import s from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={s.footer}>
      <div className="wrap">
        <div className={s.row}>
          <div>LIRAZ AMIR — designed, built &amp; deployed end to end · <a href="https://github.com/blakazulu" target="_blank" rel="noopener">github.com/blakazulu</a></div>
          <div>compiled JUN 2026</div>
        </div>
        <div className={s.disc}>Status reflects repository visibility, not deploy state. Private builds are live but source-closed. Forks and no-repo deploys are labeled as such. Descriptions are sourced from each project&apos;s README or live site — nothing inflated.</div>
      </div>
    </footer>
  );
}
