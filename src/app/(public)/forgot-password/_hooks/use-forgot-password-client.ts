import { useNavigation } from "@/hooks/use-navigation";

export function useForgotPasswordClient() {
  const { goToSignIn } = useNavigation();
  return { goToSignIn };
}
