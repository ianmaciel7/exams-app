"use client";
import { Copy, KeyRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createSpaceApiKey, revokeSpaceApiKey } from "@/actions/api-keys";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { ApiKeySummary } from "@/domain/api-keys";

export function ApiKeysCard({
  spaceId,
  keys,
}: {
  spaceId: string;
  keys: ApiKeySummary[];
}) {
  const router = useRouter();
  const [issued, setIssued] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <Card className="mt-8 border-hairline bg-canvas shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <KeyRound className="size-4 text-coral" /> MCP API keys
        </CardTitle>
        <CardDescription>
          Read-only keys for this Space. An AI client sends one as{" "}
          <code>Authorization: Bearer …</code> to <code>/api/mcp</code>.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            const form = event.currentTarget;
            setBusy(true);
            setError("");
            try {
              const created = await createSpaceApiKey(
                spaceId,
                String(new FormData(form).get("label") ?? ""),
              );
              setIssued(created.key);
              form.reset();
              router.refresh();
            } catch (cause) {
              setError(
                cause instanceof Error
                  ? cause.message
                  : "Could not create a key.",
              );
            } finally {
              setBusy(false);
            }
          }}
        >
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="key-label">Label</FieldLabel>
              <Input
                id="key-label"
                name="label"
                required
                maxLength={80}
                placeholder="Claude Desktop"
              />
            </Field>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <Button type="submit" disabled={busy}>
              {busy ? "Generating…" : "Generate key"}
            </Button>
          </FieldGroup>
        </form>
        {issued && (
          <output className="block rounded-lg border border-coral/40 bg-surface-soft p-4">
            <p className="text-sm font-medium text-ink">
              Copy this key now — it is not shown again.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <code
                data-testid="issued-key"
                className="min-w-0 flex-1 truncate rounded bg-canvas px-3 py-2 text-sm"
              >
                {issued}
              </code>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => navigator.clipboard.writeText(issued)}
              >
                <Copy className="size-4" /> Copy
              </Button>
            </div>
          </output>
        )}
        <div className="flex flex-col gap-3">
          {keys.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No keys yet. Generate one to connect an MCP client.
            </p>
          ) : (
            keys.map((key) => (
              <div
                key={key.id}
                className="flex items-center gap-3 rounded-lg border border-hairline p-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-ink">{key.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Created {new Date(key.createdAt).toLocaleDateString()}
                    {key.lastUsedAt &&
                      ` · last used ${new Date(key.lastUsedAt).toLocaleDateString()}`}
                  </p>
                </div>
                {key.revokedAt ? (
                  <Badge variant="outline">Revoked</Badge>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={busy}
                    onClick={async () => {
                      setBusy(true);
                      try {
                        await revokeSpaceApiKey(spaceId, key.id);
                        router.refresh();
                      } finally {
                        setBusy(false);
                      }
                    }}
                  >
                    Revoke
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
