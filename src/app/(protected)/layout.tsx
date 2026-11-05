import { ProtectedGuard } from "./_components/protected-guard";
import { RouteUsageReporterClient } from "./_components/route-usage-reporter-client";
import { verifySession } from "./_lib/dal";

export default async function ProtectedLayout({ children }: LayoutProps<"/">) {
  await verifySession();

  return (
    <ProtectedGuard>
      <RouteUsageReporterClient />
      {children}
    </ProtectedGuard>
  );
}
