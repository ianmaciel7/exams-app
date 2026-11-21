import { type Auth, useDeviceLanguage } from "firebase/auth";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getClientCookieLocale,
  initGuestFirebaseLocale,
  isValidLocale,
  LOCALE_COOKIE_NAME,
  setClientCookieLocale,
  syncFirebaseLocale,
} from "./locale-sync";

vi.mock("firebase/auth", () => ({
  useDeviceLanguage: vi.fn(),
}));

describe("locale-sync utilities", () => {
  const mockAuth = {
    languageCode: null,
  } as unknown as Auth;

  beforeEach(() => {
    document.cookie = `${LOCALE_COOKIE_NAME}=; path=/; max-age=0`;
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    document.cookie = `${LOCALE_COOKIE_NAME}=; path=/; max-age=0`;
  });

  it("validates supported locales", () => {
    expect(isValidLocale("en")).toBe(true);
    expect(isValidLocale("pt-BR")).toBe(true);
    expect(isValidLocale("es")).toBe(true);
    expect(isValidLocale("fr")).toBe(false);
    expect(isValidLocale(null)).toBe(false);
    expect(isValidLocale(123)).toBe(false);
  });

  it("reads and writes client cookie locale", () => {
    expect(getClientCookieLocale()).toBeNull();

    setClientCookieLocale("pt-BR");
    expect(getClientCookieLocale()).toBe("pt-BR");
    expect(localStorage.getItem(LOCALE_COOKIE_NAME)).toBe("pt-BR");

    setClientCookieLocale("es");
    expect(getClientCookieLocale()).toBe("es");
  });

  it("synchronizes locale with Firebase Auth instance and cookie", () => {
    syncFirebaseLocale(mockAuth, "es");

    expect(mockAuth.languageCode).toBe("es");
    expect(getClientCookieLocale()).toBe("es");
  });

  it("initializes guest locale with useDeviceLanguage if no cookie exists", () => {
    initGuestFirebaseLocale(mockAuth);

    expect(useDeviceLanguage).toHaveBeenCalledWith(mockAuth);
  });

  it("initializes guest locale from existing cookie if present", () => {
    setClientCookieLocale("pt-BR");
    initGuestFirebaseLocale(mockAuth);

    expect(mockAuth.languageCode).toBe("pt-BR");
    expect(useDeviceLanguage).not.toHaveBeenCalled();
  });
});
