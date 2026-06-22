// components/__tests__/ProjectList.test.tsx
import { describe, it, expect } from "vitest";
import "@testing-library/jest-dom";
import { render, screen, within } from "@testing-library/react";
import ProjectList from "../ProjectList";
import type { Project } from "@/lib/types";

const mk = (slug: string, date: string | null): Project => ({
  name: slug, slug, tagline: "t", date, cats: ["Web App"], vis: "Public",
  icon: "x", desc: "d", tech: ["Vite"],
});

const projects = [mk("old", "2025-01-01"), mk("newest", "2026-06-21"), mk("mid", "2025-09-09")];

describe("ProjectList", () => {
  it("renders one article per project", () => {
    render(<ProjectList projects={projects} />);
    const list = screen.getByTestId("project-list");
    expect(within(list).getAllByRole("article")).toHaveLength(3);
  });

  it("opens the first project in the list, whatever its date", () => {
    const { container } = render(<ProjectList projects={projects} />);
    const openDetails = container.querySelectorAll("details[open]");
    expect(openDetails).toHaveLength(1);
    // 'old' is first in the input (and the oldest) — it opens because it's first,
    // not because of its date.
    expect(openDetails[0].closest("article")).toContainElement(screen.getByText("old"));
  });

  it("preserves the incoming order (no reordering)", () => {
    const { container } = render(<ProjectList projects={projects} />);
    const articles = container.querySelectorAll("article");
    expect(articles[0]).toContainElement(screen.getByText("old"));
    expect(articles[1]).toContainElement(screen.getByText("newest"));
    expect(articles[2]).toContainElement(screen.getByText("mid"));
  });
});
