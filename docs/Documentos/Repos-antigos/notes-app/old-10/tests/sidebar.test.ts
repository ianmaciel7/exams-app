import assert from "node:assert/strict";
import test from "node:test";
import {
  clampSidebarWidth,
  sidebarDefaultWidth,
  sidebarMaxWidth,
  sidebarMinWidth,
} from "../src/domain/sidebar";

// spec.md §5.4 "Resize limits": bounded 160-360px, with an explicit min/max.
test("clampSidebarWidth: keeps values inside the documented 160-360 range", () => {
  assert.equal(clampSidebarWidth(sidebarDefaultWidth), sidebarDefaultWidth);
  assert.equal(clampSidebarWidth(sidebarMinWidth), sidebarMinWidth);
  assert.equal(clampSidebarWidth(sidebarMaxWidth), sidebarMaxWidth);
});

test("clampSidebarWidth: clamps below the minimum and above the maximum", () => {
  assert.equal(clampSidebarWidth(0), sidebarMinWidth);
  assert.equal(clampSidebarWidth(-50), sidebarMinWidth);
  assert.equal(clampSidebarWidth(sidebarMinWidth - 1), sidebarMinWidth);
  assert.equal(clampSidebarWidth(sidebarMaxWidth + 1), sidebarMaxWidth);
  assert.equal(clampSidebarWidth(10_000), sidebarMaxWidth);
});
