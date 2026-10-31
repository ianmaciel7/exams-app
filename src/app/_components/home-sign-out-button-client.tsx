"use client";

import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { useHomeSignOutButtonClient } from "../_hooks/use-home-sign-out-button-client";

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
        aria-describedby={isError ? errorId : undefined}
        className="h-12 w-full rounded-full px-5 text-base font-medium md:w-[158px]"
      >
        {isPending && <Spinner data-icon="inline-start" aria-hidden="true" />}
        {isPending ? t("signingOut") : auth("signOut")}
      </Button>
      {isError && (
        <p
          id={errorId}
          role="alert"
          className="max-w-xs text-sm text-destructive"
        >
          {t("signOutError")}
        </p>
      )}
    </div>
  );
}

export { HomeSignOutButtonClient };
