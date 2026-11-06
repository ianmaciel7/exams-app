"use client";

import { useTranslations } from "next-intl";
import type { ComponentProps } from "react";
import { FormProvider } from "react-hook-form";
import { MultiFactorAuthAssertionForm } from "@/components/firebase/multi-factor-auth-assertion-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/extensions/form";
import { FieldGroup } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { AuthSubmitSection } from "../../_components/auth-submit-section";
import { EmailField } from "../../_components/email-field";
import { PasswordField } from "../../_components/password-field";
import { SocialSignInSection } from "../../_components/social-sign-in-section";
import { useSignInFormClient } from "../_hooks/use-sign-in-form-client";

type SignInFormClientProps = ComponentProps<"div">;

function SignInFormClient({ className, ...props }: SignInFormClientProps) {
  const t = useTranslations("Auth");
  const { form, goToForgotPassword, goToRegister, isMfa, isPending, onSubmit } =
    useSignInFormClient();

  if (isMfa) return <MultiFactorAuthAssertionForm />;

  return (
    <div
      data-slot="sign-in-form"
      className={cn("flex flex-col gap-4", className)}
      {...props}
    >
      <FormProvider {...form}>
        <Form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <FieldGroup>
            <EmailField autoComplete="username" />
            <PasswordField
              autoComplete="current-password"
              labelAction={
                <Button
                  type="button"
                  variant="link"
                  size="xs"
                  onClick={goToForgotPassword}
                >
                  {t("forgotPasswordPrompt")}
                </Button>
              }
            />
          </FieldGroup>
          <AuthSubmitSection
            isPending={isPending}
            submitLabel={t("signInTitle")}
          />
          <div className="text-center text-xs text-muted-foreground">
            {t("noAccountPrompt")}{" "}
            <Button
              type="button"
              variant="link"
              size="xs"
              onClick={goToRegister}
            >
              {t("registerTitle")}
            </Button>
          </div>
        </Form>
      </FormProvider>
      <SocialSignInSection />
    </div>
  );
}

export { SignInFormClient };
