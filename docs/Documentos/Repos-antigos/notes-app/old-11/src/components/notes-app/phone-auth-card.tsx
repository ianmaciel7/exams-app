"use client";

import { getTranslation } from "@firebase-oss/ui-core";
import { useOnUserAuthenticated, useUI } from "@firebase-oss/ui-react";
import type { User } from "firebase/auth";
import { useTranslations } from "next-intl";
import type { ComponentProps, PropsWithChildren } from "react";
import { AuthCard } from "@/components/notes-app/auth-card";
import { MfaAssertionCard } from "@/components/notes-app/mfa-assertion-card";
import { PhoneAuthForm } from "@/components/notes-app/phone-auth-form";
import { RedirectErrorAlert } from "@/components/notes-app/redirect-error-alert";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldGroup, FieldSeparator } from "@/components/ui/field";

type PhoneAuthCardProps = PropsWithChildren<
  Omit<ComponentProps<"div">, "children">
> & {
  onSignIn?: (user: User) => void;
};

function PhoneAuthCard({ children, onSignIn, ...props }: PhoneAuthCardProps) {
  const ui = useUI();
  const t = useTranslations("auth");

  const titleText = getTranslation(ui, "labels", "signIn");
  const subtitleText = getTranslation(ui, "prompts", "signInToAccount");

  useOnUserAuthenticated(onSignIn);

  if (ui.multiFactorResolver) {
    return <MfaAssertionCard />;
  }

  return (
    <AuthCard data-slot="phone-auth-card" {...props}>
      <CardHeader>
        <CardTitle>
          <h1>{titleText}</h1>
        </CardTitle>
        <CardDescription>{subtitleText}</CardDescription>
      </CardHeader>
      <CardContent>
        <PhoneAuthForm />
        {children ? (
          <FieldGroup
            data-slot="phone-auth-card-provider-group"
            className="pt-1"
          >
            <FieldSeparator className="uppercase [&>span]:bg-card">
              {t("orContinueWith")}
            </FieldSeparator>
            <FieldGroup className="gap-2.5">
              {children}
              <RedirectErrorAlert />
            </FieldGroup>
          </FieldGroup>
        ) : null}
      </CardContent>
    </AuthCard>
  );
}

export { PhoneAuthCard, type PhoneAuthCardProps };
