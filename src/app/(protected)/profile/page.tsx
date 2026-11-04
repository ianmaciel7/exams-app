import { getTranslations } from "next-intl/server";
import { verifySession } from "../_lib/dal";
import { ProfileCardClient } from "./_components/profile-card-client";

export const instant = false;

export default async function ProfilePage() {
  await verifySession();
  const t = await getTranslations("Auth");

  return (
    <ProfileCardClient
      title={t("personalInfoTitle")}
      description={t("personalInfoDescription")}
    />
  );
}
