"use client";

import type { ComponentProps } from "react";
import { ForgotPasswordAuthScreen as ForgotPasswordAuthContent } from "@/components/firebase/forgot-password-auth-screen";
import { useForgotPasswordAuthFlowClient } from "../_hooks/use-forgot-password-auth-flow-client";

type ForgotPasswordAuthFlowClientProps = ComponentProps<"div">;

function ForgotPasswordAuthFlowClient(
  props: ForgotPasswordAuthFlowClientProps,
) {
  const { goToSignIn } = useForgotPasswordAuthFlowClient();
  return (
    <div {...props}>
      <ForgotPasswordAuthContent onBackToSignInClick={goToSignIn} />
    </div>
  );
}

export { ForgotPasswordAuthFlowClient };
