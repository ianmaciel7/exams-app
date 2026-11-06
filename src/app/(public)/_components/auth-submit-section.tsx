"use client";

import type { ComponentProps } from "react";
import { Policies } from "@/components/firebase/policies";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/extensions/form-error";
import { Spinner } from "@/components/ui/spinner";

type AuthSubmitSectionProps = ComponentProps<"div"> & {
  error?: string;
  isPending: boolean;
  submitLabel: string;
};

function AuthSubmitSection({
  error,
  isPending,
  submitLabel,
  ...props
}: AuthSubmitSectionProps) {
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
      {error ? <FormError>{error}</FormError> : null}
    </div>
  );
}

export { AuthSubmitSection };
