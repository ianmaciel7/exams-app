import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Version } from "./version";

describe("Version", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllEnvs();
  });

  it("renders the public build tag directly as a span by default", () => {
    vi.stubEnv("NEXT_PUBLIC_GIT_TAG", "v1.2.3");

    render(<Version />);

    const element = screen.getByText("v1.2.3");
    expect(element.tagName).toBe("SPAN");
    expect(element.dataset.slot).toBe("version");
    expect(element.dataset.value).toBe("v1.2.3");
  });

  it("renders with a custom render element via Base UI useRender", () => {
    vi.stubEnv("NEXT_PUBLIC_GIT_TAG", "v1.2.3");

    render(<Version render={<code data-testid="custom-version" />} />);

    const element = screen.getByTestId("custom-version");
    expect(element.tagName).toBe("CODE");
    expect(element.textContent).toBe("v1.2.3");
    expect(element.dataset.slot).toBe("version");
  });

  it("renders with a custom render function receiving props and state", () => {
    vi.stubEnv("NEXT_PUBLIC_GIT_TAG", "v1.2.3");

    const renderCustom = (
      props: React.ComponentProps<"output">,
      state: { value: string },
    ) => <output {...props}>{state.value}</output>;

    render(<Version render={renderCustom} />);

    const element = screen.getByText("v1.2.3");
    expect(element.tagName).toBe("OUTPUT");
    expect(element.dataset.slot).toBe("version");
  });

  it("allows custom children while preserving version state", () => {
    vi.stubEnv("NEXT_PUBLIC_GIT_TAG", "v1.2.3");

    const customText = "custom-content";
    render(<Version>{customText}</Version>);

    const element = screen.getByText(customText);
    expect(element.dataset.slot).toBe("version");
    expect(element.dataset.value).toBe("v1.2.3");
  });

  it("renders nothing when tag is absent", () => {
    const { container } = render(
      <Version render={<code data-testid="absent-version" />} />,
    );

    expect(container.firstChild).toBeNull();
    expect(screen.queryByTestId("absent-version")).toBeNull();
  });
});
