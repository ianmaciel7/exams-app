import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { type ReactNode, useId } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { useGoogleSignInButtonClient } from "../../_hooks/use-google-sign-in-button-client";

type GoogleSignInButtonProps = useRender.ComponentProps<"div"> &
  ReturnType<typeof useGoogleSignInButtonClient> & { icon: ReactNode };

function GoogleSignInButton({
  onSignIn,
  error,
  isPending,
  label,
  providerId,
  icon,
  render,
  ...props
}: GoogleSignInButtonProps) {
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
              onClick={onSignIn}
              data-provider={providerId}
              className="w-full"
              variant="outline"
            >
              {isPending ? (
                <Spinner data-icon="inline-start" aria-hidden="true" />
              ) : null}
              {icon}
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

export { GoogleSignInButton };
