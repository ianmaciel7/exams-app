import { useNavigation } from "@/hooks/use-navigation";

export function useForgotPasswordFormClient() {
  const { goToSignIn } = useNavigation();
  return { goToSignIn };
}
