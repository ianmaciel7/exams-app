"use client";

import { ChevronDown, LogOut, PanelLeft, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { logout } from "@/actions/recall";
import { CommandPalette } from "@/components/recall/command-palette";
import { ObjectEditor } from "@/components/recall/object-editor";
import { SpaceSwitcher } from "@/components/recall/space-switcher";
import { SpaceTabs } from "@/components/recall/space-tabs";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import type { RecallObject } from "@/domain/recall";
import {
  clampSidebarWidth,
  sidebarCookie,
  sidebarCookieMaxAgeSeconds,
  sidebarMaxWidth,
  sidebarMinWidth,
  sidebarWidthCookie,
  sidebarWidthStep,
} from "@/domain/sidebar";
import { isEditableTarget } from "@/lib/keyboard";
import type { SpaceData } from "@/lib/space";

function persistCollapsed(value: boolean) {
  // biome-ignore lint/suspicious/noDocumentCookie: sidebar state is intentionally read during SSR.
  document.cookie = `${sidebarCookie}=${value}; path=/; max-age=${sidebarCookieMaxAgeSeconds}; samesite=lax`;
}

function persistWidth(value: number) {
  // biome-ignore lint/suspicious/noDocumentCookie: sidebar width is intentionally read during SSR.
  document.cookie = `${sidebarWidthCookie}=${value}; path=/; max-age=${sidebarCookieMaxAgeSeconds}; samesite=lax`;
}

// spec.md §5.4 "Sections and nesting": group labels can collapse and each
// nested group owns its own hover/active/focus highlight scope, so a parent
// group header and its child rows never compete for one highlight. Settings
// is deliberately not grouped — it is a single destination, not a section.
const navGroups = [
  {
    key: "workspace",
    label: "Workspace",
    items: [
      { key: "overview", href: "/space", label: "Overview" },
      { key: "question", href: "/question", label: "Questions" },
    ],
  },
  {
    key: "practice",
    label: "Practice",
    items: [
      { key: "study", href: "/study", label: "Study session" },
      { key: "review", href: "/review", label: "Review queue" },
    ],
  },
] as const;

const settingsNavItem = {
  key: "settings",
  href: "/settings",
  label: "Settings",
} as const;

type NavKey =
  | (typeof navGroups)[number]["items"][number]["key"]
  | typeof settingsNavItem.key;

export function SpaceFrame({
  children,
  title,
  eyebrow,
  data,
  active,
  current,
}: {
  children: ReactNode;
  title: string;
  eyebrow: string;
  data: SpaceData;
  active: NavKey;
  current?: RecallObject;
}) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  // Desktop collapse (spec.md §5.4 "Collapse and peek"), persisted server-side
  // via requireSnapshot() so first paint already reflects it. Independent of
  // `navOpen`, which is the separate, never-persisted mobile drawer state.
  const [collapsed, setCollapsed] = useState(data.sidebarCollapsed);
  // A peek is a transient, non-persistent preview of the collapsed sidebar —
  // spec.md §5.4 "Collapse and peek": "`open`, `peek`, and `mobileOpen` must
  // be separate state variables; a peek must never be treated as a durable
  // open state." Nothing here ever calls persistCollapsed.
  const [peek, setPeek] = useState(false);
  const peekOpenTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const peekCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Rail width (spec.md §5.4 "Resize limits": bounded 160-360px), persisted
  // the same way as `collapsed` above — a `sidebar_width` cookie in the same
  // family, read server-side by requireSnapshot() so first paint already
  // reflects it. Re-clamped here too in case a stale/tampered cookie value
  // sneaked in outside the documented bounds.
  const [width, setWidth] = useState(() =>
    clampSidebarWidth(data.sidebarWidth),
  );
  const resizing = useRef<{
    pointerId: number;
    startX: number;
    startWidth: number;
  } | null>(null);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    workspace: true,
    practice: true,
  });
  function toggleGroup(key: string) {
    setOpenGroups((previous) => ({ ...previous, [key]: !previous[key] }));
  }
  const navTrigger = useRef<HTMLButtonElement>(null);
  const desktopToggle = useRef<HTMLButtonElement>(null);
  const drawer = useRef<HTMLElement>(null);
  // spec.md 5.5: the drawer is a custom aside, not a Dialog, so it has to do
  // its own focus handling — move focus in on open, and hand it back to the
  // opener on every dismissal path rather than stranding it offscreen.
  function closeNav() {
    setNavOpen(false);
    navTrigger.current?.focus();
  }
  function clearPeekTimers() {
    if (peekOpenTimer.current) {
      clearTimeout(peekOpenTimer.current);
      peekOpenTimer.current = null;
    }
    if (peekCloseTimer.current) {
      clearTimeout(peekCloseTimer.current);
      peekCloseTimer.current = null;
    }
  }
  // peek: hover — a short dwell before previewing, so passing the mouse over
  // the toggle on the way elsewhere does not flash the rail open.
  function schedulePeekOpen() {
    if (!collapsed) return;
    if (peekCloseTimer.current) {
      clearTimeout(peekCloseTimer.current);
      peekCloseTimer.current = null;
    }
    if (peekOpenTimer.current) return;
    peekOpenTimer.current = setTimeout(() => {
      peekOpenTimer.current = null;
      setPeek(true);
    }, 300);
  }
  // A short close dwell too, so moving the pointer from the toggle into the
  // peek panel itself (an adjacent, not overlapping, element) does not blink
  // the panel shut before the pointer arrives.
  function schedulePeekClose() {
    if (peekOpenTimer.current) {
      clearTimeout(peekOpenTimer.current);
      peekOpenTimer.current = null;
    }
    if (peekCloseTimer.current) return;
    peekCloseTimer.current = setTimeout(() => {
      peekCloseTimer.current = null;
      setPeek(false);
    }, 150);
  }
  function toggleCollapsed(fromKeyboard = false) {
    clearPeekTimers();
    setPeek(false);
    setCollapsed((previous) => {
      const next = !previous;
      persistCollapsed(next);
      return next;
    });
    // A click already leaves focus on the button it landed on; a keyboard
    // shortcut has no such anchor, so give it one explicitly.
    if (fromKeyboard) desktopToggle.current?.focus();
  }
  useEffect(() => {
    if (!navOpen) return;
    drawer.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setNavOpen(false);
      navTrigger.current?.focus();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [navOpen]);
  // spec.md §5.4 "Collapse and peek": "Peek is a floating overlay, dismissed
  // by Escape or outside press, and never pins or writes the cookie."
  useEffect(() => {
    if (!peek) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setPeek(false);
      desktopToggle.current?.focus();
    }
    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (drawer.current?.contains(target)) return;
      if (desktopToggle.current?.contains(target)) return;
      setPeek(false);
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [peek]);
  // spec.md §5.4 "Shortcuts": side-aware `[`/`]` — `[` is the left (this)
  // sidebar; the context panel on the right answers to `]` (see
  // context-panel.tsx). Desktop-only: the mobile drawer already has Escape.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (
        event.key !== "[" ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        isEditableTarget(event.target)
      )
        return;
      event.preventDefault();
      toggleCollapsed(true);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });
  // Drag-to-resize the rail (spec.md §5.4 "Resize limits": bounded 160-360px;
  // "dragging past the minimum collapses"). Tracks the pointer directly
  // rather than via react-resizable-panels, whose percentage-based sizing
  // fights the shell's fixed-pixel grid column.
  function onResizePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    resizing.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startWidth: width,
    };
  }
  function onResizePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const state = resizing.current;
    if (!state || state.pointerId !== event.pointerId) return;
    const next = state.startWidth + (event.clientX - state.startX);
    if (next < sidebarMinWidth) {
      resizing.current = null;
      event.currentTarget.releasePointerCapture(event.pointerId);
      if (!collapsed) toggleCollapsed();
      return;
    }
    setWidth(clampSidebarWidth(next));
  }
  function onResizePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (resizing.current?.pointerId !== event.pointerId) return;
    resizing.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
    // Persist once the drag settles on a final width, mirroring
    // persistCollapsed's "write on the discrete, committed action" pattern
    // rather than on every intermediate pointermove.
    persistWidth(width);
  }
  // Keyboard-accessible alternative to dragging (spec.md §5.4 "Resize
  // limits": "an accessible alternative to dragging"). Each key press is
  // itself a discrete, committed change, so it persists immediately.
  function onResizeKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setWidth((previous) => {
        const next = clampSidebarWidth(previous - sidebarWidthStep);
        persistWidth(next);
        return next;
      });
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      setWidth((previous) => {
        const next = clampSidebarWidth(previous + sidebarWidthStep);
        persistWidth(next);
        return next;
      });
    } else if (event.key === "Home") {
      event.preventDefault();
      setWidth(sidebarMinWidth);
      persistWidth(sidebarMinWidth);
    } else if (event.key === "End") {
      event.preventDefault();
      setWidth(sidebarMaxWidth);
      persistWidth(sidebarMaxWidth);
    }
  }
  const peeking = collapsed && peek;
  // The persistent desktop column tracks the resizable width via a CSS
  // custom property; the peek overlay reads the same variable so it always
  // previews at the same width the sidebar would open to.
  return (
    <div
      className={`min-h-screen bg-canvas text-ink transition-[grid-template-columns] duration-200 ease-linear lg:grid ${collapsed ? "lg:grid-cols-[1fr]" : "lg:grid-cols-[var(--sidebar-w)_1fr]"}`}
      style={{ "--sidebar-w": `${width}px` } as CSSProperties}
    >
      {navOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={closeNav}
        />
      )}
      <aside
        ref={drawer}
        tabIndex={-1}
        aria-label="Space navigation"
        onMouseEnter={schedulePeekOpen}
        onMouseLeave={schedulePeekClose}
        className={`${navOpen ? "fixed inset-y-0 left-0 z-50 flex w-64" : "hidden"} flex-col border-r border-hairline bg-surface-soft outline-none ${
          collapsed
            ? peeking
              ? "lg:fixed lg:top-16 lg:bottom-0 lg:left-0 lg:z-40 lg:flex lg:w-(--sidebar-w) lg:rounded-r-xl lg:border-r lg:shadow-lg"
              : "lg:hidden"
            : "lg:relative lg:flex lg:w-(--sidebar-w)"
        }`}
      >
        <div className="flex h-16 items-center gap-3 border-b border-hairline px-6 text-sm font-medium">
          <span className="text-xl text-coral" aria-hidden="true">
            ✳
          </span>{" "}
          Recall
        </div>
        <div className="border-b border-hairline px-2 py-2">
          <SpaceSwitcher data={data} />
        </div>
        <div className="flex flex-col gap-3 p-4">
          {navGroups.map((group) => {
            const expanded = openGroups[group.key] ?? true;
            return (
              <div key={group.key} className="flex flex-col gap-1">
                <button
                  type="button"
                  aria-expanded={expanded}
                  aria-controls={`nav-group-${group.key}`}
                  onClick={() => toggleGroup(group.key)}
                  className="flex items-center justify-between rounded-md px-3 py-1 text-xs font-medium text-muted-foreground uppercase tracking-[0.08em] hover:bg-surface-card hover:text-ink"
                >
                  {group.label}
                  <ChevronDown
                    aria-hidden="true"
                    className={`size-3.5 transition-transform ${expanded ? "" : "-rotate-90"}`}
                  />
                </button>
                {expanded && (
                  <div
                    id={`nav-group-${group.key}`}
                    className="flex flex-col gap-1"
                  >
                    {group.items.map((item) => (
                      <Link
                        key={item.key}
                        className={
                          item.key === active
                            ? "rounded-lg bg-surface-card px-3 py-2.5 text-sm text-ink"
                            : "rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-surface-card hover:text-ink"
                        }
                        href={item.href}
                        aria-current={item.key === active ? "page" : undefined}
                        onClick={() => navOpen && closeNav()}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          <Link
            key={settingsNavItem.key}
            className={
              settingsNavItem.key === active
                ? "rounded-lg bg-surface-card px-3 py-2.5 text-sm text-ink"
                : "rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-surface-card hover:text-ink"
            }
            href={settingsNavItem.href}
            aria-current={settingsNavItem.key === active ? "page" : undefined}
            onClick={() => navOpen && closeNav()}
          >
            {settingsNavItem.label}
          </Link>
        </div>
        <div className="mt-auto flex flex-col gap-2 border-t border-hairline p-4">
          <Button
            variant="outline"
            className="w-full justify-start border-hairline bg-canvas"
            onClick={() => setSearching(true)}
          >
            <Search data-icon="inline-start" /> Search space
            <Kbd className="ml-auto">⌘K</Kbd>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground"
            onClick={async () => {
              await logout();
              router.push("/login");
              router.refresh();
            }}
          >
            <LogOut data-icon="inline-start" /> Sign out
          </Button>
        </div>
        {!collapsed && (
          // spec.md §5.4 "Resize limits": "The rail can be dragged to
          // resize... dragging past the minimum collapses." ARIA "window
          // splitter" pattern: a focusable separator with arrow-key support
          // as the accessible alternative to dragging. The ARIA APG only
          // recommends the native <hr> for a non-focusable separator; this
          // one is focusable and carries aria-value*, which <hr> cannot.
          // biome-ignore lint/a11y/useSemanticElements: see comment above.
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize navigation width"
            aria-valuemin={sidebarMinWidth}
            aria-valuemax={sidebarMaxWidth}
            aria-valuenow={width}
            tabIndex={0}
            onPointerDown={onResizePointerDown}
            onPointerMove={onResizePointerMove}
            onPointerUp={onResizePointerUp}
            onKeyDown={onResizeKeyDown}
            className="absolute inset-y-0 -right-1 hidden w-2 cursor-col-resize touch-none outline-none lg:block after:absolute after:inset-y-0 after:left-1/2 after:w-px after:-translate-x-1/2 after:bg-hairline hover:after:bg-coral focus-visible:after:bg-coral"
          />
        )}
      </aside>
      <div className="min-w-0">
        <header className="flex h-16 items-center justify-between border-b border-hairline bg-canvas px-5 lg:px-10">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              ref={navTrigger}
              aria-label="Open navigation"
              aria-expanded={navOpen}
              onClick={() => setNavOpen(true)}
            >
              <PanelLeft />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:inline-flex"
              ref={desktopToggle}
              aria-label={collapsed ? "Show navigation" : "Hide navigation"}
              aria-expanded={!collapsed || peeking}
              onClick={() => toggleCollapsed()}
              onMouseEnter={schedulePeekOpen}
              onMouseLeave={schedulePeekClose}
              onFocus={() => {
                if (collapsed) setPeek(true);
              }}
              onBlur={(event) => {
                if (drawer.current?.contains(event.relatedTarget as Node))
                  return;
                setPeek(false);
              }}
            >
              <PanelLeft />
            </Button>
            <span className="text-sm text-muted-foreground">
              {data.spaces.find((space) => space.id === data.spaceId)?.name ??
                "No Space"}
            </span>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm text-ink">{title}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-hairline bg-canvas"
            disabled={!data.spaceId}
            onClick={() => setAdding(true)}
          >
            New object
          </Button>
        </header>
        <SpaceTabs tabs={data.tabs} current={current} />
        <main className="mx-auto max-w-6xl px-5 py-10 lg:px-10">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-coral">
            {eyebrow}
          </p>
          <h1 className="display-face mt-3 text-4xl text-ink">{title}</h1>
          {children}
        </main>
      </div>
      <CommandPalette
        data={data}
        open={searching}
        onOpenChange={setSearching}
        onNewObject={() => setAdding(true)}
      />
      {adding && (
        <ObjectEditor
          data={data}
          onClose={() => setAdding(false)}
          onSaved={async (id) => {
            setAdding(false);
            router.push(`/question/${id}`);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
