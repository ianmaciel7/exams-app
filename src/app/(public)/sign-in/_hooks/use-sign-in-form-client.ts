import { useNavigation } from "@/hooks/use-navigation";

export function useSignInFormClient() {
  const { goToRegister, goToForgotPassword } = useNavigation();
  return { goToRegister, goToForgotPassword };
}
