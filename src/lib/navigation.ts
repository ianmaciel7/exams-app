import { redirect } from "next/navigation";

export const routes = {
  home: "/",
  signIn: "/sign-in",
  register: "/register",
  forgotPassword: "/forgot-password",
  profile: "/profile",
} as const;

export type AuthRoute =
  | typeof routes.signIn
  | typeof routes.register
  | typeof routes.forgotPassword;

export const authRoutes: readonly AuthRoute[] = [
  routes.signIn,
  routes.register,
  routes.forgotPassword,
];

/** Build a sign-in URL that returns to `destination` after authentication. */
export function getSignInUrl(destination?: string): string {
  return destination
    ? `${routes.signIn}?next=${encodeURIComponent(destination)}`
    : routes.signIn;
}

/** Redirect to sign-in, returning to `destination` afterwards. */
export function redirectToSignIn(destination: string = routes.profile): never {
  redirect(getSignInUrl(destination));
}
