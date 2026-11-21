import type { HotspotShape } from "@/types/question";

/** Bounding box in percentages of the image box. */
export interface AreaBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

function polygonBounds(points: readonly { x: number; y: number }[]): AreaBox {
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const left = Math.min(...xs);
  const top = Math.min(...ys);
  return {
    left,
    top,
    width: Math.max(...xs) - left,
    height: Math.max(...ys) - top,
  };
}

/** The smallest box that contains the shape. */
export function areaBox(shape: HotspotShape): AreaBox {
  switch (shape.kind) {
    case "rect":
      return {
        left: shape.x,
        top: shape.y,
        width: shape.width,
        height: shape.height,
      };
    case "circle":
      return {
        left: shape.cx - shape.r,
        top: shape.cy - shape.r,
        width: shape.r * 2,
        height: shape.r * 2,
      };
    case "polygon":
      return polygonBounds(shape.points);
  }
}

/** CSS `clip-path` (relative to the bounding box) that cuts a polygon out of its box. */
export function areaClipPath(shape: HotspotShape): string | undefined {
  if (shape.kind !== "polygon") {
    return undefined;
  }
  const { left, top, width, height } = polygonBounds(shape.points);
  const points = shape.points.map(
    ({ x, y }) =>
      `${((x - left) / width) * 100}% ${((y - top) / height) * 100}%`
  );
  return `polygon(${points.join(", ")})`;
}
