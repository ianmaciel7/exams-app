"use client";
import { Link2, PanelRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { KindIcon } from "@/components/recall/kind-icon";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { RecallObject } from "@/domain/recall";
import { isEditableTarget } from "@/lib/keyboard";

function LinkedRow({ object }: { object: RecallObject }) {
  return (
    <Link
      href={`/question/${object.id}`}
      className="flex items-center gap-3 rounded-lg bg-canvas p-3 text-sm hover:bg-surface-card"
    >
      <KindIcon kind={object.kind} className="size-4 text-coral" />
      <span className="min-w-0 flex-1 truncate">{object.title}</span>
    </Link>
  );
}

function Rows({ objects, empty }: { objects: RecallObject[]; empty: string }) {
  if (objects.length === 0)
    return <p className="p-4 text-sm text-muted-foreground">{empty}</p>;
  return (
    <div className="flex flex-col gap-3 p-4">
      {objects.map((object) => (
        <LinkedRow key={object.id} object={object} />
      ))}
    </div>
  );
}

// spec.md 5.5: a contextual read surface. Selecting a tab or collapsing the
// panel is view state — nothing here mutates the object graph.
export function ContextPanel({
  object,
  linked,
  backlinks,
}: {
  object: RecallObject;
  linked: RecallObject[];
  backlinks: RecallObject[];
}) {
  const [open, setOpen] = useState(true);
  const restore = useRef(false);
  const show = useRef<HTMLButtonElement>(null);
  const hide = useRef<HTMLButtonElement>(null);
  // The recorded defect in spec.md 5.5 is focus stranded on the hide control
  // after the panel it belonged to went away. Hand it to the other control.
  useEffect(() => {
    if (!restore.current) return;
    restore.current = false;
    (open ? hide : show).current?.focus();
  }, [open]);
  // spec.md §5.4 "Shortcuts": side-aware `[`/`]` — this panel is the right
  // side, so it answers to `]`; the left sidebar's `[` lives in
  // src/components/space-frame.tsx.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (
        event.key !== "]" ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        isEditableTarget(event.target)
      )
        return;
      event.preventDefault();
      restore.current = true;
      setOpen((previous) => !previous);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  if (!open)
    return (
      <div className="flex h-fit justify-end">
        <Button
          ref={show}
          variant="outline"
          size="sm"
          className="border-hairline bg-canvas"
          aria-expanded={false}
          onClick={() => {
            restore.current = true;
            setOpen(true);
          }}
        >
          <PanelRight className="size-4" /> Show context panel
        </Button>
      </div>
    );
  return (
    <div className="h-fit rounded-xl border border-hairline bg-surface-soft">
      <Tabs defaultValue="links">
        <div className="flex items-center justify-between gap-2 border-b border-hairline p-2">
          <TabsList aria-label="Context panel" variant="line">
            <TabsTrigger value="links">
              <Link2 className="size-4" /> Links
              <span className="text-muted-foreground">{linked.length}</span>
            </TabsTrigger>
            <TabsTrigger value="backlinks">
              Backlinks
              <span className="text-muted-foreground">{backlinks.length}</span>
            </TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>
          <Button
            ref={hide}
            variant="ghost"
            size="icon-sm"
            aria-label="Hide context panel"
            aria-expanded={true}
            onClick={() => {
              restore.current = true;
              setOpen(false);
            }}
          >
            <PanelRight className="size-4" />
          </Button>
        </div>
        <TabsContent value="links">
          <Rows
            objects={linked}
            empty="+ Connect a related Note or Citation from Edit."
          />
        </TabsContent>
        <TabsContent value="backlinks">
          <Rows
            objects={backlinks}
            empty="No references yet — link to this item from any object."
          />
        </TabsContent>
        <TabsContent value="details">
          <dl className="flex flex-col gap-2 p-4 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Type</dt>
              <dd className="capitalize">{object.kind}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Revision</dt>
              <dd>{object.version}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Updated</dt>
              <dd>{new Date(object.updatedAt).toLocaleString()}</dd>
            </div>
          </dl>
        </TabsContent>
      </Tabs>
    </div>
  );
}
