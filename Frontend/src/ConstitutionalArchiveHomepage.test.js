import React from "react";
import { render, screen } from "@testing-library/react";
import ConstitutionalArchiveHomepage from "./ConstitutionalArchiveHomepage";

describe("ConstitutionalArchiveHomepage", () => {
  test("renders the main title", () => {
    render(<ConstitutionalArchiveHomepage />);
    expect(screen.getByText(/Constitutional Archive/i)).toBeInTheDocument();
  });

  test("renders the search input", () => {
    render(<ConstitutionalArchiveHomepage />);
    expect(screen.getByPlaceholderText("Search constitutional documents...")).toBeInTheDocument();
  });

  test("renders Featured Collections section", () => {
    render(<ConstitutionalArchiveHomepage />);
    expect(screen.getByText(/Featured Collections/i)).toBeInTheDocument();
  });

  test("renders Recently Added section", () => {
    render(<ConstitutionalArchiveHomepage />);
    expect(screen.getByText(/Recently Added/i)).toBeInTheDocument();
  });

  test("renders Browse by Category section", () => {
    render(<ConstitutionalArchiveHomepage />);
    expect(screen.getByText(/Browse by Category/i)).toBeInTheDocument();
  });
});
