import { describe, it, expect } from "vitest";
import { primaryCat, fmtDate, slug, sortByDateDesc, getStats } from "../helpers";
import { PROJECTS } from "../projects";
import type { Project } from "../types";

const mk = (over: Partial<Project>): Project => ({
  name: "X", slug: "x", tagline: "", date: null, cats: ["Web App"],
  vis: "Public", icon: "x", desc: "", tech: [], ...over,
});

describe("primaryCat", () => {
  it("prefers higher-priority category (AI Image -> Dev Tool)", () => {
    expect(primaryCat(mk({ cats: ["Dev Tool", "AI"] }))).toBe("Dev Tool");
  });
  it("STEM-like (Web App, AI, Education) -> Education", () => {
    expect(primaryCat(mk({ cats: ["Web App", "AI", "Education"] }))).toBe("Education");
  });
  it("falls back to first cat when none in priority list", () => {
    expect(primaryCat(mk({ cats: ["Web App"] }))).toBe("Web App");
  });
});

describe("fmtDate", () => {
  it("formats ISO to D MON YYYY", () => { expect(fmtDate("2026-06-21")).toBe("21 JUN 2026"); });
  it("returns dash for null", () => { expect(fmtDate(null)).toBe("—"); });
});

describe("slug", () => {
  it("kebabs words and trims edges", () => {
    expect(slug("AI Image Generator")).toBe("ai-image-generator");
    expect(slug("Kiryat Begin — Desert Science")).toBe("kiryat-begin-desert-science");
  });
  it("collapses non-alphanumeric runs (including non-ASCII)", () => {
    expect(slug("חשבונייה (Math Practice)")).toBe("math-practice");
  });
});

describe("sortByDateDesc", () => {
  it("newest first, nulls last", () => {
    const out = sortByDateDesc([mk({name:"a",date:null}), mk({name:"b",date:"2025-01-01"}), mk({name:"c",date:"2026-01-01"})]);
    expect(out.map(p=>p.name)).toEqual(["c","b","a"]);
  });
});

describe("getStats", () => {
  it("counts shipped/live/npm/ai/domains", () => {
    const s = getStats([
      mk({ cats:["AI"], live:"x", npm:"n" }),
      mk({ cats:["Dev Tool"] }),
    ]);
    expect(s).toEqual({ shipped:2, live:1, npm:1, ai:1, domains:2 });
  });
});

describe("PROJECTS data", () => {
  it("has 20 entries with unique slugs", () => {
    expect(PROJECTS).toHaveLength(20);
    expect(new Set(PROJECTS.map(p=>p.slug)).size).toBe(20);
  });
  it("every slug is unique and URL-safe", () => {
    const seen = new Set<string>();
    for (const p of PROJECTS) {
      expect(p.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(seen.has(p.slug)).toBe(false);
      seen.add(p.slug);
    }
  });
});
