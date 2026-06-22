import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ProjectCard from "../ProjectCard";
import type { Project } from "@/lib/types";

const p: Project = { name:"CYCLE", slug:"cycle", tagline:"t", date:"2026-06-21",
  cats:["Web App"], vis:"Public", icon:"⏱️", desc:"d", tech:["Vite"],
  live:"https://x", github:"https://g" };

describe("ProjectCard", () => {
  it("renders name linking to detail page and a Live link", () => {
    render(<ProjectCard project={p} />);
    expect(screen.getByRole("link", { name: /CYCLE/ })).toHaveAttribute("href", "/projects/cycle");
    expect(screen.getByRole("link", { name: /Live/ })).toHaveAttribute("href", "https://x");
  });
  it("shows formatted date and status", () => {
    render(<ProjectCard project={p} />);
    expect(screen.getByText("21 JUN 2026")).toBeInTheDocument();
    expect(screen.getByText("Live")).toBeInTheDocument();
  });
});
