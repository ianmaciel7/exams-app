"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useTranslations } from "next-intl";
import { FormProvider } from "react-hook-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form } from "@/components/ui/extensions/form";
import { FieldGroup } from "@/components/ui/field";
import { routes } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { AuthLink } from "../../_components/auth-link";
import { AuthSubmitSection } from "../../_components/auth-submit-section";
import { EmailField } from "../../_components/email-field";
import { useForgotPasswordFormClient } from "../_hooks/use-forgot-password-form-client";

type ForgotPasswordFormClientProps = useRender.ComponentProps<"div"> & {
  next?: string | string[];
};

function ForgotPasswordFormClient({
  next,
  className,
  render,
  ...props
}: ForgotPasswordFormClientProps) {
  const t = useTranslations("Auth");
  const { rootError, emailSent, form, isPending, onSubmit } =
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
            <AuthLink route={routes.signIn} next={next}>
              {t("backToSignIn")}
            </AuthLink>
          </>
        ),
      },
      props,
    ),
    state: { slot: "forgot-password-form" },
  });
}

export { ForgotPasswordFormClient };
