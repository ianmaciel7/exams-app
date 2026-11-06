import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import HomePage from "./page";

vi.mock("./_components/welcome-hero-server", () => ({
  WelcomeHeroServer: () => <p>{"streamed hero"}</p>,
}));

describe("home page", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllEnvs();
  });

  it("renders the static shell around the streamed hero", () => {
    render(<HomePage />);
    expect(screen.getByRole("presentation")).toBeDefined();
    expect(screen.getByText("streamed hero")).toBeDefined();
  });

  it("shows the public build tag", () => {
    vi.stubEnv("NEXT_PUBLIC_GIT_TAG", "v1.2.3");
    render(<HomePage />);
    expect(screen.getByText("v1.2.3").dataset.variant).toBe("secondary");
  });
});
