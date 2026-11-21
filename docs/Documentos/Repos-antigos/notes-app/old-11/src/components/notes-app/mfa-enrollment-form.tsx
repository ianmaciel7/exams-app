"use client";

import { getTranslation } from "@firebase-oss/ui-core";
import { useUI } from "@firebase-oss/ui-react";
import { FactorId } from "firebase/auth";
import type { ComponentProps } from "react";
import { useState } from "react";

import { SmsMfaEnrollmentForm } from "@/components/notes-app/sms-mfa-enrollment-form";
import { TotpMfaEnrollmentForm } from "@/components/notes-app/totp-mfa-enrollment-form";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { cn } from "@/lib/utils";

type Hint = (typeof FactorId)[keyof typeof FactorId];

type MfaEnrollmentFormProps = ComponentProps<typeof FieldGroup> & {
  onEnrollment?: () => void;
  hints?: Hint[];
};

const DEFAULT_HINTS = [FactorId.TOTP, FactorId.PHONE] as const;

function MfaEnrollmentForm({
  onEnrollment,
  hints: hintsProp,
  className,
  ...props
}: MfaEnrollmentFormProps) {
  const ui = useUI();
  const hints = hintsProp ?? DEFAULT_HINTS;

  if (hints.length === 0) {
    throw new Error("MfaEnrollmentForm must have at least one hint");
  }

  // If only a single hint is provided, select it by default to improve UX.
  const [hint, setHint] = useState<Hint | undefined>(
    hints.length === 1 ? hints[0] : undefined
  );

  if (hint) {
    if (hint === FactorId.TOTP) {
      return (
        <TotpMfaEnrollmentForm
          onSuccess={onEnrollment}
          {...props}
          className={className}
        />
      );
    }

    if (hint === FactorId.PHONE) {
      return (
        <SmsMfaEnrollmentForm
          onSuccess={onEnrollment}
          {...props}
          className={className}
        />
      );
    }

    throw new Error(`Unknown multi-factor enrollment type: ${hint}`);
  }

  return (
    <FieldGroup
      data-slot="mfa-enrollment-form"
      {...props}
      className={cn("gap-2", className)}
    >
      {hints.map((hint) => {
        if (hint === FactorId.TOTP) {
          return (
            <Button key={hint} onClick={() => setHint(hint)} variant="outline">
              {getTranslation(ui, "labels", "mfaTotpVerification")}
            </Button>
          );
        }

        if (hint === FactorId.PHONE) {
          return (
            <Button key={hint} onClick={() => setHint(hint)} variant="outline">
              {getTranslation(ui, "labels", "mfaSmsVerification")}
            </Button>
          );
        }

        return null;
      })}
    </FieldGroup>
  );
}

export { MfaEnrollmentForm, type MfaEnrollmentFormProps };
