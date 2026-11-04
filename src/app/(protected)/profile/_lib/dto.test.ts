import { describe, expect, it } from "vitest";
import type { ProfileValues } from "./definitions";
import { parseProfileFormData } from "./dto";

const fallback: ProfileValues = {
  displayName: "Ada",
  email: "ada@example.com",
  locale: "en",
  theme: "system",
};

function formWith(entries: Record<string, string | File>) {
  const formData = new FormData();
  for (const [name, value] of Object.entries(entries)) {
    formData.set(name, value);
  }
  return formData;
}

describe("parseProfileFormData", () => {
  it("reads the submitted fields", () => {
    const avatar = new File(["x"], "a.png", { type: "image/png" });
    const result = parseProfileFormData(
      formWith({
        displayName: "Grace",
        email: "grace@example.com",
        locale: "pt-BR",
        theme: "dark",
        avatar,
      }),
      fallback,
      null,
    );
    expect(result).toEqual({
      displayName: "Grace",
      email: "grace@example.com",
      locale: "pt-BR",
      theme: "dark",
      avatarFile: avatar,
    });
  });

  it("falls back for unknown locale and theme values", () => {
    const result = parseProfileFormData(
      formWith({ locale: "xx", theme: "neon" }),
      fallback,
      null,
    );
    expect(result.locale).toBe("en");
    expect(result.theme).toBe("system");
  });

  it("keeps the pending avatar when no file is selected", () => {
    const pending = new File(["x"], "a.png", { type: "image/png" });
    const empty = new File([], "", { type: "application/octet-stream" });
    const result = parseProfileFormData(
      formWith({ avatar: empty }),
      fallback,
      pending,
    );
    expect(result.avatarFile).toBe(pending);
  });
});
