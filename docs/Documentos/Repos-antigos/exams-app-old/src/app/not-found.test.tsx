import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import NotFound from "./not-found";

describe("NotFound component", () => {
  it("renders the 404 heading and return home link", () => {
    render(<NotFound />);

    expect(
      screen.getByRole("heading", { level: 2, name: /404 - Page Not Found/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Return Home/i })).toHaveAttribute(
      "href",
      "/",
    );
  });
});
