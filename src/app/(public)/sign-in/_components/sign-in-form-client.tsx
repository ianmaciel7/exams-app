"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { MultiFactorAuthAssertionForm } from "@/components/firebase/multi-factor-auth-assertion-form";
import { cn } from "@/lib/utils";
import { useSignInFormClient } from "../_hooks/use-sign-in-form-client";
import { SignInFormBody } from "./sign-in-form-body";

type SignInFormClientProps = useRender.ComponentProps<"div">;

function SignInFormClient({
  className,
  render,
  ...props
}: SignInFormClientProps) {
  const controller = useSignInFormClient();
  const rendered = useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      {
        className: cn("flex flex-col gap-4", className),
        children: <SignInFormBody {...controller} />,
      },
      props,
    ),
    state: { slot: "sign-in-form" },
  });
  return controller.isMfa ? <MultiFactorAuthAssertionForm /> : rendered;
}

export { SignInFormClient };
