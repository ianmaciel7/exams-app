"use client";

import type { ComponentProps } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { useHomeSignOutButtonClient } from "../_hooks/use-home-sign-out-button-client";
import { homeHeroActionSize } from "./home-hero";

type HomeSignOutButtonClientProps = ComponentProps<"div">;

function HomeSignOutButtonClient({
  className,
  ...props
}: HomeSignOutButtonClientProps) {
  const { t, auth, state, handleSignOut } = useHomeSignOutButtonClient();
  const isPending = state === "pending";
  const isError = state === "error";
  const errorId = "home-sign-out-error";

  return (
    <div
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
        className={homeHeroActionSize}
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

export { HomeSignOutButtonClient };
