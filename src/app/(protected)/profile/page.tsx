import { FieldGroup } from "@/components/ui/field";
import { ProfileAvatarFieldClient } from "./_components/profile-avatar-field-client";
import { ProfileBackToHomeButton } from "./_components/profile-back-to-home-button";
import {
  ProfileCard,
  ProfileCardContent,
  ProfileCardFooter,
} from "./_components/profile-card";
import { ProfileDisplayNameField } from "./_components/profile-display-name-field";
import { ProfileEmailField } from "./_components/profile-email-field";
import { ProfileFormClient } from "./_components/profile-form-client";
import { ProfileHeading } from "./_components/profile-heading";
import { ProfileLocaleField } from "./_components/profile-locale-field";
import { ProfileSaveButton } from "./_components/profile-save-button";
import { ProfileThemeField } from "./_components/profile-theme-field";

export const instant = false;

export default function ProfilePage() {
  return (
    <ProfileCard>
      <ProfileFormClient>
        <ProfileHeading />
        <ProfileCardContent>
          <FieldGroup className="gap-4">
            <ProfileAvatarFieldClient />
            <ProfileDisplayNameField />
            <ProfileEmailField />
            <ProfileLocaleField />
            <ProfileThemeField />
          </FieldGroup>
        </ProfileCardContent>
        <ProfileCardFooter>
          <ProfileSaveButton />
          <ProfileBackToHomeButton />
        </ProfileCardFooter>
      </ProfileFormClient>
    </ProfileCard>
  );
}
