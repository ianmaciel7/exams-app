"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useTranslations } from "next-intl";
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

type RegisterFormClientProps = useRender.ComponentProps<"div">;

function RegisterFormClient({
  className,
  render,
  ...props
}: RegisterFormClientProps) {
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

  const rendered = useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      {
        className: cn("flex flex-col gap-4", className),
        children: (
          <>
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
                  <Button
                    type="button"
                    variant="link"
                    size="xs"
                    onClick={goToSignIn}
                  >
                    {t("signInTitle")}
                  </Button>
                </div>
              </Form>
            </FormProvider>
            <SocialSignInSection />
          </>
        ),
      },
      props,
    ),
    state: { slot: "register-form" },
  });
  return isMfa ? <MultiFactorAuthAssertionForm /> : rendered;
}

export { RegisterFormClient };
