"use client";

import {
  useUI,
  type OAuthButtonProps,
  useSignInWithProvider,
} from "@firebase-oss/ui-react";
import { useId } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export type { OAuthButtonProps };

export function OAuthButton({ provider, children, themed, onSignIn }: OAuthButtonProps) {
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
        aria-describedby={error ? errorId : undefined}
        onClick={callback}
        data-provider={provider.providerId}
        data-themed={themed}
        className="w-full"
        variant={themed ? "default" : "outline"}
      >
        {isPending ? (
          <><Spinner data-icon="inline-start" aria-hidden="true" />{children}</>
        ) : (
          children
        )}
      </Button>
      {error ? (
        <div
          id={errorId}
          role="alert"
          className="text-left text-xs text-destructive"
        >
          {error}
        </div>
      ) : null}
    </div>
  );
}
