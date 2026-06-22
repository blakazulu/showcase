// components/__tests__/ProjectRow.test.tsx
import { describe, it, expect } from "vitest";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import ProjectRow from "../ProjectRow";
import type { Project } from "@/lib/types";

const pub: Project = { name: "CYCLE", slug: "cycle", tagline: "hook", date: "2026-06-21",
  cats: ["Web App"], vis: "Public", icon: "⏱️", desc: "long pitch", tech: ["Vite", "PWA"],
  live: "https://x", github: "https://g" };

const priv: Project = { name: "ChatHop", slug: "chathop", tagline: "hook", date: "2026-06-09",
  cats: ["Web App"], vis: "Private", icon: "💬", desc: "long pitch", tech: ["JS"],
  live: "https://c" };

describe("ProjectRow", () => {
  it("renders the name, status label, date, pitch and a detail-page link", () => {
    render(<ProjectRow project={pub} />);
    expect(screen.getByText("CYCLE")).toBeInTheDocument();
    expect(screen.getByText("Live")).toBeInTheDocument();
    expect(screen.getByText("21 JUN 2026")).toBeInTheDocument();
    expect(screen.getByText("long pitch")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /open/i })).toHaveAttribute("href", "/projects/cycle");
    expect(screen.getByRole("link", { name: /live/i })).toHaveAttribute("href", "https://x");
  });

  it("hides the Private status indicator but still renders the row", () => {
    render(<ProjectRow project={priv} />);
    expect(screen.getByText("ChatHop")).toBeInTheDocument();
    expect(screen.queryByText("Private")).not.toBeInTheDocument();
  });

  it("renders the open attribute only when open is true", () => {
    const { container, rerender } = render(<ProjectRow project={pub} />);
    expect(container.querySelector("details")?.hasAttribute("open")).toBe(false);
    rerender(<ProjectRow project={pub} open />);
    expect(container.querySelector("details")?.hasAttribute("open")).toBe(true);
  });
});
