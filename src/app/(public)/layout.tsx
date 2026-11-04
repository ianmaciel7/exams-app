import { PublicGuardClient } from "./_components/public-guard-client";

export default function PublicLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="flex min-h-svh flex-1 items-start justify-center p-6 pt-12 md:items-center md:p-10">
      <div className="w-full max-w-sm">
        <PublicGuardClient>{children}</PublicGuardClient>
      </div>
    </main>
  );
}
