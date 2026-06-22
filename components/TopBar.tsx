import s from "./TopBar.module.css";

export default function TopBar() {
  return (
    <div className={s.topbar}>
      <div className="wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 54 }}>
        <div className={s.brand}><b>LIRAZ&nbsp;AMIR</b> <span>/ builder</span></div>
        <nav className={s.topnav}>
          <a href="https://github.com/blakazulu" target="_blank" rel="noopener">GitHub ↗</a>
          <a href="#log">The log ↓</a>
        </nav>
      </div>
    </div>
  );
}
