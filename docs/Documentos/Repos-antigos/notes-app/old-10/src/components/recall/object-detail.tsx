"use client";
import { ArrowLeft, Flag, Link2, RotateCcw, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { changeObject } from "@/actions/recall";
import { ContextPanel } from "@/components/recall/context-panel";
import { KindIcon } from "@/components/recall/kind-icon";
import { ObjectEditor } from "@/components/recall/object-editor";
import { RichText } from "@/components/recall/rich-text";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RecallObject, Snapshot } from "@/domain/recall";

export function ObjectDetail({
  data,
  object,
}: {
  data: Snapshot;
  object: RecallObject;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const canEdit = object.ownerId === data.uid;
  const isSpaceOwner =
    data.spaces.find((space) => space.id === data.spaceId)?.ownerId ===
    data.uid;
  const linked = object.links
    .map((id) => data.objects.find((item) => item.id === id))
    .filter((item): item is RecallObject => Boolean(item));
  const backlinks = data.objects.filter(
    (item) => item.id !== object.id && item.links.includes(object.id),
  );
  // spec.md §12 "per-kind detail layouts": tag/collection objects are membership
  // containers — what links *to* them is the content that matters, so the
  // backlinks list doubles as the up-front "members" view for those two kinds.
  const members = backlinks;
  // An exam's "attempt history" is its linked questions' own spaced-repetition
  // records, which the Snapshot already carries per-question.
  const examQuestions = linked.filter((item) => item.kind === "question");
  async function act(action: "archive" | "restore" | "report" | "resolve") {
    setBusy(true);
    try {
      await changeObject(data.spaceId, object.id, action);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Link
        href="/question"
        className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-ink"
      >
        <ArrowLeft className="size-4" /> Back to objects
      </Link>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="border-hairline bg-canvas shadow-none">
          <CardHeader>
            <div className="flex items-center justify-between">
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
              <span className="text-xs text-muted-foreground">
                Updated {new Date(object.updatedAt).toLocaleDateString()}
              </span>
            </div>
            <CardTitle className="display-face mt-5 text-3xl font-normal">
              {object.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(object.kind === "tag" || object.kind === "collection") && (
              <div className="mb-6 rounded-xl bg-surface-soft p-5">
                <p className="text-sm font-medium text-ink">
                  {object.kind === "tag" ? "Tagged objects" : "Members"}
                  <span className="ml-2 font-normal text-muted-foreground">
                    ({members.length})
                  </span>
                </p>
                {members.length === 0 ? (
                  <p className="mt-3 text-sm text-muted-foreground">
                    Nothing links here yet — link an object to “{object.title}”
                    from its Edit dialog.
                  </p>
                ) : (
                  <div className="mt-4 flex flex-col gap-3">
                    {members.map((member) => (
                      <Link
                        key={member.id}
                        href={`/question/${member.id}`}
                        className="flex items-center gap-3 rounded-lg border border-hairline bg-canvas p-3 text-sm hover:bg-surface-card"
                      >
                        <KindIcon
                          kind={member.kind}
                          className="size-4 text-coral"
                        />
                        <span className="min-w-0 flex-1 truncate">
                          {member.title}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
            {object.kind === "exam" && (
              <div className="mb-6 rounded-xl bg-surface-soft p-5">
                <p className="text-sm font-medium text-ink">Exam overview</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {examQuestions.length} linked question
                  {examQuestions.length === 1 ? "" : "s"}
                </p>
                {examQuestions.length > 0 && (
                  <div className="mt-4 flex flex-col gap-2">
                    {examQuestions.map((question) => {
                      const record = data.records[question.id];
                      return (
                        <div
                          key={question.id}
                          className="flex items-center justify-between gap-3 rounded-lg border border-hairline bg-canvas p-3 text-sm"
                        >
                          <Link
                            href={`/question/${question.id}`}
                            className="min-w-0 flex-1 truncate hover:text-coral"
                          >
                            {question.title}
                          </Link>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {record
                              ? `${record.correct}/${record.attempts} correct`
                              : "Not attempted yet"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
            {object.kind === "citation" && object.url && (
              <a
                href={object.url}
                target="_blank"
                rel="noreferrer"
                className="mb-4 inline-flex items-center gap-2 rounded-lg border border-hairline bg-surface-soft px-4 py-3 text-sm text-coral hover:bg-surface-card"
              >
                <Link2 className="size-4" /> {object.url}
              </a>
            )}
            {object.text && (
              <div className="text-lg text-body">
                <RichText doc={object.body} />
              </div>
            )}
            {object.kind === "question" && (
              <div className="mt-8 rounded-xl bg-surface-soft p-5">
                <p className="text-sm font-medium text-ink">
                  {object.format === "matching" ? "Prompts" : "Choices"}
                  <span className="ml-2 font-normal text-muted-foreground">
                    ({object.format.replace("-", " ")})
                  </span>
                </p>
                <div className="mt-4 flex flex-col gap-3">
                  {object.options.map((option, index) => (
                    <div
                      key={option}
                      className="flex items-center gap-3 rounded-lg border border-hairline bg-canvas p-4 text-sm"
                    >
                      <span className="flex size-7 items-center justify-center rounded-full border border-hairline text-xs text-muted-foreground">
                        {String.fromCharCode(65 + index)}
                      </span>
                      {option}
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  Correct: {object.answers.join(" · ")}
                </p>
              </div>
            )}
            <div className="mt-6 flex flex-wrap gap-2">
              {canEdit && (
                <Button variant="outline" onClick={() => setEditing(true)}>
                  Edit
                </Button>
              )}
              {canEdit && !object.reported && (
                <Button
                  variant="ghost"
                  disabled={busy}
                  onClick={() => act(object.archived ? "restore" : "archive")}
                >
                  {object.archived ? (
                    <RotateCcw className="size-4" />
                  ) : (
                    <Trash2 className="size-4" />
                  )}
                  {object.archived ? "Restore" : "Archive"}
                </Button>
              )}
              {!canEdit && !object.reported && (
                <Button
                  variant="ghost"
                  disabled={busy}
                  onClick={() => act("report")}
                >
                  <Flag className="size-4" /> Report
                </Button>
              )}
              {isSpaceOwner && object.reported && (
                <Button
                  variant="ghost"
                  disabled={busy}
                  onClick={() => act("resolve")}
                >
                  Resolve report
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
        <ContextPanel object={object} linked={linked} backlinks={backlinks} />
      </div>
      {editing && (
        <ObjectEditor
          data={data}
          object={object}
          onClose={() => setEditing(false)}
          onSaved={async () => {
            setEditing(false);
            router.refresh();
          }}
        />
      )}
    </>
  );
}
