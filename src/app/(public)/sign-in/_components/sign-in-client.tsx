"use client";

import type { ComponentProps } from "react";
import { GoogleSignInButton } from "@/components/firebase/google-sign-in-button";
import { SignInAuthScreen as SignInAuthContent } from "@/components/firebase/sign-in-auth-screen";
import { useSignInClient } from "../_hooks/use-sign-in-client";

type SignInClientProps = ComponentProps<"div">;

function SignInClient(props: SignInClientProps) {
  const { goToRegister, goToForgotPassword } = useSignInClient();
  return (
    <div {...props}>
      <SignInAuthContent
        onSignUpClick={goToRegister}
        onForgotPasswordClick={goToForgotPassword}
      >
        {process.env.NEXT_PUBLIC_FIREBASE_GOOGLE_ENABLED === "true" ? (
          <GoogleSignInButton />
        ) : null}
      </SignInAuthContent>
    </div>
  );
}

export { SignInClient };
