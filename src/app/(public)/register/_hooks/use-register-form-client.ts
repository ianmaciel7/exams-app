import { useNavigation } from "@/hooks/use-navigation";

export function useRegisterFormClient() {
  const { goToSignIn } = useNavigation();
  return { goToSignIn };
}
