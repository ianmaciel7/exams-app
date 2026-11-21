"use client";

export interface ErrorBoundaryProps {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}

export default function ErrorBoundary({ reset }: ErrorBoundaryProps) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-4">
      <h2 className="text-xl font-semibold">An unexpected error occurred</h2>
      <p className="text-muted-foreground mt-1 text-sm">Please try again.</p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 rounded bg-black px-4 py-2 text-sm text-white dark:bg-white dark:text-black"
      >
        Try again
      </button>
    </div>
  );
}
