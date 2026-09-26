import { PROJECTS } from "./projects";
import type { Project } from "./types";

// The desk scene: five physical objects, each anchored to one real project
// (plus Findra, the newest product, pinned to the monitor per the chosen
// concept — it links out to its real site, it is not counted among the 20).
export type DeskMode = "products" | "websites" | "dev-tools";
export type SlotId = "monitor" | "phone" | "papers" | "plan" | "postcard";

export const MODE_LABELS: Record<DeskMode, string> = {
  products: "Products",
  websites: "Websites",
  "dev-tools": "Dev tools",
};
export const MODE_ORDER: DeskMode[] = ["products", "websites", "dev-tools"];

export interface DeskItem {
  key: string;             // project slug, or "findra" for the pinned monitor app
  name: string;
  tagline: string;
  short: string;
  project?: Project;       // set when the object is one of the 20 list entries
  live?: string;
  github?: string;
  texture?: string;        // /textures/*.jpg screenshot, when one exists
}

export interface Slot {
  id: SlotId;
  label: string;           // physical object name ("Monitor", ...)
  modes: DeskMode[];       // which modes spotlight this object
  item: DeskItem;
}

function bySlug(slug: string): Project {
  const p = PROJECTS.find((p) => p.slug === slug);
  if (!p) throw new Error(`desk: unknown project slug ${slug}`);
  return p;
}

function fromProject(slug: string, texture?: string): DeskItem {
  const p = bySlug(slug);
  return {
    key: p.slug, name: p.name, tagline: p.tagline,
    short: p.short ?? p.tagline, project: p,
    live: p.live, github: p.github, texture,
  };
}

// Findra facts are sourced from its public repo and live site
// (findra-search.netlify.app) — "Windows search, but it works."
const FINDRA: DeskItem = {
  key: "findra",
  name: "Findra",
  tagline: "Windows search, but it works",
  short:
    "A free, open-source desktop search app for Windows 10/11 — filenames in milliseconds, plus documents, photos and recordings, all on your own machine.",
  live: "https://findra-search.netlify.app/",
  github: "https://github.com/blakazulu/findra",
  texture: "/textures/findra-screen.jpg",
};

export const SLOTS: Slot[] = [
  { id: "monitor", label: "Monitor", modes: ["products"], item: FINDRA },
  { id: "phone", label: "Phone", modes: ["products"], item: fromProject("chathop", "/textures/chathop-phone.jpg") },
  { id: "papers", label: "Open PDF", modes: ["dev-tools"], item: fromProject("scalpelpdf") },
  { id: "plan", label: "Apartment plan", modes: ["products"], item: fromProject("new-home-owner", "/textures/nho-plan.jpg") },
  { id: "postcard", label: "Postcard", modes: ["websites"], item: fromProject("floatjet", "/textures/floatjet-postcard.jpg") },
];

export function slotItem(id: SlotId): DeskItem {
  return SLOTS.find((s) => s.id === id)!.item;
}

const DEV_TOOL = (p: Project) => p.cats.includes("Dev Tool") || p.cats.includes("Extension");
const WEBSITE = (p: Project) =>
  p.cats.includes("Content") || p.slug === "mortgagefix" || p.slug === "kiryat-begin-desert-science";

// Partition all 20 projects into the three desk modes, exactly once each.
export function modeProjects(mode: DeskMode): Project[] {
  if (mode === "dev-tools") return PROJECTS.filter(DEV_TOOL);
  if (mode === "websites") return PROJECTS.filter((p) => !DEV_TOOL(p) && WEBSITE(p));
  return PROJECTS.filter((p) => !DEV_TOOL(p) && !WEBSITE(p));
}

export function slotInMode(slot: Slot, mode: DeskMode): boolean {
  return slot.modes.includes(mode);
}
