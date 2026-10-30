import type { User } from "firebase/auth";
import { subscribeToSession } from "@/lib/session";

type AccessSubscriptionOptions = {
  onUnauthenticated: () => void;
  onAuthenticated: (userId: string) => void;
  onError?: (error: Error) => void;
};

type SessionHandlerState = {
  active: boolean;
  lastUserId?: string | null;
};

function notifySessionTransition(
  user: User | null,
  state: SessionHandlerState,
  onAuthenticated: (userId: string) => void,
  onUnauthenticated: () => void,
) {
  if (!state.active) return;
  const nextUserId = user ? user.uid : null;
  if (nextUserId === state.lastUserId) return;
  state.lastUserId = nextUserId;
  if (nextUserId) {
    onAuthenticated(nextUserId);
    return;
  }
  onUnauthenticated();
}

/**
 * Observes Firebase Auth session state for protected routes.
 * Emits authenticated state changes and handles unauthenticated state transitions.
 */
export function subscribeToProtectedAccess({
  onUnauthenticated,
  onAuthenticated,
  onError,
}: AccessSubscriptionOptions) {
  const state: SessionHandlerState = { active: true };

  const unsubscribe = subscribeToSession(
    (user) => {
      notifySessionTransition(user, state, onAuthenticated, onUnauthenticated);
    },
    (error) => {
      if (state.active) onError?.(error);
    },
  );

  return () => {
    state.active = false;
    unsubscribe();
  };
}
