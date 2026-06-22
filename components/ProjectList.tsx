// components/ProjectList.tsx
import s from "./ProjectList.module.css";
import ProjectRow from "./ProjectRow";
import type { Project } from "@/lib/types";

export default function ProjectList({ projects }: { projects: Project[] }) {
  // Render in the incoming (per-visit shuffled) order and open the first row —
  // so the expanded panel is always at the top and which project it is stays
  // random each visit.
  return (
    <div className={s.list} data-testid="project-list">
      {projects.map((p, i) => (
        <ProjectRow key={p.slug} project={p} open={i === 0} />
      ))}
    </div>
  );
}
