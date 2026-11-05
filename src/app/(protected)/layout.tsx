import { ProtectedGuard } from "./_components/protected-guard";
import { UsageRecorderClient } from "./_components/usage-recorder-client";
import { verifySession } from "./_lib/dal";

export default async function ProtectedLayout({ children }: LayoutProps<"/">) {
  await verifySession();

  return (
    <ProtectedGuard>
      <UsageRecorderClient />
      {children}
    </ProtectedGuard>
  );
}
