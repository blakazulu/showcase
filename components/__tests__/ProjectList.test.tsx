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

  it("pre-expands the project with the most recent date", () => {
    const { container } = render(<ProjectList projects={projects} />);
    const openDetails = container.querySelectorAll("details[open]");
    expect(openDetails).toHaveLength(1);
    // the open row is the 'newest' article
    expect(openDetails[0].closest("article")).toContainElement(screen.getByText("newest"));
  });

  it("pins the newest project to the top, preserving the rest of the order", () => {
    const { container } = render(<ProjectList projects={projects} />);
    const articles = container.querySelectorAll("article");
    // newest is first even though it arrived in the middle of the input
    expect(articles[0]).toContainElement(screen.getByText("newest"));
    // the remaining rows keep their incoming relative order (old before mid)
    expect(articles[1]).toContainElement(screen.getByText("old"));
    expect(articles[2]).toContainElement(screen.getByText("mid"));
  });
});
