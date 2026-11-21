import { CheckCircle2 } from "lucide-react";
import { StudySession } from "@/components/recall/study-session";
import { SpaceFrame } from "@/components/space-frame";
import { Card, CardContent } from "@/components/ui/card";
import { requireSnapshot } from "@/lib/space";

export default async function ReviewPage() {
  const data = await requireSnapshot();
  const due = data.objects.filter(
    (obj) =>
      obj.kind === "question" &&
      !obj.archived &&
      !obj.reported &&
      (!data.records[obj.id] || data.records[obj.id].due <= Date.now()),
  );
  return (
    <SpaceFrame
      title="Review queue"
      eyebrow="Spaced repetition"
      data={data}
      active="review"
    >
      <div className="mt-10 flex flex-col gap-5">
        {due.length === 0 ? (
          <Card className="border-0 bg-coral text-white shadow-none">
            <CardContent className="flex flex-col gap-3 p-6">
              <CheckCircle2 className="size-8" />
              <p className="display-face text-2xl">All caught up!</p>
              <p className="text-sm text-white/75">
                Nothing is due right now. Start an ad-hoc session below to get
                ahead, or add more questions to your Space.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 bg-coral text-white shadow-none">
            <CardContent className="flex flex-col gap-2 p-6">
              <p className="text-sm text-white/75">Due today</p>
              <p className="display-face text-4xl">
                {due.length} question{due.length === 1 ? "" : "s"}
              </p>
            </CardContent>
          </Card>
        )}
        {data.spaceId && <StudySession data={data} />}
      </div>
    </SpaceFrame>
  );
}
