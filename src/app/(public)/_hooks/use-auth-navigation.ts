import { useRouter } from "next/navigation";
import { type AuthRoute, routes } from "@/lib/navigation";
import { getAuthNavigationUrl } from "@/lib/return-url";

export function useAuthNavigation() {
  const router = useRouter();
  function navigate(path: AuthRoute) {
    router.push(getAuthNavigationUrl(path, window.location.search));
  }
  return {
    goToSignIn: () => navigate(routes.signIn),
    goToRegister: () => navigate(routes.register),
    goToForgotPassword: () => navigate(routes.forgotPassword),
  };
}
