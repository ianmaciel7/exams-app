import { getTranslations } from "next-intl/server";
import { ProfileClient } from "./_components/profile-client";

export const instant = false;

export default async function ProfilePage() {
  const t = await getTranslations("Auth");

  return (
    <ProfileClient
      title={t("personalInfoTitle")}
      description={t("personalInfoDescription")}
    />
  );
}
