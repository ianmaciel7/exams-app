type LoadingStateProps = {
  /** Names the boundary in the DOM so tests and debugging can tell them apart. */
  boundary: string;
};

/**
 * Marks a pending region. It renders no visible UI: while one is in the DOM,
 * `globals.css` shows the single `GlobalLoadingIndicator`. Use it in every
 * `loading.tsx`, Suspense fallback, and client guard that waits for data.
 */
function LoadingState({ boundary }: LoadingStateProps) {
  return <div data-slot="loading-state" data-loading-boundary={boundary} />;
}

export { LoadingState };
