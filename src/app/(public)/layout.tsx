import { Suspense } from "react";
import { LoadingStatus } from "@/components/ui/extensions/loading-status";
import { PublicUiProviderClient } from "./_components/public-ui-provider-client";

export default function PublicLayout({ children }: LayoutProps<"/">) {
  return (
    <main
      data-slot="public-layout"
      className="flex min-h-svh flex-1 items-start justify-center p-6 pt-12 md:items-center md:p-10"
    >
      <div className="w-full max-w-sm">
        <Suspense fallback={<LoadingStatus />}>
          <PublicUiProviderClient>{children}</PublicUiProviderClient>
        </Suspense>
      </div>
    </main>
  );
}
