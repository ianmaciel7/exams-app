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

type SignInFormProps = useRender.ComponentProps<"div">;
function SignInForm({ className, render, ...props }: SignInFormProps) {
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      { className: cn("flex flex-col gap-4", className) },
      props,
    ),
    state: { slot: "sign-in-form" },
  });
}
type SignInFormContentProps = Omit<
  React.ComponentProps<typeof Form>,
  "children"
> & { next?: string | string[]; rootError?: string; isPending: boolean };
function SignInFormContent({
  next,
  rootError,
  isPending,
  onSubmit,
  className,
  ...props
}: SignInFormContentProps) {
  const t = useTranslations("Auth");
  return (
    <>
      <Form
        {...props}
        onSubmit={onSubmit}
        className={cn("flex flex-col gap-4", className)}
      >
        <FieldGroup>
          <EmailField autoComplete="username" />
          <PasswordField
            autoComplete="current-password"
            labelAction={
              <AuthLink route={routes.forgotPassword} next={next}>
                {t("forgotPasswordPrompt")}
              </AuthLink>
            }
          />
        </FieldGroup>
        <AuthSubmitSection
          error={rootError}
          isPending={isPending}
          submitLabel={t("signInTitle")}
        />
        <div className="text-center text-xs text-muted-foreground">
          {t("noAccountPrompt")}{" "}
          <AuthLink route={routes.register} next={next}>
            {t("registerTitle")}
          </AuthLink>
        </div>
      </Form>

      <SocialSignInSection />
    </>
  );
}

export { SignInForm, SignInFormContent };
