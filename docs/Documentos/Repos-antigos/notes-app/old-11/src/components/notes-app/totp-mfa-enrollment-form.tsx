"use client";

import { useUI } from "@firebase-oss/ui-react";
import type { TotpSecret } from "firebase/auth";
import type { ComponentProps } from "react";
import { useState } from "react";
import { TotpMfaSecretForm } from "@/components/notes-app/totp-mfa-secret-form";
import { TotpMfaVerifyForm } from "@/components/notes-app/totp-mfa-verify-form";
import { FieldGroup } from "@/components/ui/field";
import { cn } from "@/lib/utils";

type TotpMfaEnrollmentFormProps = ComponentProps<typeof FieldGroup> & {
  onSuccess?: () => void;
};

function TotpMfaEnrollmentForm({
  onSuccess,
  className,
  ...props
}: TotpMfaEnrollmentFormProps) {
  const ui = useUI();

  const [enrollment, setEnrollment] = useState<{
    secret: TotpSecret;
    displayName: string;
  } | null>(null);

  if (!ui.auth.currentUser) {
    throw new Error(
      "User must be authenticated to enroll with multi-factor authentication"
    );
  }

  return (
    <FieldGroup
      data-slot="totp-mfa-enrollment-form"
      {...props}
      className={cn(className)}
    >
      {!enrollment ? (
        <TotpMfaSecretForm
          onSubmit={(secret, displayName) =>
            setEnrollment({ secret, displayName })
          }
        />
      ) : (
        <TotpMfaVerifyForm
          {...enrollment}
          onSuccess={() => {
            onSuccess?.();
          }}
        />
      )}
    </FieldGroup>
  );
}

export { TotpMfaEnrollmentForm, type TotpMfaEnrollmentFormProps };
