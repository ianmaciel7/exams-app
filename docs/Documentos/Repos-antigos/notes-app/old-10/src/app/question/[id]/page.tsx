import { notFound } from "next/navigation";
import { ObjectDetail } from "@/components/recall/object-detail";
import { SpaceFrame } from "@/components/space-frame";
import { requireSnapshot } from "@/lib/space";

export default async function ObjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await requireSnapshot();
  const object = data.objects.find((item) => item.id === id);
  // A missing id inside this Space and a foreign Space's object look
  // identical here on purpose — see spec.md 2.4.3 (404, never 403).
  if (!object) notFound();
  return (
    <SpaceFrame
      title={object.title}
      eyebrow="Object detail"
      data={data}
      active="question"
      current={object}
    >
      <ObjectDetail data={data} object={object} />
    </SpaceFrame>
  );
}
