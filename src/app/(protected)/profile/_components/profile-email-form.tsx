"use client";

import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/extensions/form";
import {
  FormField,
  FormFieldError,
  FormFieldLabel,
} from "@/components/ui/extensions/form-field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { useProfileEmailForm } from "../_hooks/use-profile-email-form";

type ProfileEmailFormProps = Omit<
  ComponentProps<typeof Form>,
  "action" | "onSubmit"
> & {
  email: string;
  /** Injected by the container; the form does not know how the change is sent. */
  changeEmail: (email: string) => Promise<void>;
};

function ProfileEmailForm({
  email,
  changeEmail,
  className,
  ...props
}: ProfileEmailFormProps) {
  const { t, dispatch, pending } = useProfileEmailForm(changeEmail);

  return (
    <Form
      {...props}
      action={dispatch}
      validationMode="onBlur"
      className={cn("w-full", className)}
    >
      <FormField name="newEmail">
        <FormFieldLabel>{t("newEmailLabel")}</FormFieldLabel>
        <Input
          readOnly={pending}
          name="newEmail"
          defaultValue={email}
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          required
          maxLength={254}
        />
        <FormFieldError match="valueMissing">
          {t("emailRequired")}
        </FormFieldError>
        <FormFieldError match="typeMismatch">
          {t("emailInvalid")}
        </FormFieldError>
      </FormField>
      <Button
        type="submit"
        variant="outline"
        className="mt-2 w-full"
        disabled={pending}
        focusableWhenDisabled
      >
        {pending && <Spinner data-icon="inline-start" aria-hidden="true" />}
        {t(pending ? "changingEmail" : "changeEmail")}
      </Button>
    </Form>
  );
}

export { ProfileEmailForm };
