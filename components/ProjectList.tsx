// components/ProjectList.tsx
import s from "./ProjectList.module.css";
import ProjectRow from "./ProjectRow";
import type { Project } from "@/lib/types";
import { sortByDateDesc } from "@/lib/helpers";

export default function ProjectList({ projects }: { projects: Project[] }) {
  // Newest by date opens by default, regardless of the (shuffled) display order.
  const newestSlug = sortByDateDesc(projects)[0]?.slug;
  return (
    <div className={s.list} data-testid="project-list">
      {projects.map((p) => (
        <ProjectRow key={p.slug} project={p} open={p.slug === newestSlug} />
      ))}
    </div>
  );
}
