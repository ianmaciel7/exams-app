import { ProtectedGuard } from "./_components/protected-guard";
import { RouteUsageBridgeClient } from "./_components/route-usage-bridge-client";
import { verifySession } from "./_lib/dal";

export default async function ProtectedLayout({ children }: LayoutProps<"/">) {
  await verifySession();

  return (
    <ProtectedGuard>
      <RouteUsageBridgeClient />
      {children}
    </ProtectedGuard>
  );
}
