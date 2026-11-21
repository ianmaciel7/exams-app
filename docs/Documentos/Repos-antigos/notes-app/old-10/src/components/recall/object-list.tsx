"use client";
import { Archive, Flag, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { changeObject } from "@/actions/recall";
import { KindIcon } from "@/components/recall/kind-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { RecallObject, Snapshot } from "@/domain/recall";

export function ObjectList({ data }: { data: Snapshot }) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const isOwner =
    data.spaces.find((space) => space.id === data.spaceId)?.ownerId ===
    data.uid;
  async function act(
    object: RecallObject,
    action: "archive" | "restore" | "report" | "resolve",
  ) {
    setBusyId(object.id);
    try {
      await changeObject(data.spaceId, object.id, action);
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }
  if (data.objects.length === 0)
    return (
      <p className="mt-8 rounded-lg border border-hairline bg-surface-soft p-6 text-sm text-muted-foreground">
        No objects yet. Use "New object" above to add a Question, Note, or
        Citation.
      </p>
    );
  return (
    <div className="mt-8 grid gap-4 md:grid-cols-2">
      {data.objects.map((object) => {
        const canEdit = object.ownerId === data.uid;
        return (
          <Card
            key={object.id}
            className="border-hairline bg-canvas shadow-none"
          >
            <CardContent className="flex items-start gap-3 p-5">
              <span className="flex size-9 items-center justify-center rounded-lg bg-surface-soft text-coral">
                <KindIcon kind={object.kind} className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="border-coral/40 text-coral uppercase"
                  >
                    {object.kind}
                  </Badge>
                  {object.archived && <Badge variant="outline">Archived</Badge>}
                  {object.reported && <Badge variant="outline">Reported</Badge>}
                </div>
                <Link
                  href={`/question/${object.id}`}
                  className="mt-2 block truncate text-sm text-ink hover:text-coral"
                >
                  {object.title}
                </Link>
                <div className="mt-3 flex gap-2">
                  {canEdit && !object.reported && (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={busyId === object.id}
                      onClick={() =>
                        act(object, object.archived ? "restore" : "archive")
                      }
                    >
                      {object.archived ? (
                        <RotateCcw className="size-4" />
                      ) : (
                        <Archive className="size-4" />
                      )}
                      {object.archived ? "Restore" : "Archive"}
                    </Button>
                  )}
                  {!canEdit && !object.reported && (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={busyId === object.id}
                      onClick={() => act(object, "report")}
                    >
                      <Flag className="size-4" /> Report
                    </Button>
                  )}
                  {isOwner && object.reported && (
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={busyId === object.id}
                      onClick={() => act(object, "resolve")}
                    >
                      Resolve report
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
