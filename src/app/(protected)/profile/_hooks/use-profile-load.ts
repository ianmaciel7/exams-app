import { useEffect, useState } from "react";
import type { Locale } from "@/lib/locale";
import type { Session } from "@/lib/session-context";
import { readProfile } from "../_lib/data";
import type { ProfileLoadState } from "../_lib/definitions";

/** Discard stale results and stop waiting when this visit ends or times out. */
export function useProfileLoad(session: Session, activeLocale: Locale) {
  const [currentUid, setCurrentUid] = useState(session.user?.uid);
  const [profile, setProfile] = useState<ProfileLoadState>({
    isLoading: true,
    isError: false,
  });

  if (session.user?.uid !== currentUid) {
    setCurrentUid(session.user?.uid);
    setProfile({ isLoading: true, isError: false });
  }

  useEffect(() => {
    if (!profile.isLoading || !session.user) return;
    let active = true;
    const timeout = setTimeout(() => {
      active = false;
      setProfile({
        isLoading: false,
        isError: true,
        error: new Error("Profile loading timed out"),
      });
    }, 15_000);
    void readProfile(session.user.uid, activeLocale, () => active)
      .then((result) => {
        if (!active) return;
        if (!result) throw new Error("Profile session changed while loading");
        setProfile({ isLoading: false, isError: false, ...result });
      })
      .catch((error: unknown) => {
        if (active) setProfile({ isLoading: false, isError: true, error });
      })
      .finally(() => clearTimeout(timeout));
    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [session, activeLocale, profile.isLoading]);
  return profile;
}
