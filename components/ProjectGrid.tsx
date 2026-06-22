import s from "./ProjectGrid.module.css";
import ProjectCard from "./ProjectCard";
import type { Project } from "@/lib/types";

export default function ProjectGrid({ projects }: { projects: Project[] }) {
  return (
    <div className={s.grid} data-testid="project-grid">
      {projects.map((p, i) => (
        // First tile reads as the "featured" deploy (newest), for bento rhythm.
        <ProjectCard key={p.slug} project={p} featured={i === 0} />
      ))}
    </div>
  );
}
