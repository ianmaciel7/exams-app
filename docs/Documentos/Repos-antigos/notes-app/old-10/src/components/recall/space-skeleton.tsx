import { Skeleton } from "@/components/ui/skeleton";

const navRows = ["overview", "questions", "study", "review", "settings"];
const cardRows = ["a", "b", "c", "d"];

// Mirrors SpaceFrame's box model exactly — 240px rail, h-16 header, the
// same eyebrow/title rhythm — so swapping the real frame in shifts nothing.
export function SpaceSkeleton() {
  return (
    <div className="min-h-screen bg-canvas lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="hidden border-r border-hairline bg-surface-soft lg:flex lg:flex-col">
        <div className="flex h-16 items-center border-b border-hairline px-6">
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="border-b border-hairline px-2 py-2">
          <Skeleton className="h-9 w-full" />
        </div>
        <div className="flex flex-col gap-1 p-4">
          {navRows.map((row) => (
            <Skeleton key={row} className="h-10 w-full" />
          ))}
        </div>
      </aside>
      <div className="min-w-0">
        <header className="flex h-16 items-center justify-between border-b border-hairline px-5 lg:px-10">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-8 w-28" />
        </header>
        <main className="mx-auto max-w-6xl px-5 py-10 lg:px-10">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="mt-3 h-10 w-72" />
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {cardRows.map((row) => (
              <Skeleton key={row} className="h-32 w-full" />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
