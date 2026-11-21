"use client";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { KindIcon } from "@/components/recall/kind-icon";
import type { RecallObject } from "@/domain/recall";
import {
  maxTabs,
  nextActiveTab,
  serializeTabs,
  tabsCookie,
} from "@/domain/tabs";

function persist(ids: string[]) {
  // biome-ignore lint/suspicious/noDocumentCookie: open tabs are intentionally restored during SSR.
  document.cookie = `${tabsCookie}=${serializeTabs(ids)}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax`;
}

export function SpaceTabs({
  tabs,
  current,
}: {
  tabs: RecallObject[];
  current?: RecallObject;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(tabs);
  // Visiting an object opens its tab. This is the only write: a tab is a view,
  // so nothing here touches the object it points at.
  useEffect(() => {
    if (!current) return;
    setOpen((previous) => {
      if (previous.some((tab) => tab.id === current.id)) return previous;
      const next = [...previous, current].slice(-maxTabs);
      persist(next.map((tab) => tab.id));
      return next;
    });
  }, [current]);

  if (open.length === 0) return null;

  function close(tab: RecallObject) {
    const ids = open.map((item) => item.id);
    const successor = nextActiveTab(ids, tab.id);
    const next = open.filter((item) => item.id !== tab.id);
    setOpen(next);
    persist(next.map((item) => item.id));
    // Closing a view never deletes the object behind it (spec.md 5.5).
    if (current?.id !== tab.id) return;
    router.push(successor ? `/question/${successor}` : "/question");
  }

  return (
    // Not a tablist: each tab is a navigation target with its own URL, so this
    // is navigation, and a router push is what swaps the "panel".
    <nav
      aria-label="Open objects"
      className="flex h-11 items-stretch gap-1 overflow-x-auto border-b border-hairline bg-surface-soft px-2"
    >
      {open.map((tab) => {
        const active = tab.id === current?.id;
        return (
          <div
            key={tab.id}
            className={`group flex min-w-0 items-center gap-2 rounded-t-lg px-3 text-sm ${
              active
                ? "bg-canvas text-ink"
                : "text-muted-foreground hover:text-ink"
            }`}
          >
            <button
              type="button"
              className="flex min-w-0 items-center gap-2"
              aria-current={active ? "page" : undefined}
              onClick={() => router.push(`/question/${tab.id}`)}
            >
              <KindIcon kind={tab.kind} className="size-3.5 text-coral" />
              <span className="max-w-40 truncate">{tab.title}</span>
            </button>
            <button
              type="button"
              aria-label={`Close ${tab.title}`}
              className="rounded p-0.5 text-muted-foreground opacity-0 hover:bg-surface-card hover:text-ink focus-visible:opacity-100 group-hover:opacity-100"
              onClick={() => close(tab)}
            >
              <X className="size-3.5" />
            </button>
          </div>
        );
      })}
    </nav>
  );
}
