"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRedirectError } from "@firebase-oss/ui-react";

export function RedirectError() {
  const error = useRedirectError();

  if (!error) {
    return null;
  }

  return (
    <Alert variant="destructive">
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );
}
