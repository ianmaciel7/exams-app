"use client";

import { useRedirectError } from "@firebase-oss/ui-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
