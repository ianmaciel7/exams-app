import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { WebPreview, WebPreviewBody, WebPreviewUrl } from "./web-preview";

afterEach(cleanup);

describe("WebPreviewBody", () => {
  it("enforces its sandbox even when runtime callers attempt to override it", () => {
    const unsupportedOverrides = {
      sandbox: "allow-same-origin allow-top-navigation",
      srcDoc: "<h1>unsafe document override</h1>",
    } as unknown as ComponentProps<typeof WebPreviewBody>;
    render(
      <WebPreview defaultUrl="https://example.test/">
        <WebPreviewBody {...unsupportedOverrides} title="Sandboxed preview" />
      </WebPreview>,
    );
    const frame = screen.getByTitle("Sandboxed preview");
    expect(frame.getAttribute("sandbox")).toBe(
      "allow-scripts allow-forms allow-popups allow-presentation",
    );
    expect(frame.hasAttribute("srcdoc")).toBe(false);
    expect(frame.getAttribute("src")).toBe("https://example.test/");
  });

  it("does not navigate to a non-HTTP scheme", () => {
    render(<WebPreview><WebPreviewBody src="javascript:alert(1)" /></WebPreview>);
    expect(screen.getByTitle("Preview").getAttribute("src")).toBeNull();
  });

  it("updates its input while forwarding custom onChange events", () => {
    const onChange = vi.fn();
    render(<WebPreview><WebPreviewUrl onChange={onChange} /></WebPreview>);
    const input = screen.getByPlaceholderText("Enter URL...") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "https://example.test/new" } });
    expect(input.value).toBe("https://example.test/new");
    expect(onChange).toHaveBeenCalledOnce();
  });
});
