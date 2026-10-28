import { useAuthNavigation } from "@/app/(public)/_hooks/use-auth-navigation";

export function useRegisterAuthFlowClient() {
  return useAuthNavigation();
}
