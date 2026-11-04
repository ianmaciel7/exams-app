import { AuthGuardClient } from "./_components/auth-guard-client";
import { rejectInvalidBridgeSession } from "./_lib/dal";

export default async function ProtectedLayout({ children }: LayoutProps<"/">) {
  await rejectInvalidBridgeSession();

  return <AuthGuardClient>{children}</AuthGuardClient>;
}
