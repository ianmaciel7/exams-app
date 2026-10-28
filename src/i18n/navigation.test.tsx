import { cleanup, renderHook } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useRouter } from "./navigation";

const router = vi.hoisted(() => ({
  replace: vi.fn(),
  push: vi.fn(),
  refresh: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => router,
  usePathname: () => "/profile",
}));

describe("cookie-based locale navigation", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });
  it.each(["en", "pt-BR", "es"])(
    "keeps actual route paths when the locale is %s",
    (locale) => {
      const { result } = renderHook(() => useRouter(), {
        wrapper: ({ children }: { children: ReactNode }) => (
          <NextIntlClientProvider locale={locale} messages={{}}>
            {children}
          </NextIntlClientProvider>
        ),
      });
      result.current.replace("/profile");
      expect(router.replace).toHaveBeenCalledWith("/profile");
      result.current.replace("/sign-in");
      expect(router.replace).toHaveBeenCalledWith("/sign-in");
    },
  );
});
