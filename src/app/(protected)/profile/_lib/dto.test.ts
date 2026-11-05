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
  it("reads the submitted fields but never the e-mail", () => {
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
    );
    expect(result).toEqual({
      displayName: "Grace",
      email: "ada@example.com",
      locale: "pt-BR",
      theme: "dark",
      avatarFile: avatar,
    });
  });

  it("falls back for unknown locale and theme values", () => {
    const result = parseProfileFormData(
      formWith({ locale: "xx", theme: "neon" }),
      fallback,
    );
    expect(result.locale).toBe("en");
    expect(result.theme).toBe("system");
  });

  it("treats an empty file input as no new avatar", () => {
    const empty = new File([], "", { type: "application/octet-stream" });
    const result = parseProfileFormData(formWith({ avatar: empty }), fallback);
    expect(result.avatarFile).toBeNull();
  });

  it("limits the display name to 100 characters", () => {
    const result = parseProfileFormData(
      formWith({ displayName: "a".repeat(150) }),
      fallback,
    );
    expect(result.displayName).toHaveLength(100);
  });
});
