import { useTranslations } from "next-intl";

function ProfilePersonalInfoDescription() {
  const t = useTranslations("Auth");

  return t("personalInfoDescription");
}

export { ProfilePersonalInfoDescription };
