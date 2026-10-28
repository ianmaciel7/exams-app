import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
  HomeHero,
  HomeHeroActions,
  HomeHeroDescription,
  HomeHeroHeader,
  HomeHeroTitle,
} from "./home-hero";

describe("HomeHero", () => {
  afterEach(cleanup);

  it("composes compound parts, forwards attributes, and exposes data-slots", () => {
    render(
      <HomeHero data-testid="home-hero" className="custom-hero">
        <HomeHeroHeader data-testid="home-hero-header">
          <HomeHeroTitle data-testid="home-hero-title">{"Title"}</HomeHeroTitle>
          <HomeHeroDescription data-testid="home-hero-description">
            {"Description"}
          </HomeHeroDescription>
        </HomeHeroHeader>
        <HomeHeroActions data-testid="home-hero-actions">
          <button type="button">{"Action"}</button>
        </HomeHeroActions>
      </HomeHero>,
    );

    const hero = screen.getByTestId("home-hero");
    expect(hero.getAttribute("data-slot")).toBe("home-hero");
    expect(hero.className).toContain("custom-hero");

    const header = screen.getByTestId("home-hero-header");
    expect(header.getAttribute("data-slot")).toBe("home-hero-header");

    const title = screen.getByTestId("home-hero-title");
    expect(title.getAttribute("data-slot")).toBe("home-hero-title");
    expect(title.tagName).toBe("H1");
    expect(title.textContent).toBe("Title");

    const desc = screen.getByTestId("home-hero-description");
    expect(desc.getAttribute("data-slot")).toBe("home-hero-description");
    expect(desc.tagName).toBe("P");

    const actions = screen.getByTestId("home-hero-actions");
    expect(actions.getAttribute("data-slot")).toBe("home-hero-actions");
  });
});
