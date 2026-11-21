// spec.md 5.5: open object views persist under one stable key so a reload
// reopens the same identities. Only ids are stored — titles are resolved from
// the Space snapshot, so a renamed object never shows a stale tab label and
// an id from another Space simply fails to resolve.
export const tabsCookie = "recall-tabs";
export const maxTabs = 8;

export function parseTabs(value: string | undefined): string[] {
  if (!value) return [];
  return [
    ...new Set(
      value.split(",").filter((id) => /^[a-zA-Z0-9_-]{1,128}$/.test(id)),
    ),
  ].slice(0, maxTabs);
}

export function serializeTabs(ids: string[]): string {
  return [...new Set(ids)].slice(-maxTabs).join(",");
}

// Closing a tab has to pick the next selection deterministically: the tab that
// slid into the closed one's slot, or the last one when it was the rightmost.
export function nextActiveTab(ids: string[], closing: string): string | null {
  const index = ids.indexOf(closing);
  const remaining = ids.filter((id) => id !== closing);
  if (index < 0 || remaining.length === 0) return null;
  return remaining[Math.min(index, remaining.length - 1)];
}
