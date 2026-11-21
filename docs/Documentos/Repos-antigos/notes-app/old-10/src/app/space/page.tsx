import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { KindIcon } from "@/components/recall/kind-icon";
import { SpaceFrame } from "@/components/space-frame";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSnapshot } from "@/lib/space";

export default async function SpacePage() {
  const data = await requireSnapshot();
  const dueCount = data.objects.filter(
    (obj) =>
      obj.kind === "question" &&
      !obj.archived &&
      !obj.reported &&
      (!data.records[obj.id] || data.records[obj.id].due <= Date.now()),
  ).length;
  const recent = data.objects.slice(0, 3);
  return (
    <SpaceFrame
      title="Overview"
      eyebrow="Space home"
      data={data}
      active="overview"
    >
      {!data.spaceId ? (
        <Card className="mt-10 border-hairline bg-surface-card shadow-none">
          <CardContent className="p-8 text-center">
            <p className="display-face text-2xl">Create your first Space</p>
            <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
              Spaces are private, for your questions, notes, and citations. Use
              the switcher in the sidebar to create one.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mt-10 grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
            <Card className="border-0 bg-surface-dark text-white shadow-none">
              <CardHeader>
                <Badge className="w-fit bg-coral text-white">TODAY</Badge>
                <CardTitle className="display-face mt-5 text-3xl font-normal text-white">
                  Keep learning visible.
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="max-w-md leading-7 text-white/65">
                  Pick up where you left off, review what is due, or add a new
                  object to your Space.
                </p>
                <Link
                  href="/study"
                  className="mt-8 inline-flex items-center gap-2 text-sm text-white"
                >
                  Start a study session <ArrowRight className="size-4" />
                </Link>
              </CardContent>
            </Card>
            <Card className="border-0 bg-surface-card shadow-none">
              <CardHeader>
                <CardTitle className="text-lg">Review today</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-3">
                  <span className="display-face text-5xl">{dueCount}</span>
                  <span className="pb-2 text-sm text-muted-foreground">
                    questions due
                  </span>
                </div>
                <Link
                  href="/review"
                  className="mt-6 inline-flex items-center gap-2 text-sm text-coral"
                >
                  Open review queue <ArrowRight className="size-4" />
                </Link>
              </CardContent>
            </Card>
          </div>
          <div className="mt-10">
            <div className="flex items-center justify-between">
              <h2 className="display-face text-2xl">Recent objects</h2>
              <Link href="/question" className="text-sm text-coral">
                View all
              </Link>
            </div>
            {recent.length === 0 ? (
              <p className="mt-5 rounded-lg border border-hairline bg-surface-soft p-6 text-sm text-muted-foreground">
                Nothing here yet. Add a Question, Note, or Citation to get
                started.
              </p>
            ) : (
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {recent.map((object) => (
                  <Link key={object.id} href={`/question/${object.id}`}>
                    <Card className="border-hairline bg-canvas shadow-none transition-colors hover:border-coral">
                      <CardContent className="flex items-start gap-3 p-5">
                        <span className="flex size-9 items-center justify-center rounded-lg bg-surface-card text-coral">
                          <KindIcon kind={object.kind} className="size-4" />
                        </span>
                        <div>
                          <p className="text-sm text-ink">{object.title}</p>
                          <p className="mt-1 text-xs capitalize text-muted-foreground">
                            {object.kind}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </SpaceFrame>
  );
}
