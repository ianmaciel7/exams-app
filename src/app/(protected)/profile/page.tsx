import { getTranslations } from "next-intl/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { verifySession } from "../_lib/dal";
import { ProfileFormClient } from "./_components/profile-form-client";

export const instant = false;

export default async function ProfilePage() {
  await verifySession();
  const t = await getTranslations("Auth");

  return (
    <Card className="mx-auto w-full max-w-sm shadow-md ring-foreground/20 sm:max-w-md lg:max-w-lg">
      <CardHeader>
        <CardTitle role="heading" aria-level={1}>
          {t("personalInfoTitle")}
        </CardTitle>
        <CardDescription>{t("personalInfoDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <ProfileFormClient />
      </CardContent>
    </Card>
  );
}
