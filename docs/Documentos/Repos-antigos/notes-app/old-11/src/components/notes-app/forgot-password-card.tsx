"use client";

import { getTranslation } from "@firebase-oss/ui-core";
import {
  type ForgotPasswordAuthScreenProps as FirebaseForgotPasswordAuthScreenProps,
  useUI,
} from "@firebase-oss/ui-react";
import type { ComponentProps } from "react";
import { AuthCard } from "@/components/notes-app/auth-card";
import { ForgotPasswordForm } from "@/components/notes-app/forgot-password-form";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ForgotPasswordCardProps = FirebaseForgotPasswordAuthScreenProps &
  Omit<ComponentProps<"div">, "children">;

function ForgotPasswordCard({
  onPasswordSent,
  onBackToSignInClick,
  ref,
  ...props
}: ForgotPasswordCardProps) {
  const ui = useUI();

  const titleText = getTranslation(ui, "labels", "resetPassword");
  const subtitleText = getTranslation(ui, "prompts", "enterEmailToReset");

  return (
    <AuthCard data-slot="forgot-password-card" ref={ref} {...props}>
      <CardHeader>
        <CardTitle>
          <h1>{titleText}</h1>
        </CardTitle>
        <CardDescription>{subtitleText}</CardDescription>
      </CardHeader>
      <CardContent>
        <ForgotPasswordForm
          onPasswordSent={onPasswordSent}
          onBackToSignInClick={onBackToSignInClick}
        />
      </CardContent>
    </AuthCard>
  );
}

export { ForgotPasswordCard, type ForgotPasswordCardProps };
