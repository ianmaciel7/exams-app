import { BookOpen, Clock3 } from "lucide-react";
import { StudySession } from "@/components/recall/study-session";
import { SpaceFrame } from "@/components/space-frame";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSnapshot } from "@/lib/space";

export default async function StudyPage() {
  const data = await requireSnapshot();
  return (
    <SpaceFrame
      title="Study session"
      eyebrow="Practice"
      data={data}
      active="study"
    >
      {!data.spaceId ? (
        <p className="mt-10 rounded-lg border border-hairline bg-surface-soft p-6 text-sm text-muted-foreground">
          Create a Space first, then add a question to start studying.
        </p>
      ) : (
        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_320px]">
          <StudySession data={data} />
          <Card className="h-fit border-0 bg-surface-dark text-white shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="size-4 text-coral" /> About this session
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 text-sm text-white/65">
              <p>
                Practice gives feedback per question. Simulated exam times you
                and reveals results at the end.
              </p>
              <p className="flex items-center gap-2">
                <Clock3 className="size-4 text-coral" /> Simulated exams use the
                time limit you set, plus a short network grace window at the
                end.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </SpaceFrame>
  );
}
