"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { useSignOutButtonClient } from "../_hooks/use-sign-out-button-client";
import { welcomeHeroActionSize } from "./welcome-hero";

type SignOutButtonClientProps = useRender.ComponentProps<"div">;

function SignOutButtonClient({
  className,
  render,
  ...props
}: SignOutButtonClientProps) {
  const { t, auth, isPending, isError, handleSignOut } =
    useSignOutButtonClient();
  const errorId = "sign-out-error";

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      {
        className: cn("flex w-full flex-col gap-2 sm:w-auto", className),
        children: (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={handleSignOut}
              disabled={isPending}
              aria-busy={isPending}
              focusableWhenDisabled
              aria-describedby={isError ? errorId : undefined}
              className={welcomeHeroActionSize}
            >
              {isPending && (
                <Spinner data-icon="inline-start" aria-hidden="true" />
              )}
              {isPending ? t("signingOut") : auth("signOut")}
            </Button>
            {isError && (
              <Alert id={errorId} variant="destructive" className="max-w-xs">
                <AlertDescription>{t("signOutError")}</AlertDescription>
              </Alert>
            )}
          </>
        ),
      },
      props,
    ),
    state: { slot: "sign-out-button" },
  });
}

export { SignOutButtonClient };
