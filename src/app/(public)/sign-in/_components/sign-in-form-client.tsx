"use client";
import type { ComponentProps } from "react";
import { FormProvider } from "react-hook-form";
import { MultiFactorAssertionFlowClient } from "@/app/(public)/_components/firebase/multi-factor-assertion-flow-client";
import { useSignInFormClient } from "../_hooks/use-sign-in-form-client";
import { SignInForm, SignInFormContent } from "./sign-in-form";

type SignInFormClientProps = ComponentProps<typeof SignInForm> & {
  next?: string | string[];
};
function SignInFormClient({ next, ...props }: SignInFormClientProps) {
  const { rootError, form, isMfa, isPending, onSubmit } = useSignInFormClient();
  return (
    <SignInForm {...props}>
      {isMfa ? (
        <MultiFactorAssertionFlowClient />
      ) : (
        <FormProvider {...form}>
          <SignInFormContent
            next={next}
            rootError={rootError}
            isPending={isPending}
            onSubmit={form.handleSubmit(onSubmit)}
          />
        </FormProvider>
      )}
    </SignInForm>
  );
}

export { SignInFormClient };
