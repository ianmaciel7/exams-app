import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Home, HomeContent, HomeFooter, HomeHeading, HomeLogo } from "./home";

describe("Home", () => {
  afterEach(cleanup);

  it("composes compound parts, forwards attributes, and exposes data-slots", () => {
    render(
      <Home data-testid="home" className="custom-home">
        <HomeContent data-testid="home-content" className="custom-content">
          <HomeLogo data-testid="home-logo" />
          <HomeHeading
            data-testid="home-heading"
            title="Exams App"
            description="Practice exams and track your progress"
          />
        </HomeContent>
        <HomeFooter data-testid="home-footer">
          <span>{"v1.0.0"}</span>
        </HomeFooter>
      </Home>,
    );

    const home = screen.getByTestId("home");
    expect(home.getAttribute("data-slot")).toBe("home");
    expect(home.tagName).toBe("MAIN");
    expect(home.className).toContain("custom-home");

    const content = screen.getByTestId("home-content");
    expect(content.getAttribute("data-slot")).toBe("home-content");
    expect(content.className).toContain("custom-content");

    const logo = screen.getByTestId("home-logo");
    expect(logo.getAttribute("data-slot")).toBe("home-logo");
    expect(logo.getAttribute("src")).toBe("/next.svg");

    const heading = screen.getByTestId("home-heading");
    expect(heading.getAttribute("data-slot")).toBe("home-heading");

    const title = screen.getByRole("heading", { level: 1 });
    expect(title.textContent).toBe("Exams App");

    const desc = screen.getByText("Practice exams and track your progress");
    expect(desc.tagName).toBe("P");

    const footer = screen.getByTestId("home-footer");
    expect(footer.getAttribute("data-slot")).toBe("home-footer");
    expect(footer.textContent).toBe("v1.0.0");
  });
});
