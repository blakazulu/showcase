export type Visibility = "Public" | "Private" | "Fork" | "Standalone";
export type Category = "Web App" | "AI" | "Dev Tool" | "Education" | "Extension" | "Content";

export interface Project {
  name: string;
  slug: string;
  tagline: string;            // hook — punchy one-liner
  short?: string;             // one-sentence marketing description (shown on cards)
  date: string | null;        // ISO YYYY-MM-DD or null
  cats: Category[];
  vis: Visibility;
  icon: string;
  desc: string;
  tech: string[];
  live?: string;
  github?: string;
  npm?: string;
  play?: string;             // Google Play store listing
  highlights?: string[];      // empty for now — honest expansion later
  screenshots?: string[];     // empty for now
}
