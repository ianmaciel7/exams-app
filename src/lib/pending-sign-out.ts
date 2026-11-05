// Keep session observers blocked until Firebase and cookie sign-out settle.
// Shared state avoids a circular dependency between auth and session modules.
let pendingSignOut: Promise<void> | null = null;

export function getPendingSignOut(): Promise<void> | null {
  return pendingSignOut;
}

export function setPendingSignOut(pending: Promise<void> | null): void {
  pendingSignOut = pending;
}
