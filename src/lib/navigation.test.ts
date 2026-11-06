import { expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ redirect: vi.fn() }));
vi.mock("next/navigation", () => ({
  unauthorized: () => {
    throw new Error("native-401");
  },
  forbidden: () => {
    throw new Error("native-403");
  },
  notFound: () => {
    throw new Error("native-404");
  },
  redirect: mocks.redirect,
}));

import * as navigation from "./navigation";

it("exposes native access interrupts directly", () => {
  expect(navigation.unauthorized).toThrow("native-401");
  expect(navigation.forbidden).toThrow("native-403");
  expect(navigation.notFound).toThrow("native-404");
});

it("does not advertise unimplemented status helpers", () => {
  expect(navigation).not.toHaveProperty("created");
  expect(navigation).not.toHaveProperty("tooManyRequests");
  expect(navigation).not.toHaveProperty("serviceUnavailable");
});

it("preserves sign-in destinations", () => {
  const target = "/profile?tab=security";
  navigation.redirectToSignIn(target);
  expect(mocks.redirect).toHaveBeenCalledWith(
    `/sign-in?next=${encodeURIComponent(target)}`,
  );
});
