"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useTranslations } from "next-intl";
import { GoogleSignInButtonClient } from "@/app/(public)/_components/firebase/google-sign-in-button-client";
import { Separator } from "@/components/ui/separator";

type SocialSignInSectionProps = useRender.ComponentProps<"div">;

function SocialSignInSection({ render, ...props }: SocialSignInSectionProps) {
  const t = useTranslations("Auth");
  const rendered = useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      {
        children: (
          <>
            <div className="relative my-2">
              <Separator />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-card px-2 text-xs text-muted-foreground uppercase">
                  {t("orSeparator")}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <GoogleSignInButtonClient />
            </div>
          </>
        ),
      },
      props,
    ),
    state: { slot: "social-sign-in-section" },
  });
  return process.env.NEXT_PUBLIC_FIREBASE_GOOGLE_ENABLED === "true"
    ? rendered
    : null;
}

export { SocialSignInSection };
