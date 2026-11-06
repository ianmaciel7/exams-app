import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TranslationTextServer as T } from "@/components/ui/extensions/translation-text-server";
import { redirectAuthenticated } from "../_lib/redirect-authenticated";
import { RegisterFormClient } from "./_components/register-form-client";

export const instant = false;

export default async function RegisterPage(props: PageProps<"/register">) {
  const { next } = await props.searchParams;
  await redirectAuthenticated(next);

  return (
    <Card className="w-full shadow-md ring-foreground/20">
      <CardHeader>
        <CardTitle role="heading" aria-level={1}>
          <T message="Auth.registerTitle" />
        </CardTitle>
        <CardDescription>
          <T message="Auth.registerDescription" />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterFormClient />
      </CardContent>
    </Card>
  );
}
