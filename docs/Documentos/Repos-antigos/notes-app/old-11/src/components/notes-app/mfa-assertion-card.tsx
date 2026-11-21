"use client";

import { getTranslation } from "@firebase-oss/ui-core";
import {
  type MultiFactorAuthAssertionScreenProps as FirebaseMultiFactorAuthAssertionScreenProps,
  useUI,
} from "@firebase-oss/ui-react";
import type { ComponentProps } from "react";
import { AuthCard } from "@/components/notes-app/auth-card";
import { MfaAssertionForm } from "@/components/notes-app/mfa-assertion-form";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type MfaAssertionCardProps = FirebaseMultiFactorAuthAssertionScreenProps &
  Omit<ComponentProps<"div">, "children">;

function MfaAssertionCard({ ...props }: MfaAssertionCardProps) {
  const ui = useUI();

  const titleText = getTranslation(ui, "labels", "multiFactorAssertion");
  const subtitleText = getTranslation(ui, "prompts", "mfaAssertionPrompt");

  return (
    <AuthCard data-slot="mfa-assertion-card" {...props}>
      <CardHeader>
        <CardTitle>
          <h1>{titleText}</h1>
        </CardTitle>
        <CardDescription>{subtitleText}</CardDescription>
      </CardHeader>
      <CardContent>
        <MfaAssertionForm {...props} />
      </CardContent>
    </AuthCard>
  );
}

export { MfaAssertionCard, type MfaAssertionCardProps };
