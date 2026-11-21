import { cookies } from "next/headers";
import { describe, expect, it, vi } from "vitest";

vi.mock("next-intl/server", () => ({
  getRequestConfig: <T>(fn: T): T => fn,
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

import requestConfig from "./request";

type RequestConfigFunction = () => Promise<{
  locale: string;
  messages: Record<string, Record<string, string>>;
}>;

interface CookieStoreStub {
  get: (name: string) => { value: string } | undefined;
}

const mockedCookies = vi.mocked(
  cookies as unknown as () => Promise<CookieStoreStub>
);

describe("next-intl request config", () => {
  it("resolves default locale 'en' when no cookie is set", async () => {
    mockedCookies.mockResolvedValue({
      get: vi.fn().mockReturnValue(undefined),
    });

    const config = await (requestConfig as unknown as RequestConfigFunction)();

    expect(config.locale).toBe("en");
    expect(config.messages).toBeDefined();
    expect(config.messages.app.title).toBe("Notes App");
  });

  it("resolves valid cookie locale 'pt-BR'", async () => {
    mockedCookies.mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: "pt-BR" }),
    });

    const config = await (requestConfig as unknown as RequestConfigFunction)();

    expect(config.locale).toBe("pt-BR");
    expect(config.messages.app.subtitle).toBe(
      "Espaço de conhecimento pessoal e aprendizado"
    );
  });

  it("falls back to default locale 'en' when invalid cookie is set", async () => {
    mockedCookies.mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: "invalid-locale" }),
    });

    const config = await (requestConfig as unknown as RequestConfigFunction)();

    expect(config.locale).toBe("en");
  });
});
