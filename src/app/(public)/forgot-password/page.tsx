import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TranslationTextServer as T } from "@/components/ui/extensions/translation-text-server";
import { ForgotPasswordFormClient } from "./_components/forgot-password-form-client";

export const instant = false;

export default async function ForgotPasswordPage(
  props: PageProps<"/forgot-password">,
) {
  const { next } = await props.searchParams;
  return (
    <Card className="w-full shadow-md ring-foreground/20">
      <CardHeader>
        <CardTitle role="heading" aria-level={1}>
          <T message="Auth.forgotPasswordTitle" />
        </CardTitle>
        <CardDescription>
          <T message="Auth.forgotPasswordDescription" />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ForgotPasswordFormClient next={next} />
      </CardContent>
    </Card>
  );
}
