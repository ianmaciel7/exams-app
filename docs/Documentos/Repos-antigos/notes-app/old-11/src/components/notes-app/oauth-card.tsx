"use client";

import { getTranslation } from "@firebase-oss/ui-core";
import { useOnUserAuthenticated, useUI } from "@firebase-oss/ui-react";
import type { User } from "firebase/auth";
import { useTranslations } from "next-intl";
import type { ComponentProps, PropsWithChildren } from "react";
import { AuthCard } from "@/components/notes-app/auth-card";
import { AuthPoliciesDescription } from "@/components/notes-app/auth-policies-description";
import { MfaAssertionCard } from "@/components/notes-app/mfa-assertion-card";
import { RedirectErrorAlert } from "@/components/notes-app/redirect-error-alert";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldGroup, FieldSeparator } from "@/components/ui/field";

type OAuthCardProps = PropsWithChildren<
  Omit<ComponentProps<"div">, "children">
> & {
  onSignIn?: (user: User) => void;
};

function OAuthCard({ children, onSignIn, ...props }: OAuthCardProps) {
  const ui = useUI();
  const t = useTranslations("auth");

  const titleText = getTranslation(ui, "labels", "signIn");
  const subtitleText = getTranslation(ui, "prompts", "signInToAccount");

  useOnUserAuthenticated(onSignIn);

  if (ui.multiFactorResolver) {
    return <MfaAssertionCard />;
  }

  return (
    <AuthCard data-slot="oauth-card" {...props}>
      <CardHeader>
        <CardTitle>
          <h1>{titleText}</h1>
        </CardTitle>
        <CardDescription>{subtitleText}</CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup data-slot="oauth-card-provider-group" className="pt-1">
          <FieldSeparator className="uppercase [&>span]:bg-card">
            {t("orContinueWith")}
          </FieldSeparator>
          <FieldGroup className="gap-2.5">{children}</FieldGroup>
        </FieldGroup>
        <FieldGroup className="mt-4">
          <RedirectErrorAlert />
          <AuthPoliciesDescription />
        </FieldGroup>
      </CardContent>
    </AuthCard>
  );
}

export { OAuthCard, type OAuthCardProps };
