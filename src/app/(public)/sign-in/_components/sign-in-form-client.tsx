"use client";
import type { ComponentProps } from "react";
import { FormProvider } from "react-hook-form";
import { GoogleSignInButtonClient } from "@/components/firebase/google-sign-in-button-client";
import { MultiFactorAssertionFlowClient } from "@/components/firebase/multi-factor-assertion-flow-client";
import { PoliciesSectionClient } from "@/components/firebase/policies-section-client";
import {
  SignInForm,
  SignInFormContent,
} from "@/components/firebase/sign-in-form";
import { SocialSignInSection } from "@/components/firebase/social-sign-in-section";
import { useSignInFormClient } from "../_hooks/use-sign-in-form-client";

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
          />
        </FormProvider>
      )}
    </SignInForm>
  );
}

export { SignInFormClient };
