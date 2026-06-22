import { describe, it, expect } from "vitest";
import "@testing-library/jest-dom";
import { render, screen, fireEvent, within } from "@testing-library/react";
import HomeFilter from "../HomeFilter";

describe("HomeFilter", () => {
  it("shows all projects by default and filters on chip click", () => {
    render(<HomeFilter />);
    const list = screen.getByTestId("project-list");
    expect(within(list).getAllByRole("article")).toHaveLength(18);
    fireEvent.click(screen.getByRole("button", { name: "Extension" }));
    // only Hotjar Blocker is an Extension
    expect(within(list).getAllByRole("article")).toHaveLength(1);
    expect(within(list).getByText("Hotjar Blocker")).toBeInTheDocument();
  });
});
