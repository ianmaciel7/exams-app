import type { getFirebaseUI } from "@/lib/firebase/client";

export { default as dynamic } from "next/dynamic";

// Client session surfaces load Firebase after hydration so it stays off the
// critical path and the server-rendered home hero paints as the Largest
// Contentful Paint (Next.js "Lazy Loading": dynamic `import()`). These live
// outside the hooks because React Compiler does not support `import()` there.

/** Load the browser Firebase client (auth state) on demand. */
export const loadFirebaseClient = () => import("@/lib/firebase/client");

/** Load the sign-out module on demand. */
export const loadAuth = () => import("@/lib/auth");

let firebaseUi: Promise<ReturnType<typeof getFirebaseUI>> | undefined;

/**
 * Load the Firebase UI store on demand. React `use` needs a stable Promise
 * across renders, so it is created once and cached at module level.
 */
export const loadFirebaseUi = () =>
  (firebaseUi ??= loadFirebaseClient()
    .then(({ getFirebaseUI }) => getFirebaseUI())
    .catch((cause: unknown) => {
      // Forget a failed attempt so the error boundary's retry can try again.
      firebaseUi = undefined;
      throw cause;
    }));
