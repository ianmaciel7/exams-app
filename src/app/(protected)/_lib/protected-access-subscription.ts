import { recordUsage } from "@/lib/firebase/usage";
import { subscribeToSession } from "@/lib/session";

type AccessSubscriptionOptions = {
  pathname: string;
  onReset: () => void;
  onUnauthenticated: () => void;
  onReady: () => void;
};

export function subscribeToProtectedAccess({
  pathname,
  onReset,
  onUnauthenticated,
  onReady,
}: AccessSubscriptionOptions) {
  let active = true;
  let activeUserId: string | null = null;
  const unsubscribe = subscribeToSession((user) => {
    if (!active) return;
    if (!user) {
      activeUserId = null;
      onReset();
      onUnauthenticated();
      return;
    }
    if (activeUserId === user.uid) return;
    activeUserId = user.uid;
    onReset();
    onReady();
    void recordUsage({ type: "screen_view", name: pathname }).catch(() => {});
  });
  return () => {
    active = false;
    unsubscribe();
  };
}
