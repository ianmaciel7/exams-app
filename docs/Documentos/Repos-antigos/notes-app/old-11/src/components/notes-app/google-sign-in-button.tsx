"use client";

import { getTranslation } from "@firebase-oss/ui-core";
import { GoogleLogo, useUI } from "@firebase-oss/ui-react";
import { useTranslations } from "next-intl";
import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type GoogleSignInButtonProps = Omit<
  ComponentProps<typeof Button>,
  "children"
> & {
  label?: string;
};

function GoogleSignInButton({
  label: customLabel,
  className,
  ...props
}: GoogleSignInButtonProps) {
  const ui = useUI();
  const t = useTranslations("auth");
  const label =
    customLabel ||
    getTranslation(ui, "labels", "signInWithGoogle") ||
    t("signInWithGoogle");

  return (
    <Button
      data-slot="google-sign-in-button"
      data-testid="google-sign-in-button"
      type="button"
      variant="outline"
      size="lg"
      {...props}
      className={cn("w-full", className)}
    >
      <GoogleLogo data-icon="inline-start" />
      {label}
    </Button>
  );
}

export { GoogleSignInButton, type GoogleSignInButtonProps };
