"use client";
import type { ComponentProps } from "react";
import { FormProvider } from "react-hook-form";
import { GoogleSignInButtonClient } from "@/app/(public)/_components/firebase/google-sign-in-button-client";
import { MultiFactorAssertionFlowClient } from "@/app/(public)/_components/firebase/multi-factor-assertion-flow-client";
import { PoliciesSectionClient } from "@/app/(public)/_components/firebase/policies-section-client";
import {
  RegisterForm,
  RegisterFormContent,
} from "@/components/firebase/register-form";
import { SocialSignInSection } from "@/components/firebase/social-sign-in-section";
import { useRegisterFormClient } from "../_hooks/use-register-form-client";

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
            policies={<PoliciesSectionClient />}
            socialSignIn={
              <SocialSignInSection
                enabled={
                  process.env.NEXT_PUBLIC_FIREBASE_GOOGLE_ENABLED === "true"
                }
                providerButton={<GoogleSignInButtonClient />}
              />
            }
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
