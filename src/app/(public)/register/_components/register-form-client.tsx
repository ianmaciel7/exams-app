"use client";
import type { ComponentProps } from "react";
import { FormProvider } from "react-hook-form";
import { MultiFactorAssertionFlowClient } from "@/app/(public)/_components/firebase/multi-factor-assertion-flow-client";
import { useRegisterFormClient } from "../_hooks/use-register-form-client";
import { RegisterForm, RegisterFormContent } from "./register-form";

type RegisterFormClientProps = ComponentProps<typeof RegisterForm> & {
  next?: string | string[];
};
function RegisterFormClient({ next, ...props }: RegisterFormClientProps) {
  const { rootError, form, isMfa, isPending, onSubmit, requireDisplayName } =
    useRegisterFormClient();
  return (
    <RegisterForm {...props}>
      {isMfa ? (
        <MultiFactorAssertionFlowClient />
      ) : (
        <FormProvider {...form}>
          <RegisterFormContent
            next={next}
            rootError={rootError}
            isPending={isPending}
            onSubmit={form.handleSubmit(onSubmit)}
            requireDisplayName={requireDisplayName}
          />
        </FormProvider>
      )}
    </RegisterForm>
  );
}

export { RegisterFormClient };
