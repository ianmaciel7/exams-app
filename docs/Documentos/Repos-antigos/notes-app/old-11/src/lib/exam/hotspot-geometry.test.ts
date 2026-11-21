import { describe, expect, it } from "vitest";
import { areaBox, areaClipPath } from "./hotspot-geometry";

describe("areaBox", () => {
  it("returns the rect as is", () => {
    expect(
      areaBox({ kind: "rect", x: 10, y: 20, width: 30, height: 40 })
    ).toEqual({ left: 10, top: 20, width: 30, height: 40 });
  });

  it("wraps a circle in its bounding square", () => {
    expect(areaBox({ kind: "circle", cx: 50, cy: 40, r: 10 })).toEqual({
      left: 40,
      top: 30,
      width: 20,
      height: 20,
    });
  });

  it("wraps a polygon in its bounds", () => {
    expect(
      areaBox({
        kind: "polygon",
        points: [
          { x: 10, y: 20 },
          { x: 50, y: 20 },
          { x: 30, y: 60 },
        ],
      })
    ).toEqual({ left: 10, top: 20, width: 40, height: 40 });
  });
});

describe("areaClipPath", () => {
  it("clips polygons relative to their box", () => {
    expect(
      areaClipPath({
        kind: "polygon",
        points: [
          { x: 10, y: 20 },
          { x: 50, y: 20 },
          { x: 30, y: 60 },
        ],
      })
    ).toBe("polygon(0% 0%, 100% 0%, 50% 100%)");
  });

  it("does not clip rects and circles", () => {
    expect(
      areaClipPath({ kind: "rect", x: 0, y: 0, width: 10, height: 10 })
    ).toBeUndefined();
    expect(
      areaClipPath({ kind: "circle", cx: 50, cy: 50, r: 5 })
    ).toBeUndefined();
  });
});
