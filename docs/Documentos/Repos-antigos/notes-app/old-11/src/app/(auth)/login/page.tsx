"use client";

import {
  GoogleAuthProvider,
  getRedirectResult,
  signInAnonymously,
  signInWithPopup,
  signInWithRedirect,
} from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Suspense, useEffect, useState } from "react";
import { GoogleSignInButton } from "@/components/notes-app/google-sign-in-button";
import { LoginShell } from "@/components/notes-app/login-shell";
import { captureError } from "@/lib/error-capture/capture";
import { auth } from "@/lib/firebase/client";
import { getSafeNextUrl } from "@/lib/navigation/safe-next-url";

// Popup failures that a full-page redirect can recover from.
const REDIRECT_FALLBACK_CODES = new Set([
  "auth/popup-blocked",
  "auth/popup-closed-by-user",
  "auth/operation-not-supported-in-this-environment",
]);

// Raised by the browser runtime (not Firebase) with no error code, so the
// message is the only stable signal available.
const NO_MATCHING_FRAME_MESSAGE = "No matching frame";

function getErrorCode(err: unknown): string | undefined {
  if (typeof err === "object" && err !== null && "code" in err) {
    return String((err as { code: unknown }).code);
  }
  return undefined;
}

function shouldFallBackToRedirect(err: unknown): boolean {
  const code = getErrorCode(err);
  if (code !== undefined && REDIRECT_FALLBACK_CODES.has(code)) {
    return true;
  }
  return (
    err instanceof Error && err.message.includes(NO_MATCHING_FRAME_MESSAGE)
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("auth");
  const nextUrl = getSafeNextUrl(searchParams.get("next"));
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Process redirect result if returning from signInWithRedirect
    getRedirectResult(auth)
      .then((userCredential) => {
        if (userCredential?.user) {
          router.replace(nextUrl);
        }
      })
      .catch((err: unknown) => {
        captureError(err, { source: "firebase-sdk", severity: "warn" });
        setAuthError(t("googleSignInFailed"));
      });
  }, [router, nextUrl, t]);

  async function handleGoogleLogin() {
    const provider = new GoogleAuthProvider();
    provider.addScope("profile");
    provider.addScope("email");
    setAuthError(null);

    try {
      const userCredential = await signInWithPopup(auth, provider);
      if (userCredential.user) {
        router.replace(nextUrl);
      }
    } catch (err: unknown) {
      if (getErrorCode(err) === "auth/cancelled-popup-request") {
        return;
      }

      if (shouldFallBackToRedirect(err)) {
        try {
          await signInWithRedirect(auth, provider);
          return;
        } catch (redirectErr: unknown) {
          captureError(redirectErr, {
            source: "firebase-sdk",
            severity: "warn",
          });
        }
      } else {
        captureError(err, { source: "firebase-sdk", severity: "warn" });
      }
      setAuthError(t("googleSignInFailed"));
    }
  }

  async function handleAnonymousLogin() {
    setAuthError(null);

    try {
      const userCredential = await signInAnonymously(auth);
      if (userCredential.user) {
        router.replace(nextUrl);
      }
    } catch (err: unknown) {
      captureError(err, { source: "firebase-sdk", severity: "warn" });
      setAuthError(t("guestSignInFailed"));
    }
  }

  return (
    <LoginShell
      nextUrl={nextUrl}
      mode={mode}
      authError={authError}
      backToHome={t("backToHome")}
      continueAsGuest={t("continueAsGuest")}
      googleSignIn={<GoogleSignInButton onClick={handleGoogleLogin} />}
      onSignIn={() => router.replace(nextUrl)}
      onSignUp={() => router.replace(nextUrl)}
      onSignInClick={() => setMode("signIn")}
      onSignUpClick={() => setMode("signUp")}
      onAnonymousLogin={handleAnonymousLogin}
    />
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
