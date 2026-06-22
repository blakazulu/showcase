import s from "./ProjectGrid.module.css";
import ProjectCard from "./ProjectCard";
import type { Project } from "@/lib/types";

export default function ProjectGrid({ projects }: { projects: Project[] }) {
  return (
    <div className={s.grid} data-testid="project-grid">
      {projects.map((p) => (
        <ProjectCard key={p.slug} project={p} />
      ))}
    </div>
  );
}
