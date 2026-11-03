import { useNavigation } from "@/hooks/use-navigation";

export function useSignInClient() {
  const { goToRegister, goToForgotPassword } = useNavigation();
  return { goToRegister, goToForgotPassword };
}
