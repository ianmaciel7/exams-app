"use client";

import { getTranslation } from "@firebase-oss/ui-core";
import { useOnUserAuthenticated, useUI } from "@firebase-oss/ui-react";
import type { User } from "firebase/auth";
import type { PropsWithChildren } from "react";
import { MultiFactorAuthAssertionScreen } from "@/components/firebase/multi-factor-auth-assertion-screen";
import { PhoneAuthForm } from "@/components/firebase/phone-auth-form";
import { RedirectError } from "@/components/firebase/redirect-error";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export type PhoneAuthScreenProps = PropsWithChildren<{
  onSignIn?: (user: User) => void;
}>;

export function PhoneAuthScreen({ children, onSignIn }: PhoneAuthScreenProps) {
  const ui = useUI();

  const titleText = getTranslation(ui, "labels", "signIn");
  const subtitleText = getTranslation(ui, "prompts", "signInToAccount");

  useOnUserAuthenticated(onSignIn);

  if (ui.multiFactorResolver) {
    return <MultiFactorAuthAssertionScreen />;
  }

  return (
    <div className="max-w-sm mx-auto">
      <Card>
        <CardHeader>
          <CardTitle role="heading" aria-level={1}>
            {titleText}
          </CardTitle>
          <CardDescription>{subtitleText}</CardDescription>
        </CardHeader>
        <CardContent>
          <PhoneAuthForm />
          {children ? (
            <>
              <Separator className="my-4" />
              <div className="flex flex-col gap-2">{children}</div>
            </>
          ) : null}
          <RedirectError />
        </CardContent>
      </Card>
    </div>
  );
}
