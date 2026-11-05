import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TranslationTextServer as T } from "@/components/ui/extensions/translation-text-server";
import { verifySession } from "../_lib/dal";
import { ProfileFormClient } from "./_components/profile-form-client";

export const instant = false;

export default async function ProfilePage() {
  await verifySession();

  return (
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
        <ProfileFormClient />
      </CardContent>
    </Card>
  );
}
