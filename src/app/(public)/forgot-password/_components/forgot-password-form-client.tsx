"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useTranslations } from "next-intl";
import { FormProvider } from "react-hook-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/extensions/form";
import { FieldGroup } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { AuthSubmitSection } from "../../_components/auth-submit-section";
import { EmailField } from "../../_components/email-field";
import { useForgotPasswordFormClient } from "../_hooks/use-forgot-password-form-client";

type ForgotPasswordFormClientProps = useRender.ComponentProps<"div">;

function ForgotPasswordFormClient({
  className,
  render,
  ...props
}: ForgotPasswordFormClientProps) {
  const t = useTranslations("Auth");
  const { rootError, emailSent, form, goToSignIn, isPending, onSubmit } =
    useForgotPasswordFormClient();

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      {
        className: cn("flex flex-col gap-4", className),
        children: (
          <>
            {emailSent ? (
              <Alert role="status">
                <AlertDescription>{t("resetEmailSent")}</AlertDescription>
              </Alert>
            ) : (
              <FormProvider {...form}>
                <Form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="flex flex-col gap-4"
                >
                  <FieldGroup>
                    <EmailField autoComplete="email" />
                  </FieldGroup>
                  <AuthSubmitSection
                    error={rootError}
                    isPending={isPending}
                    submitLabel={t("forgotPasswordTitle")}
                  />
                </Form>
              </FormProvider>
            )}
            <Button type="button" variant="link" size="xs" onClick={goToSignIn}>
              {t("backToSignIn")}
            </Button>
          </>
        ),
      },
      props,
    ),
    state: { slot: "forgot-password-form" },
  });
}

export { ForgotPasswordFormClient };
