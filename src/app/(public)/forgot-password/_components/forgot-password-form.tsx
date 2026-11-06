import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useTranslations } from "next-intl";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form } from "@/components/ui/extensions/form";
import { FieldGroup } from "@/components/ui/field";
import { routes } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { AuthLink } from "../../_components/auth-link";
import { AuthSubmitSection } from "../../_components/auth-submit-section";
import { EmailField } from "../../_components/email-field";

type ForgotPasswordFormProps = useRender.ComponentProps<"div">;
function ForgotPasswordForm({
  className,
  render,
  ...props
}: ForgotPasswordFormProps) {
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      { className: cn("flex flex-col gap-4", className) },
      props,
    ),
    state: { slot: "forgot-password-form" },
  });
}
type ForgotPasswordFormContentProps = Omit<
  React.ComponentProps<typeof Form>,
  "children"
> & {
  next?: string | string[];
  rootError?: string;
  isPending: boolean;
  emailSent: boolean;
};
function ForgotPasswordFormContent({
  next,
  rootError,
  isPending,
  emailSent,
  onSubmit,
  className,
  ...props
}: ForgotPasswordFormContentProps) {
  const t = useTranslations("Auth");
  return (
    <>
      {emailSent ? (
        <Alert role="status">
          <AlertDescription>{t("resetEmailSent")}</AlertDescription>
        </Alert>
      ) : (
        <Form
          {...props}
          onSubmit={onSubmit}
          className={cn("flex flex-col gap-4", className)}
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
      )}
      <AuthLink route={routes.signIn} next={next}>
        {t("backToSignIn")}
      </AuthLink>
    </>
  );
}

export { ForgotPasswordForm, ForgotPasswordFormContent };
