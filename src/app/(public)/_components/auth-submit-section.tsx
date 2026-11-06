"use client";

import type { ComponentProps } from "react";
import { useFormContext } from "react-hook-form";
import { Policies } from "@/components/firebase/policies";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/extensions/form-error";
import { Spinner } from "@/components/ui/spinner";

type AuthSubmitSectionProps = ComponentProps<"div"> & {
  isPending: boolean;
  submitLabel: string;
};

function AuthSubmitSection({
  isPending,
  submitLabel,
  ...props
}: AuthSubmitSectionProps) {
  const { formState } = useFormContext();
  return (
    <div
      data-slot="auth-submit-section"
      className="flex flex-col gap-4"
      {...props}
    >
      <Policies />
      <Button type="submit" disabled={isPending} focusableWhenDisabled>
        {isPending ? (
          <Spinner data-icon="inline-start" aria-hidden="true" />
        ) : null}
        {submitLabel}
      </Button>
      {formState.errors.root ? (
        <FormError>{formState.errors.root.message}</FormError>
      ) : null}
    </div>
  );
}

export { AuthSubmitSection };
