"use client";

import type { ComponentProps, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

type AuthSubmitButtonProps = Omit<ComponentProps<typeof Button>, "children"> & {
  children: ReactNode;
  busy: boolean;
};

function AuthSubmitButton({ busy, children, ...props }: AuthSubmitButtonProps) {
  return (
    <Button
      data-slot="auth-submit-button"
      {...props}
      disabled={busy || props.disabled}
    >
      {busy ? <Spinner data-icon="inline-start" /> : null}
      {children}
    </Button>
  );
}

export { AuthSubmitButton, type AuthSubmitButtonProps };
