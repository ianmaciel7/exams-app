"use client";

import type { ComponentProps } from "react";
import { GoogleSignInButton } from "@/components/firebase/google-sign-in-button";
import { SignUpAuthScreen as SignUpAuthContent } from "@/components/firebase/sign-up-auth-screen";
import { useRegisterFormClient } from "../_hooks/use-register-form-client";

type RegisterFormClientProps = ComponentProps<"div">;

function RegisterFormClient(props: RegisterFormClientProps) {
  const { goToSignIn } = useRegisterFormClient();
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

export { RegisterFormClient };
