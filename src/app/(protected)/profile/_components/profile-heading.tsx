import { useTranslations } from "next-intl";
import type { ComponentProps } from "react";
import {
  ProfileCardDescription,
  ProfileCardHeader,
  ProfileCardTitle,
} from "./profile-card";

type ProfileHeadingProps = Omit<
  ComponentProps<typeof ProfileCardHeader>,
  "children"
>;

function ProfileHeading(props: ProfileHeadingProps) {
  const t = useTranslations("Auth");

  return (
    <ProfileCardHeader {...props}>
      <ProfileCardTitle role="heading" aria-level={1}>
        {t("personalInfoTitle")}
      </ProfileCardTitle>
      <ProfileCardDescription>
        {t("personalInfoDescription")}
      </ProfileCardDescription>
    </ProfileCardHeader>
  );
}

export { ProfileHeading };
