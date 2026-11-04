import { useTranslations } from "next-intl";
import type { PropsWithChildren } from "react";

function ProfilePersonalInfoTitle(_props: PropsWithChildren) {
  const t = useTranslations("Auth");

  return t("personalInfoTitle");
}

export { ProfilePersonalInfoTitle };
