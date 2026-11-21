"use client";

import { useEffect } from "react";
import { captureError } from "@/lib/error-capture/capture";
import messages from "@/messages/en.json";

// global-error replaces the root layout, so NextIntlClientProvider is not
// mounted here; the English catalog is used directly as a last-resort UI.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    captureError(error, { source: "global-error" });
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main
          role="alert"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
            minHeight: "100vh",
            padding: "1.5rem",
            textAlign: "center",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <h1>{messages.error.title}</h1>
          <p>{messages.error.description}</p>
          <button
            type="button"
            onClick={() => reset()}
            data-testid="global-error-retry-btn"
          >
            {messages.error.retry}
          </button>
        </main>
      </body>
    </html>
  );
}
