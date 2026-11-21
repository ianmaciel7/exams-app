"use client";

import { getTranslation } from "@firebase-oss/ui-core";
import {
  type EmailLinkAuthScreenProps as FirebaseEmailLinkAuthScreenProps,
  useOnUserAuthenticated,
  useUI,
} from "@firebase-oss/ui-react";
import type { UserCredential } from "firebase/auth";
import { useTranslations } from "next-intl";
import type { ComponentProps } from "react";
import { AuthCard } from "@/components/notes-app/auth-card";
import { EmailLinkForm } from "@/components/notes-app/email-link-form";
import { MfaAssertionCard } from "@/components/notes-app/mfa-assertion-card";
import { RedirectErrorAlert } from "@/components/notes-app/redirect-error-alert";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldGroup, FieldSeparator } from "@/components/ui/field";

type EmailLinkCardProps = FirebaseEmailLinkAuthScreenProps &
  Omit<ComponentProps<"div">, "children">;

function EmailLinkCard({
  children,
  onSignIn,
  onEmailSent,
  ref,
  ...props
}: EmailLinkCardProps) {
  const ui = useUI();
  const t = useTranslations("auth");

  const titleText = getTranslation(ui, "labels", "signIn");
  const subtitleText = getTranslation(ui, "prompts", "signInToAccount");

  useOnUserAuthenticated(onSignIn);

  if (ui.multiFactorResolver) {
    return <MfaAssertionCard />;
  }

  return (
    <AuthCard data-slot="email-link-card" ref={ref} {...props}>
      <CardHeader>
        <CardTitle>
          <h1>{titleText}</h1>
        </CardTitle>
        <CardDescription>{subtitleText}</CardDescription>
      </CardHeader>
      <CardContent>
        <EmailLinkForm
          onSignIn={(credential: UserCredential) => onSignIn?.(credential.user)}
          onEmailSent={onEmailSent}
        />
        {children ? (
          <FieldGroup
            data-slot="email-link-card-provider-group"
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

export { EmailLinkCard, type EmailLinkCardProps };
