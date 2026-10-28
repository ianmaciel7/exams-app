import { expect, test } from "vitest";
import { page } from "vitest/browser";
import { renderHook } from "vitest-browser-react";
import { useIsMobile } from "./use-mobile";

// Unlike use-mobile.test.tsx, this runs against the real matchMedia of a real
// browser viewport instead of a stubbed one.
test("follows the browser viewport across the 768px breakpoint", async () => {
  await page.viewport(767, 800);

  const { result } = await renderHook(() => useIsMobile());

  await expect.poll(() => result.current).toBe(true);

  await page.viewport(768, 800);
  await expect.poll(() => result.current).toBe(false);

  await page.viewport(400, 800);
  await expect.poll(() => result.current).toBe(true);
});
