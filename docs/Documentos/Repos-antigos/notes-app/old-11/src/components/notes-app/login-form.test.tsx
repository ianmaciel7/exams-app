import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LoginForm } from "./login-form";

const { action } = vi.hoisted(() => ({ action: vi.fn() }));

vi.mock("@hookform/resolvers/standard-schema", () => ({
  standardSchemaResolver: () => async (values: unknown) => ({
    values,
    errors: {},
  }),
}));

vi.mock("@firebase-oss/ui-react", () => ({
  useSignInAuthFormAction: () => action,
  useSignInAuthFormSchema: () => ({}),
  useUI: () => ({ state: "idle" }),
}));

vi.mock("@firebase-oss/ui-core", () => ({
  FirebaseUIError: class FirebaseUIError extends Error {},
  getTranslation: (_ui: unknown, group: string, key: string) =>
    `${group}.${key}`,
}));

vi.mock("./auth-policies-description", () => ({
  AuthPoliciesDescription: () => null,
}));

describe("LoginForm", () => {
  it("renders action failures in a destructive alert", async () => {
    action.mockRejectedValueOnce(new Error("Unable to sign in."));

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText("labels.emailAddress"), {
      target: { value: "person@example.com" },
    });
    fireEvent.change(screen.getByLabelText("labels.password"), {
      target: { value: "password" },
    });
    fireEvent.click(screen.getByRole("button", { name: "labels.signIn" }));

    await waitFor(() => {
      expect(screen.getByRole("alert").textContent).toContain(
        "Unable to sign in."
      );
    });
  });
});
