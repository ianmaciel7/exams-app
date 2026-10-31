// Client session surfaces load Firebase after hydration so it stays off the
// critical path and the server-rendered home hero paints as the Largest
// Contentful Paint. These
// live outside the hooks because React Compiler does not support `import()`
// there.

/** Load the session module on demand. */
export const loadSession = () => import("@/lib/session");

/** Load the sign-out module on demand. */
export const loadAuth = () => import("@/lib/auth");
