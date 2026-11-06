import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ onNavigate: vi.fn() }));
vi.mock("@firebase-oss/ui-core", () => ({
  getTranslation: (_ui: unknown, _group: string, key: string) =>
    key === "termsAndPrivacy" ? "Read {tos} and {privacy}." : key,
}));
vi.mock("@firebase-oss/ui-react", async () => {
  const { createContext } = await import("react");
  return {
    useUI: () => ({}),
    PolicyContext: createContext({
      termsOfServiceUrl: "https://example.test/terms",
      privacyPolicyUrl: "https://example.test/privacy",
      onNavigate: mocks.onNavigate,
    }),
  };
});

import { PoliciesSectionClient } from "./policies-section-client";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

it("navigates without submitting the enclosing authentication form", () => {
  const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
  render(
    <form onSubmit={onSubmit}>
      <PoliciesSectionClient />
    </form>,
  );
  const terms = screen.getByRole("button", { name: "termsOfService" });
  expect(terms.getAttribute("type")).toBe("button");
  fireEvent.click(terms);
  expect(onSubmit).not.toHaveBeenCalled();
  expect(mocks.onNavigate).toHaveBeenCalledWith("https://example.test/terms");
});
