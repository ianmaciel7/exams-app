import { useLocale } from "next-intl";
import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";
import { useNavigation } from "@/hooks/use-navigation";
import { useSession } from "@/hooks/use-session";
import { defaultLocale, isLocale } from "@/i18n/routing";
import type { Locale } from "@/lib/locale";
import type { Session } from "@/lib/watch-session";
import { readProfile } from "../_lib/data";
import type { ProfileLoadState } from "../_lib/definitions";
import { syncSavedLocale } from "../_lib/locale-sync";

/** Own the browser read for this visit, without a shared Promise cache. */
export function useProfileCardClient() {
  const session = useSession();
  const locale = useLocale();
  const activeLocale = isLocale(locale) ? locale : defaultLocale;
  const { refresh } = useNavigation();
  const { setTheme } = useTheme();
  const profile = useProfileLoad(session, activeLocale);
  const uid = session.user?.uid ?? "";
  const initializedUid = useRef<string | null>(null);

  useEffect(() => {
    if (profile.isLoading || profile.isError || initializedUid.current === uid)
      return;
    initializedUid.current = uid;
    if (profile.theme) setTheme(profile.theme);
    syncSavedLocale(profile.values.locale, activeLocale, refresh);
  }, [profile, uid, activeLocale, refresh, setTheme]);

  if (profile.isError) throw profile.error;
  return profile;
}

/** Discard stale results and stop waiting when this visit ends or times out. */
function useProfileLoad(session: Session, activeLocale: Locale) {
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
