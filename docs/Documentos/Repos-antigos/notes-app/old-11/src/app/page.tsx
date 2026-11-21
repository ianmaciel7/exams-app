import { AuthGreetingHeader } from "@/components/notes-app/auth-greeting-header";
import { SpaceShell } from "@/components/notes-app/space-shell";

export default async function Home() {
  return (
    <SpaceShell>
      <div className="flex flex-1 flex-col bg-background font-sans">
        <main className="flex flex-1 flex-col items-center justify-center p-8 text-center">
          <AuthGreetingHeader />
        </main>
      </div>
    </SpaceShell>
  );
}
