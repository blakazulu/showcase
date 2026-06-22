"use client";
import { useEffect, useMemo, useState } from "react";
import FilterBar from "./FilterBar";
import ProjectGrid from "./ProjectGrid";
import { PROJECTS } from "@/lib/projects";
import { sortByDateDesc, LANE_ORDER } from "@/lib/helpers";

const CATS = ["All", ...LANE_ORDER];

export default function HomeFilter() {
  const [active, setActive] = useState("All");
  const display = useMemo(() => sortByDateDesc(PROJECTS), []);
  const list = useMemo(
    () => display.filter((p) => active === "All" || p.cats.includes(active as never)),
    [active, display]
  );

  useEffect(() => {
    const onReset = () => setActive("All");
    window.addEventListener("showcase:reset-filter", onReset);
    return () => window.removeEventListener("showcase:reset-filter", onReset);
  }, []);

  return (
    <>
      <FilterBar
        active={active}
        cats={CATS}
        onSelect={setActive}
        count={{ shown: list.length, total: PROJECTS.length }}
      />
      <main style={{ padding: "30px 0 60px" }}>
        <div className="wrap">
          <ProjectGrid projects={list} />
        </div>
      </main>
    </>
  );
}
