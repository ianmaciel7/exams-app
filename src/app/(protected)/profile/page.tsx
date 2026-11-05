import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TranslationTextServer as T } from "@/components/ui/extensions/translation-text-server";
import { ProfileForm } from "./_components/profile-form";
import { ProfileGatewayProviderClient } from "./_components/profile-gateway-provider-client";
import { updateProfile } from "./_lib/actions";
import { readOwnProfile } from "./_lib/data";

export const instant = false;

export default async function ProfilePage() {
  const profile = await readOwnProfile();

  return (
    <ProfileGatewayProviderClient>
      <Card className="mx-auto w-full max-w-sm shadow-md ring-foreground/20 sm:max-w-md lg:max-w-lg">
        <CardHeader>
          <CardTitle role="heading" aria-level={1}>
            <T message="Auth.personalInfoTitle" />
          </CardTitle>
          <CardDescription>
            <T message="Auth.personalInfoDescription" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm action={updateProfile} initialValues={profile} />
        </CardContent>
      </Card>
    </ProfileGatewayProviderClient>
  );
}
