"use client";

import type { ComponentProps } from "react";
import { GoogleSignInButton } from "@/components/firebase/google-sign-in-button";
import { SignUpAuthScreen as SignUpAuthContent } from "@/components/firebase/sign-up-auth-screen";
import { useRegisterClient } from "../_hooks/use-register-client";

type RegisterClientProps = ComponentProps<"div">;

function RegisterClient(props: RegisterClientProps) {
  const { goToSignIn } = useRegisterClient();
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

export { RegisterClient };
