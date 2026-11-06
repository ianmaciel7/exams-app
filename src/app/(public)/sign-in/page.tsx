import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TranslationTextServer as T } from "@/components/ui/extensions/translation-text-server";
import { redirectAuthenticated } from "../_lib/redirect-authenticated";
import { SignInFormClient } from "./_components/sign-in-form-client";

export const instant = false;

export default async function SignInPage(props: PageProps<"/sign-in">) {
  const { next } = await props.searchParams;
  await redirectAuthenticated(next);

  return (
    <Card className="w-full shadow-md ring-foreground/20">
      <CardHeader>
        <CardTitle role="heading" aria-level={1}>
          <T message="Auth.signInTitle" />
        </CardTitle>
        <CardDescription>
          <T message="Auth.signInDescription" />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SignInFormClient next={next} />
      </CardContent>
    </Card>
  );
}
