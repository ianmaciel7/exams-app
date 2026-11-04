"use client";

import type { ComponentProps } from "react";
import { GoogleSignInButton } from "@/components/firebase/google-sign-in-button";
import { SignInAuthScreen as SignInAuthContent } from "@/components/firebase/sign-in-auth-screen";
import { useSignInFormClient } from "../_hooks/use-sign-in-form-client";

type SignInFormClientProps = ComponentProps<"div">;

function SignInFormClient(props: SignInFormClientProps) {
  const { goToRegister, goToForgotPassword } = useSignInFormClient();
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

export { SignInFormClient };
