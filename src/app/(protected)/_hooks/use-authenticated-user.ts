import { useSession } from "@/hooks/use-session";

export function useAuthenticatedUser() {
  const { user } = useSession();
  if (!user) throw new Error("Protected components require AuthGateClient");
  return user;
}
