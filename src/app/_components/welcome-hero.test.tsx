import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
  WelcomeHero,
  WelcomeHeroActions,
  WelcomeHeroDescription,
  WelcomeHeroHeader,
  WelcomeHeroSkeleton,
  WelcomeHeroTitle,
  welcomeHeroActionVariants,
} from "./welcome-hero";

describe("WelcomeHero", () => {
  afterEach(cleanup);

  it("composes compound parts, forwards attributes, and exposes data-slots", () => {
    render(
      <WelcomeHero data-testid="welcome-hero" className="custom-hero">
        <WelcomeHeroHeader data-testid="welcome-hero-header">
          <WelcomeHeroTitle data-testid="welcome-hero-title">
            {"Title"}
          </WelcomeHeroTitle>
          <WelcomeHeroDescription data-testid="welcome-hero-description">
            {"Description"}
          </WelcomeHeroDescription>
        </WelcomeHeroHeader>
        <WelcomeHeroActions data-testid="welcome-hero-actions">
          <button type="button">{"Action"}</button>
        </WelcomeHeroActions>
      </WelcomeHero>,
    );

    const hero = screen.getByTestId("welcome-hero");
    expect(hero.getAttribute("data-slot")).toBe("welcome-hero");
    expect(hero.className).toContain("custom-hero");

    const header = screen.getByTestId("welcome-hero-header");
    expect(header.getAttribute("data-slot")).toBe("welcome-hero-header");

    const title = screen.getByTestId("welcome-hero-title");
    expect(title.getAttribute("data-slot")).toBe("welcome-hero-title");
    expect(title.tagName).toBe("H1");
    expect(title.textContent).toBe("Title");

    const desc = screen.getByTestId("welcome-hero-description");
    expect(desc.getAttribute("data-slot")).toBe("welcome-hero-description");
    expect(desc.tagName).toBe("P");

    const actions = screen.getByTestId("welcome-hero-actions");
    expect(actions.getAttribute("data-slot")).toBe("welcome-hero-actions");
  });

  it("applies rounded-lg and h-12 to home hero actions", () => {
    const defaultClasses = welcomeHeroActionVariants("default");
    expect(defaultClasses).toContain("rounded-lg");
    expect(defaultClasses).toContain("h-12");
    expect(defaultClasses).not.toContain("rounded-full");
    expect(defaultClasses).not.toMatch(/\bh-8\b/);

    const outlineClasses = welcomeHeroActionVariants("outline");
    expect(outlineClasses).toContain("rounded-lg");
    expect(outlineClasses).toContain("h-12");
    expect(outlineClasses).not.toContain("rounded-full");
    expect(outlineClasses).not.toMatch(/\bh-8\b/);
  });

  it("renders skeleton fallback with status role", () => {
    render(<WelcomeHeroSkeleton />);
    expect(screen.getByRole("status")).toBeDefined();
  });
});
