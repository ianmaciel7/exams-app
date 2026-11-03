import { useTranslations } from "next-intl";

function ProfilePersonalInfoTitle() {
  const t = useTranslations("Auth");

  return t("personalInfoTitle");
}

export { ProfilePersonalInfoTitle };
