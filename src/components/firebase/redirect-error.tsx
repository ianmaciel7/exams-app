"use client";

import { useRedirectError } from "@firebase-oss/ui-react";

export function RedirectError() {
  const error = useRedirectError();

  if (!error) {
    return null;
  }

  return (
    <div role="alert" className="text-sm text-destructive">
      {error}
    </div>
  );
}
