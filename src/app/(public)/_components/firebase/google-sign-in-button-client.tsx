"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { GoogleLogo } from "@firebase-oss/ui-react";
import { useId } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useGoogleSignInButtonClient } from "../../_hooks/use-google-sign-in-button-client";

type GoogleSignInButtonClientProps = useRender.ComponentProps<"div">;

function GoogleSignInButtonClient({
  render,
  ...props
}: GoogleSignInButtonClientProps) {
  const { callback, error, isPending, label, providerId } =
    useGoogleSignInButtonClient();
  const errorId = useId();

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      {
        children: (
          <>
            <Button
              type="button"
              disabled={isPending}
              aria-busy={isPending}
              focusableWhenDisabled
              aria-describedby={error ? errorId : undefined}
              onClick={callback}
              data-provider={providerId}
              className="w-full"
              variant="outline"
            >
              {isPending ? (
                <Spinner data-icon="inline-start" aria-hidden="true" />
              ) : null}
              <GoogleLogo />
              <span>{label}</span>
            </Button>
            {error ? (
              <Alert id={errorId} variant="destructive" className="mt-2">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}
          </>
        ),
      },
      props,
    ),
    state: { slot: "google-sign-in-button" },
  });
}

export { GoogleSignInButtonClient };
