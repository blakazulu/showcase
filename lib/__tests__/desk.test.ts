import { describe, it, expect } from "vitest";
import { PROJECTS } from "../projects";
import { SLOTS, MODE_ORDER, modeProjects, slotItem, MODE_LABELS } from "../desk";

describe("desk modes", () => {
  it("partition all 21 projects exactly once", () => {
    const all = MODE_ORDER.flatMap((m) => modeProjects(m).map((p) => p.slug));
    expect(all).toHaveLength(PROJECTS.length);
    expect(new Set(all).size).toBe(PROJECTS.length);
    expect([...all].sort()).toEqual(PROJECTS.map((p) => p.slug).sort());
    expect(MODE_ORDER.map((m) => modeProjects(m).length)).toEqual([12, 3, 6]);
  });

  it("every mode is non-empty", () => {
    for (const m of MODE_ORDER) expect(modeProjects(m).length).toBeGreaterThan(0);
  });

  it("every mode has a label", () => {
    for (const m of MODE_ORDER) expect(MODE_LABELS[m]).toBeTruthy();
  });
});

describe("desk slots", () => {
  it("has five anchored objects", () => {
    expect(SLOTS.map((s) => s.id).sort()).toEqual(["monitor", "papers", "phone", "plan", "postcard"].sort());
  });

  it("anchored showcase projects exist and keep their real links", () => {
    const chathop = slotItem("phone");
    expect(chathop.project?.slug).toBe("chathop");
    expect(chathop.live).toBe("https://chathop.netlify.app");
    expect(slotItem("papers").project?.slug).toBe("scalpelpdf");
    expect(slotItem("plan").project?.slug).toBe("new-home-owner");
    expect(slotItem("postcard").project?.slug).toBe("floatjet");
  });

  it("monitor pins Findra with its real site and repo", () => {
    const f = slotItem("monitor");
    expect(f.name).toBe("Findra");
    expect(f.live).toBe("https://findra-search.netlify.app/");
    expect(f.github).toBe("https://github.com/blakazulu/findra");
    expect(f.project?.slug).toBe("findra"); // counted among the 21
  });

  it("contains no U+2022 bullet characters anywhere", () => {
    const text = JSON.stringify({ SLOTS, MODE_LABELS });
    expect(text.includes("\u2022")).toBe(false);
  });
});
