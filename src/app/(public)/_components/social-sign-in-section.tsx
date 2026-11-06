"use client";

import { useTranslations } from "next-intl";
import type { ComponentProps } from "react";
import { GoogleSignInButton } from "@/components/firebase/google-sign-in-button";
import { Separator } from "@/components/ui/separator";

type SocialSignInSectionProps = ComponentProps<"div">;

function SocialSignInSection(props: SocialSignInSectionProps) {
  const t = useTranslations("Auth");
  return process.env.NEXT_PUBLIC_FIREBASE_GOOGLE_ENABLED === "true" ? (
    <div data-slot="social-sign-in-section" {...props}>
      <div className="relative my-2">
        <Separator />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="bg-card px-2 text-xs text-muted-foreground uppercase">
            {t("orSeparator")}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <GoogleSignInButton />
      </div>
    </div>
  ) : null;
}

export { SocialSignInSection };
