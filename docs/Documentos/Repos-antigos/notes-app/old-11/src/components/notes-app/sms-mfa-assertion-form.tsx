"use client";

import type { MultiFactorInfo, UserCredential } from "firebase/auth";
import type { ComponentProps } from "react";
import { useState } from "react";
import { SmsMultiFactorAssertionPhoneForm } from "@/components/notes-app/sms-multi-factor-assertion-phone-form";
import { SmsMultiFactorAssertionVerifyForm } from "@/components/notes-app/sms-multi-factor-assertion-verify-form";
import { FieldGroup } from "@/components/ui/field";
import { cn } from "@/lib/utils";

type SmsMfaAssertionFormProps = ComponentProps<typeof FieldGroup> & {
  hint: MultiFactorInfo;
  onSuccess?: (credential: UserCredential) => void;
};

function SmsMfaAssertionForm({
  hint,
  onSuccess,
  className,
  ...props
}: SmsMfaAssertionFormProps) {
  const [verification, setVerification] = useState<{
    verificationId: string;
  } | null>(null);

  return (
    <FieldGroup
      data-slot="sms-mfa-assertion-form"
      {...props}
      className={cn(className)}
    >
      {!verification ? (
        <SmsMultiFactorAssertionPhoneForm
          hint={hint}
          onSubmit={(verificationId) => setVerification({ verificationId })}
        />
      ) : (
        <SmsMultiFactorAssertionVerifyForm
          verificationId={verification.verificationId}
          onSuccess={(credential) => {
            onSuccess?.(credential);
          }}
        />
      )}
    </FieldGroup>
  );
}

export { SmsMfaAssertionForm, type SmsMfaAssertionFormProps };
