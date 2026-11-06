"use client";

import { getTranslation } from "@firebase-oss/ui-core";
import {
  GoogleLogo,
  type GoogleSignInButtonProps,
  useUI,
} from "@firebase-oss/ui-react";
import { GoogleAuthProvider } from "firebase/auth";

import { OAuthButton } from "@/components/firebase/oauth-button";

function GoogleSignInButton({ provider, ...props }: GoogleSignInButtonProps) {
  const ui = useUI();

  return (
    <OAuthButton {...props} provider={provider || new GoogleAuthProvider()}>
      <GoogleLogo />
      <span>{getTranslation(ui, "labels", "signInWithGoogle")}</span>
    </OAuthButton>
  );
}

export { GoogleSignInButton };
