"use client";

import type { ComponentProps } from "react";
import { GoogleSignInButton } from "@/components/firebase/google-sign-in-button";
import { SignInAuthScreen as SignInAuthContent } from "@/components/firebase/sign-in-auth-screen";
import { useSignInAuthFlowClient } from "../_hooks/use-sign-in-auth-flow-client";

type SignInAuthFlowClientProps = ComponentProps<"div">;

function SignInAuthFlowClient(props: SignInAuthFlowClientProps) {
  const { goToRegister, goToForgotPassword } = useSignInAuthFlowClient();
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

export { SignInAuthFlowClient };
