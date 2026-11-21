"use client";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { addMember, createSpace } from "@/actions/recall";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { Snapshot } from "@/domain/recall";

function selectSpace(spaceId: string) {
  // biome-ignore lint/suspicious/noDocumentCookie: the selected Space must be available during the next server render.
  document.cookie = `recall-space=${spaceId}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}

export function SpaceSwitcher({ data }: { data: Snapshot }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const current = data.spaces.find((space) => space.id === data.spaceId);
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              className="h-auto justify-between px-3 py-2 text-sm font-medium"
            />
          }
        >
          {current?.name ?? "No Space yet"}
          <ChevronsUpDown className="size-4 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Your Spaces</DropdownMenuLabel>
            {data.spaces.map((space) => (
              <DropdownMenuItem
                key={space.id}
                onClick={() => {
                  selectSpace(space.id);
                  router.push("/space");
                  router.refresh();
                }}
              >
                {space.id === data.spaceId && <Check className="size-4" />}
                {space.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setCreating(true)}>
            <Plus className="size-4" /> New Space
          </DropdownMenuItem>
          {current?.ownerId === data.uid && (
            <DropdownMenuItem onClick={() => setInviting(true)}>
              Invite a member
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog
        open={creating}
        onOpenChange={(open) => {
          setCreating(open);
          setError("");
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a Space</DialogTitle>
            <DialogDescription>
              Spaces are private. Invite members once it exists.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={async (event) => {
              event.preventDefault();
              setBusy(true);
              setError("");
              const name = String(
                new FormData(event.currentTarget).get("name") ?? "",
              );
              try {
                const id = await createSpace(name);
                selectSpace(id);
                setCreating(false);
                router.push("/space");
                router.refresh();
              } catch (cause) {
                setError(
                  cause instanceof Error
                    ? cause.message
                    : "Could not create Space.",
                );
              } finally {
                setBusy(false);
              }
            }}
          >
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="space-name">Space name</FieldLabel>
                <Input id="space-name" name="name" required maxLength={80} />
              </Field>
              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}
              <Button type="submit" disabled={busy}>
                {busy ? "Creating…" : "Create Space"}
              </Button>
            </FieldGroup>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog
        open={inviting}
        onOpenChange={(open) => {
          setInviting(open);
          setError("");
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite a member</DialogTitle>
            <DialogDescription>
              They must already have a Recall account.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={async (event) => {
              event.preventDefault();
              setBusy(true);
              setError("");
              const email = String(
                new FormData(event.currentTarget).get("email") ?? "",
              );
              try {
                await addMember(data.spaceId, email);
                setInviting(false);
                router.refresh();
              } catch (cause) {
                setError(
                  cause instanceof Error
                    ? cause.message
                    : "Could not add member.",
                );
              } finally {
                setBusy(false);
              }
            }}
          >
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="invite-email">Email</FieldLabel>
                <Input id="invite-email" name="email" type="email" required />
              </Field>
              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}
              <Button type="submit" disabled={busy}>
                {busy ? "Adding…" : "Add member"}
              </Button>
            </FieldGroup>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
