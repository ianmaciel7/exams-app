"use client";

import type { ComponentProps } from "react";
import { GoogleSignInButton } from "@/components/firebase/google-sign-in-button";
import { SignUpAuthScreen as SignUpAuthContent } from "@/components/firebase/sign-up-auth-screen";
import { useRegisterAuthFlowClient } from "../_hooks/use-register-auth-flow-client";

type RegisterAuthFlowClientProps = ComponentProps<"div">;

function RegisterAuthFlowClient(props: RegisterAuthFlowClientProps) {
  const { goToSignIn } = useRegisterAuthFlowClient();
  return (
    <div {...props}>
      <SignUpAuthContent onSignInClick={goToSignIn}>
        {process.env.NEXT_PUBLIC_FIREBASE_GOOGLE_ENABLED === "true" ? (
          <GoogleSignInButton />
        ) : null}
      </SignUpAuthContent>
    </div>
  );
}

export { RegisterAuthFlowClient };
