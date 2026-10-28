import { useTranslations } from "next-intl";
import { useProfileSession } from "./use-profile-session";
import { useProfileStatus } from "./use-profile-status";

export function useProfileSectionClient() {
  const profile = useProfileSession();
  const status = useProfileStatus(profile);
  const t = useTranslations("Auth");
  const { userId } = status;
  return { profile, status, userId, t };
}
