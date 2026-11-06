import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { AuthLink } from "@/components/firebase/auth-link";
import { AuthSubmitSection } from "@/components/firebase/auth-submit-section";
import { EmailField } from "@/components/firebase/email-field";
import { PasswordField } from "@/components/firebase/password-field";
import { Form } from "@/components/ui/extensions/form";
import { FieldGroup } from "@/components/ui/field";
import { routes } from "@/lib/navigation";
import { cn } from "@/lib/utils";

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
> & {
  next?: string | string[];
  rootError?: string;
  policies?: ReactNode;
  socialSignIn?: ReactNode;
  isPending: boolean;
};
function SignInFormContent({
  next,
  policies,
  socialSignIn,
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
          policies={policies}
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

      {socialSignIn}
    </>
  );
}

export { SignInForm, SignInFormContent };
