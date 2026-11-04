import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProfileForm } from "./_components/profile-form";

export const instant = false;

export default function ProfilePage() {
  const t = useTranslations("Auth");

  return (
    <Card className="mx-auto w-full max-w-sm shadow-md ring-foreground/20 sm:max-w-md lg:max-w-lg">
      <CardHeader>
        <CardTitle role="heading" aria-level={1}>
          {t("personalInfoTitle")}
        </CardTitle>
        <CardDescription>{t("personalInfoDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <ProfileForm />
      </CardContent>
    </Card>
  );
}
