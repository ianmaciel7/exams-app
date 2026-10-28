import { recordUsage } from "@/lib/firebase/usage";
import { subscribeToSession } from "@/lib/session";

type AccessSubscriptionOptions = {
  pathname: string;
  onReset: () => void;
  onUnauthenticated: () => void;
  onReady: () => void;
  onError: () => void;
};

export function subscribeToProtectedAccess({
  pathname,
  onReset,
  onUnauthenticated,
  onReady,
  onError,
}: AccessSubscriptionOptions) {
  let active = true;
  let revision = 0;
  const unsubscribe = subscribeToSession((user) => {
    if (!active) return;
    const currentRevision = ++revision;
    onReset();
    if (!user) {
      onUnauthenticated();
      return;
    }
    void recordUsage({ type: "screen_view", name: pathname }).then(
      () => {
        if (active && revision === currentRevision) onReady();
      },
      () => {
        if (active && revision === currentRevision) onError();
      },
    );
  });
  return () => {
    active = false;
    unsubscribe();
  };
}
