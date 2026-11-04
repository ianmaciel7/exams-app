"use client";

import type { ComponentProps } from "react";
import { ForgotPasswordAuthScreen as ForgotPasswordAuthContent } from "@/components/firebase/forgot-password-auth-screen";
import { useForgotPasswordClient } from "../_hooks/use-forgot-password-client";

type ForgotPasswordClientProps = ComponentProps<"div">;

function ForgotPasswordClient(props: ForgotPasswordClientProps) {
  const { goToSignIn } = useForgotPasswordClient();
  return (
    <div {...props}>
      <ForgotPasswordAuthContent onBackToSignInClick={goToSignIn} />
    </div>
  );
}

export { ForgotPasswordClient };
