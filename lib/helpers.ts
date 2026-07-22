import type { Project, Category } from "./types";

// Brightened for the dark cosmic field — these drive 3D node glow, the --cat
// CSS var on cards, and the filter chips. Single source of category color.
export const COLORS: Record<Category, string> = {
  "AI": "#9d7bff", "Education": "#ffb454", "Web App": "#5b8cff",
  "Dev Tool": "#2dd4cf", "Extension": "#ff7a59", "Content": "#8aa6d8",
  "Game": "#ff6ac1",
};
export const LANE_ORDER: Category[] = ["AI", "Education", "Web App", "Dev Tool", "Extension", "Game", "Content"];
export const PRIORITY: Category[] = ["Game", "Extension", "Dev Tool", "Content", "Education", "AI", "Web App"];

export function primaryCat(p: Project): Category {
  return PRIORITY.find((c) => p.cats.includes(c)) ?? p.cats[0];
}

const MON = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
export function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${+d} ${MON[+m - 1]} ${y}`;
}

export function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function sortByDateDesc(list: Project[]): Project[] {
  return [...list].sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return Date.parse(b.date) - Date.parse(a.date);
  });
}

export interface Stats { shipped: number; live: number; npm: number; ai: number; domains: number; }
export function getStats(list: Project[]): Stats {
  return {
    shipped: list.length,
    live: list.filter((p) => p.live).length,
    npm: list.filter((p) => p.npm).length,
    ai: list.filter((p) => p.cats.includes("AI")).length,
    domains: new Set(list.flatMap((p) => p.cats)).size,
  };
}
