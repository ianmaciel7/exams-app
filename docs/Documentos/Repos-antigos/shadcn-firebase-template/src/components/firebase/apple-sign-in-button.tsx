"use client";

import { OAuthProvider } from "firebase/auth";
import { getTranslation } from "@firebase-oss/ui-core";
import { useUI, type AppleSignInButtonProps, AppleLogo } from "@firebase-oss/ui-react";

import { OAuthButton } from "@/components/firebase/oauth-button";

export type { AppleSignInButtonProps };

export function AppleSignInButton({ provider, ...props }: AppleSignInButtonProps) {
  const ui = useUI();

  return (
    <OAuthButton {...props} provider={provider || new OAuthProvider("apple.com")}>
      <AppleLogo />
      <span>{getTranslation(ui, "labels", "signInWithApple")}</span>
    </OAuthButton>
  );
}
