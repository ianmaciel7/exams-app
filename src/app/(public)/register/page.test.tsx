import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  redirect: vi.fn((destination: string) => {
    throw new Error(`REDIRECT:${destination}`);
  }),
}));

vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("@/lib/session", () => ({ getSession: mocks.getSession }));
vi.mock("./_components/register-form-client", () => ({
  RegisterFormClient: () => <p>{"Form"}</p>,
}));

import RegisterPage from "./page";

const render = (next?: string) =>
  RegisterPage({
    params: Promise.resolve({}),
    searchParams: Promise.resolve(next === undefined ? {} : { next }),
  });

describe("RegisterPage", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders the form for a visitor without a session", async () => {
    mocks.getSession.mockResolvedValue({ isAuthenticated: false });
    const element = await render();
    expect(element.type).toBeTypeOf("function");
    expect(mocks.redirect).not.toHaveBeenCalled();
  });

  it.each([
    [undefined, "/"],
    ["/profile?tab=security", "/profile?tab=security"],
    ["https://evil.example", "/"],
    ["/sign-in", "/"],
  ])(
    "redirects a signed-in visitor safely with next=%s",
    async (next, destination) => {
      mocks.getSession.mockResolvedValue({ isAuthenticated: true });
      await expect(render(next)).rejects.toThrow(`REDIRECT:${destination}`);
    },
  );
});
