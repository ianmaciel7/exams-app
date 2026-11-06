import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useTranslations } from "next-intl";
import { Form } from "@/components/ui/extensions/form";
import { FieldGroup } from "@/components/ui/field";
import { routes } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { AuthLink } from "../../_components/auth-link";
import { AuthSubmitSection } from "../../_components/auth-submit-section";
import { EmailField } from "../../_components/email-field";
import { PasswordField } from "../../_components/password-field";
import { SocialSignInSection } from "../../_components/social-sign-in-section";
import { DisplayNameField } from "./display-name-field";

type RegisterFormProps = useRender.ComponentProps<"div">;
function RegisterForm({ className, render, ...props }: RegisterFormProps) {
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      { className: cn("flex flex-col gap-4", className) },
      props,
    ),
    state: { slot: "register-form" },
  });
}
type RegisterFormContentProps = Omit<
  React.ComponentProps<typeof Form>,
  "children"
> & {
  next?: string | string[];
  rootError?: string;
  isPending: boolean;
  requireDisplayName: boolean;
};
function RegisterFormContent({
  next,
  rootError,
  isPending,
  requireDisplayName,
  onSubmit,
  className,
  ...props
}: RegisterFormContentProps) {
  const t = useTranslations("Auth");
  return (
    <>
      <Form
        {...props}
        onSubmit={onSubmit}
        className={cn("flex flex-col gap-4", className)}
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
          <AuthLink route={routes.signIn} next={next}>
            {t("signInTitle")}
          </AuthLink>
        </div>
      </Form>

      <SocialSignInSection />
    </>
  );
}

export { RegisterForm, RegisterFormContent };
