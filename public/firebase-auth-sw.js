import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import {
  connectAuthEmulator,
  getIdToken,
  indexedDBLocalPersistence,
  initializeAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

let authPromise;

function initializeFirebase(config) {
  if (authPromise) return authPromise;

  authPromise = Promise.resolve().then(() => {
    const app = initializeApp(config.firebase);
    const auth = initializeAuth(app, {
      persistence: indexedDBLocalPersistence,
    });
    if (config.authEmulatorHost) {
      const host = config.authEmulatorHost.includes("://")
        ? config.authEmulatorHost
        : `http://${config.authEmulatorHost}`;
      connectAuthEmulator(auth, host);
    }
    return auth;
  });

  return authPromise;
}

async function getFreshIdToken() {
  if (!authPromise) return null;
  const auth = await authPromise;
  const user = await new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      unsubscribe();
      resolve(currentUser);
    });
  });
  return user ? getIdToken(user, true) : null;
}

self.addEventListener("message", (event) => {
  if (event.data?.type === "firebase-config")
    initializeFirebase(event.data.config);
});

self.addEventListener("activate", (event) =>
  event.waitUntil(self.clients.claim()),
);

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const isNextNavigation =
    request.mode === "navigate" || request.headers.has("RSC");
  if (new URL(request.url).origin !== self.location.origin || !isNextNavigation)
    return;

  event.respondWith(
    (async () => {
      let token;
      try {
        token = await getFreshIdToken();
      } catch {
        // Failed Auth must not block navigation or assert authentication.
        return fetch(request);
      }
      // No worker session is not a server authorization verdict.
      if (!token) return fetch(request);
      const headers = new Headers(request.headers);
      headers.set("x-firebase-auth-bridge", "1");
      headers.set("Authorization", `Bearer ${token}`);
      return fetch(new Request(request, { headers }));
    })(),
  );
});
