"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { KindIcon } from "@/components/recall/kind-icon";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Snapshot } from "@/domain/recall";

const destinations = [
  { href: "/space", label: "Go to Overview" },
  { href: "/question", label: "Go to Questions" },
  { href: "/study", label: "Go to Study session" },
  { href: "/review", label: "Go to Review queue" },
  { href: "/settings", label: "Go to Settings" },
];

export function CommandPalette({
  data,
  open,
  onOpenChange,
  onNewObject,
}: {
  data: Snapshot;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNewObject: () => void;
}) {
  const router = useRouter();
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      // spec.md 5.5: Mod+K and Mod+P both open the one command dialog.
      const key = event.key.toLowerCase();
      if ((key !== "k" && key !== "p") || !(event.metaKey || event.ctrlKey))
        return;
      event.preventDefault();
      onOpenChange(!open);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  // Opening the palette is a view transition, never a mutation (FR-12): every
  // item here either navigates or hands off to an explicit create dialog.
  function run(action: () => void) {
    onOpenChange(false);
    action();
  }
  const objects = data.objects.filter((object) => !object.archived);
  // Composed here rather than via the generated CommandDialog, whose header
  // renders outside DialogContent and so has no popup context to attach to.
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="overflow-hidden p-0 sm:max-w-xl"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Search space</DialogTitle>
          <DialogDescription>
            Search objects in this Space, or jump to a section.
          </DialogDescription>
        </DialogHeader>
        <Command>
          <CommandInput placeholder="Search objects, or jump to a section…" />
          <CommandList>
            <CommandEmpty>Nothing matches that.</CommandEmpty>
            {objects.length > 0 && (
              <CommandGroup heading="Objects">
                {objects.map((object) => (
                  <CommandItem
                    key={object.id}
                    value={`${object.title} ${object.kind}`}
                    onSelect={() =>
                      run(() => router.push(`/question/${object.id}`))
                    }
                  >
                    <KindIcon
                      kind={object.kind}
                      className="size-4 text-coral"
                    />
                    <span className="truncate">{object.title}</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {object.kind}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            <CommandSeparator />
            <CommandGroup heading="Actions">
              {data.spaceId && (
                <CommandItem
                  value="new object create"
                  onSelect={() => run(onNewObject)}
                >
                  New object
                </CommandItem>
              )}
              {destinations.map((destination) => (
                <CommandItem
                  key={destination.href}
                  value={destination.label}
                  onSelect={() => run(() => router.push(destination.href))}
                >
                  {destination.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
