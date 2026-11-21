"use client";

import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { useState } from "react";
import { login } from "@/actions/recall";
import { GoogleSignInButton } from "@/components/recall/google-sign-in-button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { browserAuth } from "@/lib/firebase/client";

export default function LoginPage() {
  const [register, setRegister] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function signInWithGoogle() {
    setBusy(true);
    setError("");
    try {
      const auth = browserAuth();
      const credentials = await signInWithPopup(auth, new GoogleAuthProvider());
      await login(await credentials.user.getIdToken());
      await signOut(auth);
      window.location.assign("/space");
    } catch {
      setError("Could not sign in with Google. Please try again.");
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-canvas p-6">
      <div className="w-full max-w-md">
        <p className="display-face mb-8 text-center text-4xl">✳ Recall</p>
        <Card>
          <CardHeader>
            <CardTitle>
              {register ? "Create your account" : "Welcome back"}
            </CardTitle>
            <CardDescription>
              A quiet place to connect ideas and remember what matters.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={async (event) => {
                event.preventDefault();
                setBusy(true);
                setError("");
                const form = new FormData(event.currentTarget);
                try {
                  const auth = browserAuth();
                  const credentials = await (register
                    ? createUserWithEmailAndPassword
                    : signInWithEmailAndPassword)(
                    auth,
                    String(form.get("email")),
                    String(form.get("password")),
                  );
                  await login(await credentials.user.getIdToken());
                  await signOut(auth);
                  window.location.assign("/space");
                } catch {
                  setError(
                    "Could not sign in. Check your email and password and make sure the local emulators are running.",
                  );
                  setBusy(false);
                }
              }}
            >
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    minLength={6}
                    autoComplete={
                      register ? "new-password" : "current-password"
                    }
                    required
                  />
                </Field>
                {error && (
                  <p role="alert" className="text-sm text-destructive">
                    {error}
                  </p>
                )}
                <Button disabled={busy} type="submit">
                  {busy
                    ? "Connecting…"
                    : register
                      ? "Create account"
                      : "Sign in"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={busy}
                  onClick={() => {
                    setRegister(!register);
                    setError("");
                  }}
                >
                  {register
                    ? "Already have an account? Sign in"
                    : "New here? Create an account"}
                </Button>
              </FieldGroup>
            </form>
            <div className="mt-5 flex items-center gap-2">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">or</span>
              <Separator className="flex-1" />
            </div>
            <GoogleSignInButton
              className="mt-5 w-full"
              disabled={busy}
              onClick={signInWithGoogle}
            />
          </CardContent>
        </Card>
        {process.env.NODE_ENV === "development" && (
          <p className="mt-5 text-center text-xs text-muted-foreground">
            Local development · Firebase emulators
          </p>
        )}
      </div>
    </main>
  );
}
