import type { Locale } from "@/lib/locale";
import type { ThemePreference } from "@/lib/theme";
import { readProfile } from "./data";
import type { ProfileValues } from "./definitions";
import { syncSavedLocale } from "./locale-sync";

type ProfileRequest = {
  uid: string;
  activeLocale: Locale;
  refresh: () => void;
  setTheme: (theme: ThemePreference) => void;
};

/**
 * Suspense resource for the profile read. The segment's `loading.tsx` covers
 * the pending read and its `error.tsx` covers a rejection. A rejected read
 * stays cached until `retry()`, so React's re-render before it commits the
 * error boundary does not start a second read.
 */
const profiles = new Map<string, Promise<ProfileValues>>();
const failed = new Set<string>();

// A locale sync or a superseded session never reveals the profile: the
// refresh or the gate's uid-keyed remount replaces this subtree instead.
const superseded = new Promise<never>(() => {});

function profileKey(uid: string, activeLocale: Locale) {
  return `${uid}:${activeLocale}`;
}

async function fetchProfile({
  uid,
  activeLocale,
  refresh,
  setTheme,
}: ProfileRequest) {
  const result = await readProfile(uid, activeLocale, () => true);
  if (!result || syncSavedLocale(result.values.locale, activeLocale, refresh))
    return superseded;
  if (result.theme) setTheme(result.theme);
  return result.values;
}

export function loadProfile(request: ProfileRequest) {
  const key = profileKey(request.uid, request.activeLocale);
  const cached = profiles.get(key);
  if (cached) return cached;
  const profile = fetchProfile(request);
  profile.catch(() => failed.add(key));
  profiles.set(key, profile);
  return profile;
}

/** Called by the segment's `error.tsx` before `retry()`. */
export function forgetFailedProfiles() {
  for (const key of failed) profiles.delete(key);
  failed.clear();
}

/** Called once the profile mounts, so the next visit reads fresh data. */
export function forgetProfile(uid: string, activeLocale: Locale) {
  profiles.delete(profileKey(uid, activeLocale));
}
