import { NavigationEvents } from "./_components/navigation-events";
import { ProtectedGuard } from "./_components/protected-guard";
import { verifySession } from "./_lib/dal";

export default async function ProtectedLayout({ children }: LayoutProps<"/">) {
  await verifySession();

  return (
    <ProtectedGuard>
      <NavigationEvents />
      {children}
    </ProtectedGuard>
  );
}
