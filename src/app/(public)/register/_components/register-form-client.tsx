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
import { useRegisterFormClient } from "../_hooks/use-register-form-client";
import { DisplayNameField } from "./display-name-field";

type RegisterFormClientProps = ComponentProps<"div">;

function RegisterFormClient({ className, ...props }: RegisterFormClientProps) {
  const t = useTranslations("Auth");
  const {
    rootError,
    form,
    goToSignIn,
    isMfa,
    isPending,
    onSubmit,
    requireDisplayName,
  } = useRegisterFormClient();

  if (isMfa) return <MultiFactorAuthAssertionForm />;

  return (
    <div
      data-slot="register-form"
      className={cn("flex flex-col gap-4", className)}
      {...props}
    >
      <FormProvider {...form}>
        <Form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          <FieldGroup>
            {requireDisplayName ? <DisplayNameField /> : null}
            <EmailField autoComplete="email" />
            <PasswordField autoComplete="new-password" />
          </FieldGroup>
          <AuthSubmitSection
            error={rootError}
            isPending={isPending}
            submitLabel={t("registerTitle")}
          />
          <div className="text-center text-xs text-muted-foreground">
            {t("alreadyHaveAccount")}{" "}
            <Button type="button" variant="link" size="xs" onClick={goToSignIn}>
              {t("signInTitle")}
            </Button>
          </div>
        </Form>
      </FormProvider>
      <SocialSignInSection />
    </div>
  );
}

export { RegisterFormClient };
