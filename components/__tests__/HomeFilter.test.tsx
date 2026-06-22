import { describe, it, expect } from "vitest";
import "@testing-library/jest-dom";
import { render, screen, fireEvent, within } from "@testing-library/react";
import HomeFilter from "../HomeFilter";

describe("HomeFilter", () => {
  it("shows all projects by default and filters on chip click", () => {
    render(<HomeFilter />);
    const grid = screen.getByTestId("project-grid");
    expect(within(grid).getAllByRole("article")).toHaveLength(19);
    fireEvent.click(screen.getByRole("button", { name: "Extension" }));
    // only Hotjar Blocker is an Extension
    expect(within(grid).getAllByRole("article")).toHaveLength(1);
    expect(within(grid).getByText("Hotjar Blocker")).toBeInTheDocument();
  });
});
