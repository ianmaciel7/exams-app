import { useAuthNavigation } from "@/app/(public)/_hooks/use-auth-navigation";

export function useSignInAuthFlowClient() {
  return useAuthNavigation();
}
