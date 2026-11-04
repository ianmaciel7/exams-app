import { useNavigation } from "@/hooks/use-navigation";

export function useRegisterClient() {
  const { goToSignIn } = useNavigation();
  return { goToSignIn };
}
