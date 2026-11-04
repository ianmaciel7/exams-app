import { ProfileAvatarFieldClient } from "./_components/profile-avatar-field-client";
import { ProfileBackToHomeButton } from "./_components/profile-back-to-home-button";
import {
  ProfileCard,
  ProfileCardContent,
  ProfileCardDescription,
  ProfileCardFooter,
  ProfileCardHeader,
  ProfileCardTitle,
} from "./_components/profile-card";
import { ProfileDisplayNameField } from "./_components/profile-display-name-field";
import { ProfileEmailField } from "./_components/profile-email-field";
import { ProfileFormClient } from "./_components/profile-form-client";
import { ProfileLocaleField } from "./_components/profile-locale-field";
import { useTranslations } from "next-intl";
import { ProfileSaveButton } from "./_components/profile-save-button";
import { ProfileThemeField } from "./_components/profile-theme-field";

export const instant = false;

export default function ProfilePage() {
  const t = useTranslations("Auth");

  return (
    <ProfileCard>
      <ProfileFormClient>
        <ProfileCardHeader>
          <ProfileCardTitle role="heading" aria-level={1}>
            {t("personalInfoTitle")}
          </ProfileCardTitle>
          <ProfileCardDescription>
            {t("personalInfoDescription")}
          </ProfileCardDescription>
        </ProfileCardHeader>
        <ProfileCardContent>
          <ProfileAvatarFieldClient />
          <ProfileDisplayNameField />
          <ProfileEmailField />
          <ProfileLocaleField />
          <ProfileThemeField />
        </ProfileCardContent>
        <ProfileCardFooter>
          <ProfileSaveButton />
          <ProfileBackToHomeButton />
        </ProfileCardFooter>
      </ProfileFormClient>
    </ProfileCard>
  );
}
