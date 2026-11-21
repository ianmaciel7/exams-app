"use client";

import { useEffect, useState } from "react";
import { BACKEND_UNREACHABLE_EVENT } from "@/lib/error-capture/firebase-logs";
import { reconnectFirestore } from "@/lib/firebase/firestore";

function useConnectionAlert() {
  const [visible, setVisible] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);

  useEffect(() => {
    const onUnreachable = () => setVisible(true);
    const onOnline = () => setVisible(false);
    window.addEventListener(BACKEND_UNREACHABLE_EVENT, onUnreachable);
    window.addEventListener("online", onOnline);
    return () => {
      window.removeEventListener(BACKEND_UNREACHABLE_EVENT, onUnreachable);
      window.removeEventListener("online", onOnline);
    };
  }, []);

  async function handleReconnect() {
    setReconnecting(true);
    try {
      await reconnectFirestore();
    } finally {
      setReconnecting(false);
    }
  }

  return { visible, reconnecting, handleReconnect };
}

export { useConnectionAlert };
