"use client";

import type { PolicyURL } from "@firebase-oss/ui-react";
import type { PropsWithChildren } from "react";
import { Button } from "@/components/ui/button";

type PolicyLinkButtonProps = PropsWithChildren<{
  onNavigate?: (url: PolicyURL) => void;
  url: PolicyURL;
}>;

function PolicyLinkButton({
  onNavigate,
  url,
  children,
}: PolicyLinkButtonProps) {
  if (onNavigate) {
    return (
      <Button
        data-slot="policy-link-button"
        variant="link"
        size="sm"
        type="button"
        onClick={() => onNavigate(url)}
      >
        {children}
      </Button>
    );
  }

  return (
    <Button
      data-slot="policy-link-button"
      variant="link"
      size="sm"
      nativeButton={false}
      render={
        <a href={String(url)} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      }
    />
  );
}

export { PolicyLinkButton, type PolicyLinkButtonProps };
