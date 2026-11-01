import { AuthProviderClient } from "@/components/ui/extensions/auth-provider-client";

export default function PublicLayout({ children }: LayoutProps<"/">) {
  return (
    <main className="flex min-h-svh flex-1 items-start justify-center p-6 pt-12 md:items-center md:p-10">
      <div className="w-full max-w-sm">
        <AuthProviderClient>{children}</AuthProviderClient>
      </div>
    </main>
  );
}
