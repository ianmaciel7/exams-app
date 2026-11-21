"use client";

import { getTranslation } from "@firebase-oss/ui-core";
import {
  type MultiFactorAuthEnrollmentFormProps as FirebaseMultiFactorAuthEnrollmentFormProps,
  useUI,
} from "@firebase-oss/ui-react";
import type { ComponentProps } from "react";
import { AuthCard } from "@/components/notes-app/auth-card";
import { MfaEnrollmentForm } from "@/components/notes-app/mfa-enrollment-form";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type MfaEnrollmentCardProps = FirebaseMultiFactorAuthEnrollmentFormProps &
  Omit<ComponentProps<"div">, "children">;

function MfaEnrollmentCard({ ...props }: MfaEnrollmentCardProps) {
  const ui = useUI();

  const titleText = getTranslation(ui, "labels", "multiFactorEnrollment");
  const subtitleText = getTranslation(ui, "prompts", "mfaEnrollmentPrompt");

  return (
    <AuthCard data-slot="mfa-enrollment-card" {...props}>
      <CardHeader>
        <CardTitle>
          <h1>{titleText}</h1>
        </CardTitle>
        <CardDescription>{subtitleText}</CardDescription>
      </CardHeader>
      <CardContent>
        <MfaEnrollmentForm {...props} />
      </CardContent>
    </AuthCard>
  );
}

type MultiFactorAuthEnrollmentFormProps = MfaEnrollmentCardProps;

export {
  MfaEnrollmentCard,
  type MfaEnrollmentCardProps,
  type MultiFactorAuthEnrollmentFormProps,
};
