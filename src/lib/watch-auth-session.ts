import type { User } from "firebase/auth";
import type { loadAuth, loadSession } from "@/lib/firebase-loaders";

/** A settled session with no user is a signed-out visitor, never a failure. */
export type AuthSession =
  | { isError: false; isLoading: true; user: null }
  | { isError: false; isLoading: false; user: User | null }
  | { isError: true; isLoading: false; user: null };

export type SessionModules = [
  Awaited<ReturnType<typeof loadSession>>,
  Awaited<ReturnType<typeof loadAuth>>,
];

export type SessionWatch = {
  fail: (cause: unknown) => void;
  revision: { current: number };
  setSession: (session: AuthSession) => void;
  signal: AbortSignal;
};

/** Subscribe to the loaded session modules, holding sign-out until it persists. */
export function watchSession(
  [{ subscribeToSession }, { getPendingSignOut }]: SessionModules,
  { fail, revision, setSession, signal }: SessionWatch,
) {
  const settle = (user: User | null) => {
    const current = ++revision.current;
    const next: AuthSession = { isError: false, isLoading: false, user };
    const pending = user ? null : getPendingSignOut();
    if (!pending) return setSession(next);

    // Avoid exposing the signed-out state while Firebase is still persisting
    // sign-out. A rapid navigation could otherwise restore stale auth.
    const finish = () => {
      if (!signal.aborted && revision.current === current) setSession(next);
    };
    void pending.then(finish, finish);
  };
  return subscribeToSession(settle, fail);
}
