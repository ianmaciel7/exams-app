"use client";

import {
  type OAuthButtonProps,
  useSignInWithProvider,
  useUI,
} from "@firebase-oss/ui-react";
import { useId } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export type { OAuthButtonProps };

export function OAuthButton({
  provider,
  children,
  themed,
  onSignIn,
}: OAuthButtonProps) {
  const ui = useUI();
  const { error, callback } = useSignInWithProvider(provider, onSignIn);
  const isPending = ui.state !== "idle";
  const errorId = useId();

  return (
    <div>
      <Button
        type="button"
        disabled={isPending}
        aria-busy={isPending}
        focusableWhenDisabled
        aria-describedby={error ? errorId : undefined}
        onClick={callback}
        data-provider={provider.providerId}
        data-themed={themed}
        className="w-full"
        variant={themed ? "default" : "outline"}
      >
        {isPending ? (
          <>
            <Spinner data-icon="inline-start" aria-hidden="true" />
            {children}
          </>
        ) : (
          children
        )}
      </Button>
      {error ? (
        <Alert id={errorId} variant="destructive" className="mt-2">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
