import { useEffect, useState } from "react";
import { getFirebaseUI } from "@/lib/firebase/client";

export function useFirebaseUi() {
  const [ui, setUI] = useState<ReturnType<typeof getFirebaseUI>>();
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    try {
      setUI(getFirebaseUI());
    } catch (cause) {
      console.error(cause);
      setIsError(true);
    }
  }, []);

  return { ui, isError };
}
