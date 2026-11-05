import { NavigationEventsRecorderClient } from "./_components/navigation-events-recorder-client";
import { ProtectedGuard } from "./_components/protected-guard";
import { verifySession } from "./_lib/dal";

export default async function ProtectedLayout({ children }: LayoutProps<"/">) {
  await verifySession();

  return (
    <ProtectedGuard>
      <NavigationEventsRecorderClient />
      {children}
    </ProtectedGuard>
  );
}
