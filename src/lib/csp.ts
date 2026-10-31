// cspell:ignore firebaseio gstatic
import { headers } from "next/headers";

/** Request header that carries the per-request CSP nonce to Server Components. */
export const nonceHeader = "x-nonce";

/** Reads the per-request CSP nonce that `src/proxy.ts` sets. */
export async function getNonce() {
  return (await headers()).get(nonceHeader) ?? undefined;
}

type ContentSecurityPolicyOptions = {
  nonce: string;
  isDevelopment: boolean;
  /** Public Firebase Web configuration and emulator endpoints. */
  env?: Partial<Record<string, string | undefined>>;
};

/** Returns a base64 nonce with 128 bits of entropy, as CSP Level 3 requires. */
export function createNonce() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return btoa(String.fromCharCode(...bytes));
}

function toOrigin(value: string | undefined, protocol = "https:") {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  try {
    return new URL(
      trimmed.includes("://") ? trimmed : `${protocol}//${trimmed}`,
    ).origin;
  } catch {
    return undefined;
  }
}

function toWebSocketOrigin(origin: string) {
  return origin.replace(/^http/, "ws");
}

function emulatorOrigins(env: Partial<Record<string, string | undefined>>) {
  return [
    env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST,
    env.NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST,
    env.NEXT_PUBLIC_FIREBASE_DATABASE_EMULATOR_HOST,
    env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR_HOST,
    env.NEXT_PUBLIC_FIREBASE_STORAGE_EMULATOR_HOST,
  ]
    .map((host) => toOrigin(host, "http:"))
    .filter((origin) => origin !== undefined)
    .flatMap((origin) => [origin, toWebSocketOrigin(origin)]);
}

type Sources = (string | undefined)[];

/** Where `public/firebase-auth-sw.js` imports the Firebase SDK from. */
const firebaseWorkerImports = "https://www.gstatic.com/firebasejs/";

function scriptSources(nonce: string, isDevelopment: boolean): Sources {
  return [
    "'self'",
    `'nonce-${nonce}'`,
    "'strict-dynamic'",
    "https:",
    "'unsafe-inline'",
    // React rebuilds server error stacks with eval in development only.
    isDevelopment ? "'unsafe-eval'" : undefined,
  ];
}

/** Firebase Auth, Firestore, Storage, Realtime Database, and Functions. */
function firebaseConnectSources(
  env: Partial<Record<string, string | undefined>>,
  emulators: string[],
): Sources {
  const authDomain = toOrigin(env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN);
  const databaseOrigin = toOrigin(env.NEXT_PUBLIC_FIREBASE_DATABASE_URL);
  return [
    "https://*.googleapis.com",
    "https://*.firebaseio.com",
    "wss://*.firebaseio.com",
    databaseOrigin,
    databaseOrigin ? toWebSocketOrigin(databaseOrigin) : undefined,
    "https://*.cloudfunctions.net",
    authDomain,
    ...emulators,
  ];
}

/** Firebase Auth iframes, Google sign-in, and the phone-auth reCAPTCHA. */
function frameSources(
  env: Partial<Record<string, string | undefined>>,
  emulators: string[],
): Sources {
  return [
    "'self'",
    toOrigin(env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
    "https://apis.google.com",
    "https://www.google.com/recaptcha/",
    "https://recaptcha.google.com/recaptcha/",
    ...emulators.filter((origin) => origin.startsWith("http")),
  ];
}

/**
 * Builds the strict, nonce-based policy from the Next.js CSP guide. Scripts
 * load through `'strict-dynamic'`, so Firebase Auth, Google sign-in, and
 * reCAPTCHA scripts injected by trusted bundles keep working; `https:` and
 * `'unsafe-inline'` are only fallbacks for browsers without CSP Level 3.
 */
export function buildContentSecurityPolicy({
  nonce,
  isDevelopment,
  env = {},
}: ContentSecurityPolicyOptions) {
  const emulators = isDevelopment ? emulatorOrigins(env) : [];
  const directives: Record<string, Sources> = {
    "default-src": ["'self'"],
    "script-src": scriptSources(nonce, isDevelopment),
    // Development style injection has no nonce. In production, <style>
    // elements need the nonce (Next.js and Base UI CSPProvider add it).
    "style-src": [
      "'self'",
      isDevelopment ? "'unsafe-inline'" : `'nonce-${nonce}'`,
    ],
    // Server-rendered style="" attributes from Base UI, Motion, and charts.
    "style-src-attr": ["'unsafe-inline'"],
    "img-src": ["'self'", "blob:", "data:"],
    "font-src": ["'self'", "data:"],
    "connect-src": ["'self'", ...firebaseConnectSources(env, emulators)],
    "frame-src": frameSources(env, emulators),
    // 'strict-dynamic' drops 'self' from script-src, so the auth session
    // worker needs its own source list. Chromium checks the module worker's
    // static Firebase imports against the registering page's worker-src, so
    // without the gstatic path the worker cannot start.
    "worker-src": ["'self'", firebaseWorkerImports],
    "manifest-src": ["'self'"],
    "media-src": ["'self'", "blob:"],
    "object-src": ["'none'"],
    "base-uri": ["'none'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'self'"],
  };

  return Object.entries(directives)
    .map(([name, sources]) =>
      [name, ...new Set(sources.filter(Boolean))].join(" "),
    )
    .join("; ");
}
