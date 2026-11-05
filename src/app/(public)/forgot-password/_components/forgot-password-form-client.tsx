"use client";

import type { ComponentProps } from "react";
import { ForgotPasswordAuthScreen as ForgotPasswordAuthContent } from "@/components/firebase/forgot-password-auth-screen";
import { useForgotPasswordFormClient } from "../_hooks/use-forgot-password-form-client";

type ForgotPasswordFormClientProps = ComponentProps<"div">;

function ForgotPasswordFormClient(props: ForgotPasswordFormClientProps) {
  const { goToSignIn } = useForgotPasswordFormClient();
  return (
    <div data-slot="forgot-password-form" {...props}>
      <ForgotPasswordAuthContent onBackToSignInClick={goToSignIn} />
    </div>
  );
}

export { ForgotPasswordFormClient };
