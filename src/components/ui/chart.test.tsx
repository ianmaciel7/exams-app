import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ChartContainer } from "./chart";

describe("chart styles", () => {
  it("keeps chart configuration from closing the style element", () => {
    const html = renderToStaticMarkup(
      <ChartContainer
        config={{ series: { color: "</style><script>alert(1)</script>" } }}
      >
        <div />
      </ChartContainer>,
    );
    expect(html).toContain("--color-series:");
    const document = new DOMParser().parseFromString(html, "text/html");
    expect(document.querySelector("script")).toBeNull();
    expect(html.match(/<\/style>/g)).toHaveLength(1);
  });
});
