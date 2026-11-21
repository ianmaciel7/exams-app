"use client";
import { useState } from "react";
import { saveObject } from "@/actions/recall";
import {
  emptyDoc,
  RichTextEditor,
  type RichValue,
} from "@/components/recall/rich-text";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  formats,
  kinds,
  objectInput,
  type RecallObject,
  type Snapshot,
} from "@/domain/recall";

const selectStyle =
  "h-11 w-full rounded-lg border border-input bg-background px-3";
export function ObjectEditor({
  data,
  object,
  onClose,
  onSaved,
}: {
  data: Snapshot;
  object?: RecallObject;
  onClose: () => void;
  onSaved: (id: string) => Promise<void>;
}) {
  const [kind, setKind] = useState<RecallObject["kind"]>(
    object?.kind ?? "note",
  );
  const [format, setFormat] = useState<RecallObject["format"]>(
    object?.format ?? "single-choice",
  );
  const [body, setBody] = useState<RichValue>(object?.body ?? emptyDoc);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  function close() {
    if (!busy && (!dirty || window.confirm("Discard your unsaved changes?")))
      onClose();
  }
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <DialogContent className="max-h-[90svh] sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {object ? "Edit object" : "Add to your Space"}
          </DialogTitle>
          <DialogDescription>
            Connect a question, note, or source to the rest of your learning.
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex min-h-0 flex-col gap-5"
          onChange={() => setDirty(true)}
          onSubmit={async (event) => {
            event.preventDefault();
            setBusy(true);
            setError("");
            const values = new FormData(event.currentTarget);
            const lines = (name: string) =>
              String(values.get(name) ?? "")
                .split("\n")
                .map((value) => value.trim())
                .filter(Boolean);
            const parsed = objectInput.safeParse({
              kind,
              format,
              title: values.get("title"),
              body,
              url: values.get("url") ?? "",
              options: lines("options"),
              answers: lines("answers"),
              links: values.getAll("links"),
            });
            if (!parsed.success) {
              setError(
                parsed.error.issues.map((issue) => issue.message).join(" "),
              );
              setBusy(false);
              return;
            }
            try {
              const id = await saveObject(
                data.spaceId,
                parsed.data,
                object?.id,
                object?.version,
              );
              await onSaved(id);
            } catch (cause) {
              setError(
                cause instanceof Error
                  ? cause.message
                  : "Could not save. Your draft is preserved.",
              );
            } finally {
              setBusy(false);
            }
          }}
        >
          <div className="max-h-[60svh] overflow-y-auto px-1">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="kind">Object type</FieldLabel>
                <select
                  id="kind"
                  value={kind}
                  disabled={Boolean(object)}
                  className={selectStyle}
                  onChange={(event) =>
                    setKind(event.target.value as typeof kind)
                  }
                >
                  {kinds.map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </Field>
              <Field>
                <FieldLabel htmlFor="title">Title</FieldLabel>
                <Input
                  id="title"
                  name="title"
                  defaultValue={object?.title}
                  required
                  maxLength={180}
                />
              </Field>
              <Field>
                <FieldLabel>
                  {kind === "question" ? "Explanation" : "Content"}
                </FieldLabel>
                <RichTextEditor
                  label={kind === "question" ? "Explanation" : "Content"}
                  defaultValue={object?.body ?? emptyDoc}
                  onChange={(next) => {
                    setBody(next);
                    setDirty(true);
                  }}
                />
              </Field>
              {kind === "citation" && (
                <Field>
                  <FieldLabel htmlFor="url">Source URL</FieldLabel>
                  <Input
                    id="url"
                    name="url"
                    type="url"
                    defaultValue={object?.url}
                    placeholder="https://…"
                  />
                </Field>
              )}
              {kind === "question" && (
                <>
                  <Field>
                    <FieldLabel htmlFor="format">Question format</FieldLabel>
                    <select
                      id="format"
                      className={selectStyle}
                      value={format}
                      onChange={(event) =>
                        setFormat(event.target.value as typeof format)
                      }
                    >
                      {formats.map((value) => (
                        <option key={value}>{value}</option>
                      ))}
                    </select>
                  </Field>
                  {format !== "fill-blank" && (
                    <Field>
                      <FieldLabel htmlFor="options">
                        {format === "matching"
                          ? "Prompts, one per line"
                          : "Choices, one per line"}
                      </FieldLabel>
                      <Textarea
                        id="options"
                        name="options"
                        defaultValue={object?.options.join("\n")}
                        required
                        rows={4}
                      />
                    </Field>
                  )}
                  <Field>
                    <FieldLabel htmlFor="answers">
                      {format === "matching"
                        ? "Matching answers, in prompt order"
                        : format === "fill-blank"
                          ? "Accepted answers, one per line"
                          : "Correct choices, copied exactly, one per line"}
                    </FieldLabel>
                    <Textarea
                      id="answers"
                      name="answers"
                      defaultValue={object?.answers.join("\n")}
                      required
                    />
                  </Field>
                </>
              )}
              <Field>
                <FieldLabel htmlFor="links">Linked objects</FieldLabel>
                <select
                  id="links"
                  name="links"
                  multiple
                  className="min-h-28 rounded-lg border border-input bg-background p-2"
                  defaultValue={object?.links ?? []}
                >
                  {data.objects
                    .filter(
                      (item) =>
                        item.id !== object?.id &&
                        !item.archived &&
                        !item.reported,
                    )
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.kind} · {item.title}
                      </option>
                    ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  Select multiple with Ctrl or Command. Links are visible in
                  both directions.
                </p>
              </Field>
            </FieldGroup>
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={close}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? "Saving…" : "Save object"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
