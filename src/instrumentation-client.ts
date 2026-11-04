// cspell:ignore jitless
import { onLog } from "firebase/app";
import { config } from "zod/v4/core";

// Zod probes `new Function` for its JIT parser. The nonce CSP blocks eval, so
// the probe would log a violation on every form page (ADR 0001).
config({ jitless: true });

export function formatFirebaseLog(params: {
  level: string;
  message: string;
  type: string;
}): void {
  const text = `[Firebase:${params.type}] ${params.message}`;

  if (params.level === "error") {
    console.error(text);
  } else if (params.level === "warn") {
    console.warn(text);
  } else {
    console.debug(text);
  }
}

onLog(formatFirebaseLog, {
  level: process.env.NODE_ENV === "development" ? "debug" : "error",
});
