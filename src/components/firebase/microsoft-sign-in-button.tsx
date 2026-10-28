"use client";

import { OAuthProvider } from "firebase/auth";
import { getTranslation } from "@firebase-oss/ui-core";
import { useUI, type MicrosoftSignInButtonProps, MicrosoftLogo } from "@firebase-oss/ui-react";

import { OAuthButton } from "@/components/firebase/oauth-button";

export type { MicrosoftSignInButtonProps };

export function MicrosoftSignInButton({ provider, ...props }: MicrosoftSignInButtonProps) {
  const ui = useUI();

  return (
    <OAuthButton {...props} provider={provider || new OAuthProvider("microsoft.com")}>
      <MicrosoftLogo />
      <span>{getTranslation(ui, "labels", "signInWithMicrosoft")}</span>
    </OAuthButton>
  );
}
