// components/ProjectList.tsx
import s from "./ProjectList.module.css";
import ProjectRow from "./ProjectRow";
import type { Project } from "@/lib/types";
import { sortByDateDesc } from "@/lib/helpers";

export default function ProjectList({ projects }: { projects: Project[] }) {
  // The newest project by date opens by default and is pinned to the top; the
  // rest keep their incoming (shuffled) order, so the one open row is always
  // first instead of stranded mid-list.
  const newestSlug = sortByDateDesc(projects)[0]?.slug;
  const newest = projects.find((p) => p.slug === newestSlug);
  const rows = newest
    ? [newest, ...projects.filter((p) => p.slug !== newestSlug)]
    : projects;
  return (
    <div className={s.list} data-testid="project-list">
      {rows.map((p) => (
        <ProjectRow key={p.slug} project={p} open={p.slug === newestSlug} />
      ))}
    </div>
  );
}
