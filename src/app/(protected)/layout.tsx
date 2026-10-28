import { ProtectedSessionServer } from "./_components/protected-session-server";

export default function ProtectedLayout({ children }: LayoutProps<"/">) {
  return <ProtectedSessionServer>{children}</ProtectedSessionServer>;
}
