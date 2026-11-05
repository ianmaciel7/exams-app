// Client session surfaces load Firebase after hydration so it stays off the
// critical path and the server-rendered home hero paints as the Largest
// Contentful Paint. These live outside the hooks because React Compiler does
// not support `import()` there.

/** Load the browser Firebase client (auth state) on demand. */
export const loadFirebaseClient = () => import("@/lib/firebase/client");

/** Load the sign-out module on demand. */
export const loadAuth = () => import("@/lib/auth");
