"use client";

import { TwitterAuthProvider } from "firebase/auth";
import { getTranslation } from "@firebase-oss/ui-core";
import { useUI, type TwitterSignInButtonProps, TwitterLogo } from "@firebase-oss/ui-react";

import { OAuthButton } from "@/components/firebase/oauth-button";

export type { TwitterSignInButtonProps };

export function TwitterSignInButton({ provider, ...props }: TwitterSignInButtonProps) {
  const ui = useUI();

  return (
    <OAuthButton {...props} provider={provider || new TwitterAuthProvider()}>
      <TwitterLogo />
      <span>{getTranslation(ui, "labels", "signInWithTwitter")}</span>
    </OAuthButton>
  );
}
