import { ObjectList } from "@/components/recall/object-list";
import { SpaceFrame } from "@/components/space-frame";
import { requireSnapshot } from "@/lib/space";

export default async function QuestionPage() {
  const data = await requireSnapshot();
  return (
    <SpaceFrame
      title="Questions"
      eyebrow="All objects"
      data={data}
      active="question"
    >
      {!data.spaceId ? (
        <p className="mt-10 rounded-lg border border-hairline bg-surface-soft p-6 text-sm text-muted-foreground">
          Create a Space first, then add your first object.
        </p>
      ) : (
        <ObjectList data={data} />
      )}
    </SpaceFrame>
  );
}
