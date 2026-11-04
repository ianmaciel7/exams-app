import { useTranslations } from "next-intl";
import type { PropsWithChildren } from "react";

function ProfilePersonalInfoDescription(_props: PropsWithChildren) {
  const t = useTranslations("Auth");

  return t("personalInfoDescription");
}

export { ProfilePersonalInfoDescription };
