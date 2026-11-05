import { verifySession } from "@/lib/dal";
import { NavigationEvents } from "./_components/navigation-events";

export default async function ProtectedLayout({ children }: LayoutProps<"/">) {
  await verifySession();

  return (
    <main
      data-slot="protected-layout"
      className="flex min-h-svh flex-1 items-center justify-center p-6 md:p-10"
    >
      <NavigationEvents />
      {children}
    </main>
  );
}
