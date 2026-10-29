import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GitTag } from "./git-tag";

describe("GitTag", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllEnvs();
  });

  it("passes the public build tag to its consumer", () => {
    vi.stubEnv("NEXT_PUBLIC_GIT_TAG", "v1.2.3");

    render(<GitTag>{(tag) => <output>{tag}</output>}</GitTag>);

    expect(screen.getByText("v1.2.3")).toBeDefined();
  });

  it("passes an absent public build tag to its consumer", () => {
    const receiveTag = vi.fn(() => null);

    render(<GitTag>{receiveTag}</GitTag>);

    expect(receiveTag).not.toHaveBeenCalled();
  });
});
