"use client";
import s from "./FilterBar.module.css";

export default function FilterBar({
  active,
  cats,
  onSelect,
  count,
}: {
  active: string;
  cats: string[];
  onSelect: (c: string) => void;
  count: { shown: number; total: number };
}) {
  return (
    <div className={s.filterbar} id="log">
      <div className={`wrap ${s.bar}`}>
        <div className={s.chips}>
          {cats.map((c) => (
            <button
              key={c}
              className={`${s.chip} ${c === active ? s.on : ""}`}
              onClick={() => onSelect(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <div className={s.countout}>
          {count.shown} / {count.total} projects
        </div>
      </div>
    </div>
  );
}
