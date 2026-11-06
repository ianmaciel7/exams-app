"use client";
import { GoogleLogo } from "@firebase-oss/ui-react";
import type { ComponentProps } from "react";
import { GoogleSignInButton } from "@/components/firebase/google-sign-in-button";
import { useGoogleSignInButtonClient } from "../../_hooks/use-google-sign-in-button-client";

type GoogleSignInButtonClientProps = Omit<
  ComponentProps<typeof GoogleSignInButton>,
  keyof ReturnType<typeof useGoogleSignInButtonClient> | "icon"
>;
function GoogleSignInButtonClient(props: GoogleSignInButtonClientProps) {
  const { onSignIn, ...state } = useGoogleSignInButtonClient();
  return (
    <GoogleSignInButton
      {...props}
      {...state}
      onSignIn={onSignIn}
      icon={<GoogleLogo data-icon="inline-start" aria-hidden="true" />}
    />
  );
}

export { GoogleSignInButtonClient };
