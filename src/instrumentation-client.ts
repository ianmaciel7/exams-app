// cspell:ignore jitless
import { config } from "zod/v4/core";

// Zod probes `new Function` for its JIT parser. The nonce CSP blocks eval, so
// the probe would log a violation on every form page (ADR 0001).
config({ jitless: true });
