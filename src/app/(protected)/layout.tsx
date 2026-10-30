import { Suspense } from "react";
import { AuthGateServer } from "./_components/auth-gate-server";
import { ProtectedGuardClient } from "./_components/protected-guard-client";

export default function ProtectedLayout({ children }: LayoutProps<"/">) {
  return (
    <ProtectedGuardClient>
      <Suspense fallback={null}>
        <AuthGateServer />
      </Suspense>
      {children}
    </ProtectedGuardClient>
  );
}
