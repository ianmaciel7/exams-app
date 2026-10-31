import { AuthGateClient } from "./_components/auth-gate-client";
import { RouteUsageClient } from "./_components/route-usage-client";
import { rejectInvalidBridgeSession } from "./_lib/dal";

export default async function ProtectedLayout({ children }: LayoutProps<"/">) {
  await rejectInvalidBridgeSession();

  return (
    <AuthGateClient>
      <RouteUsageClient>{children}</RouteUsageClient>
    </AuthGateClient>
  );
}
