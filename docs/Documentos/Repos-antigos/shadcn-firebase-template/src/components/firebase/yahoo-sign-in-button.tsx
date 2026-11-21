"use client";

import { OAuthProvider } from "firebase/auth";
import { getTranslation } from "@firebase-oss/ui-core";
import { useUI, type YahooSignInButtonProps, YahooLogo } from "@firebase-oss/ui-react";

import { OAuthButton } from "@/components/firebase/oauth-button";

export type { YahooSignInButtonProps };

export function YahooSignInButton({ provider, ...props }: YahooSignInButtonProps) {
  const ui = useUI();

  return (
    <OAuthButton {...props} provider={provider || new OAuthProvider("yahoo.com")}>
      <YahooLogo />
      <span>{getTranslation(ui, "labels", "signInWithYahoo")}</span>
    </OAuthButton>
  );
}
