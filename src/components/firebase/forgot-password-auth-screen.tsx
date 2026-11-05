"use client";

import { getTranslation } from "@firebase-oss/ui-core";
import {
  type ForgotPasswordAuthScreenProps,
  useUI,
} from "@firebase-oss/ui-react";
import { ForgotPasswordAuthForm } from "@/components/firebase/forgot-password-auth-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export type { ForgotPasswordAuthScreenProps };

export function ForgotPasswordAuthScreen(props: ForgotPasswordAuthScreenProps) {
  const ui = useUI();

  const titleText = getTranslation(ui, "labels", "resetPassword");
  const subtitleText = getTranslation(ui, "prompts", "enterEmailToReset");

  return (
    <div className="max-w-sm mx-auto">
      <Card>
        <CardHeader>
          <CardTitle role="heading" aria-level={1}>
            {titleText}
          </CardTitle>
          <CardDescription>{subtitleText}</CardDescription>
        </CardHeader>
        <CardContent>
          <ForgotPasswordAuthForm {...props} />
        </CardContent>
      </Card>
    </div>
  );
}
