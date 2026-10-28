"use client";

import { GithubAuthProvider } from "firebase/auth";
import { getTranslation } from "@firebase-oss/ui-core";
import { useUI, type GitHubSignInButtonProps, GitHubLogo } from "@firebase-oss/ui-react";

import { OAuthButton } from "@/components/firebase/oauth-button";

export type { GitHubSignInButtonProps };

export function GitHubSignInButton({ provider, ...props }: GitHubSignInButtonProps) {
  const ui = useUI();

  return (
    <OAuthButton {...props} provider={provider || new GithubAuthProvider()}>
      <GitHubLogo />
      <span>{getTranslation(ui, "labels", "signInWithGitHub")}</span>
    </OAuthButton>
  );
}
