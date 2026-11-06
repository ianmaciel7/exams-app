"use client";

import type { ComponentProps } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { useSignOutButtonClient } from "../_hooks/use-sign-out-button-client";
import { welcomeHeroActionSize } from "./welcome-hero";

type SignOutButtonClientProps = ComponentProps<"div">;

function SignOutButtonClient({
  className,
  ...props
}: SignOutButtonClientProps) {
  const { t, auth, isPending, isError, handleSignOut } =
    useSignOutButtonClient();
  const errorId = "sign-out-error";

  return (
    <div
      data-slot="sign-out-button"
      {...props}
      className={cn("flex w-full flex-col gap-2 sm:w-auto", className)}
    >
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
        {isPending && <Spinner data-icon="inline-start" aria-hidden="true" />}
        {isPending ? t("signingOut") : auth("signOut")}
      </Button>
      {isError && (
        <Alert id={errorId} variant="destructive" className="max-w-xs">
          <AlertDescription>{t("signOutError")}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

export { SignOutButtonClient };
