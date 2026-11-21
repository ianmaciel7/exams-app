"use client";

import type { ComponentProps } from "react";

export interface GlobalErrorProps extends ComponentProps<"html"> {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}

export default function GlobalError({
  reset,
  lang = "en",
  ...htmlProps
}: GlobalErrorProps) {
  return (
    <html lang={lang} {...htmlProps}>
      <body className="flex min-h-screen flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold">Something went wrong!</h2>
        <p className="text-muted-foreground mt-2">Please try again.</p>
        <button
          type="button"
          onClick={reset}
          className="mt-4 rounded bg-black px-4 py-2 text-white dark:bg-white dark:text-black"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
