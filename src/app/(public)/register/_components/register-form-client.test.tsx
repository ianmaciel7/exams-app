import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, expect, it, vi } from "vitest";

vi.mock("../_hooks/use-register-form-client", () => ({
  useRegisterFormClient: () => ({ isMfa: true }),
}));
vi.mock(
  "@/app/(public)/_components/firebase/multi-factor-assertion-flow-client",
  () => ({ MultiFactorAssertionFlowClient: () => <p>{"Second factor"}</p> }),
);

import { RegisterFormClient } from "./register-form-client";

afterEach(cleanup);
it("preserves root attributes, ref and render during multi-factor authentication", () => {
  const ref = createRef<HTMLDivElement>();
  render(
    <RegisterFormClient
      id="auth-form"
      aria-label="authentication"
      className="custom-form"
      render={<section />}
      ref={ref}
    />,
  );
  const root = document.getElementById("auth-form");
  expect(root?.tagName).toBe("SECTION");
  expect(root?.getAttribute("aria-label")).toBe("authentication");
  expect(root?.classList.contains("custom-form")).toBe(true);
  expect(ref.current).toBe(root);
  expect(root?.contains(screen.getByText("Second factor"))).toBe(true);
});
