import { getTranslations } from "next-intl/server";
import { RequireAuth } from "@/components/notes-app/require-auth";
import { SpaceShell } from "@/components/notes-app/space-shell";

export default async function SpacePage({ params }: PageProps<"/[spaceId]">) {
  const { spaceId } = await params;
  const spacesT = await getTranslations("spaces");
  const nextPath = `/${spaceId}`;

  return (
    <RequireAuth redirectTo={`/login?next=${encodeURIComponent(nextPath)}`}>
      <SpaceShell currentSpaceId={spaceId}>
        <div className="flex flex-1 flex-col bg-background font-sans">
          <main className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <div className="flex flex-col items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {spacesT("activeSpace")}
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {spacesT("spaceHeading", { id: spaceId })}
              </h1>
            </div>
          </main>
        </div>
      </SpaceShell>
    </RequireAuth>
  );
}
