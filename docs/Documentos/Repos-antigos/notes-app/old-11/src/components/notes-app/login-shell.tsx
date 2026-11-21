import { AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { LoginCard } from "@/components/notes-app/login-card";
import { RequireGuest } from "@/components/notes-app/require-guest";
import { SignUpCard } from "@/components/notes-app/sign-up-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MODE_SLUGS = { signIn: "sign-in", signUp: "sign-up" } as const;

type LoginShellProps = ComponentProps<"div"> & {
  nextUrl: string;
  mode: "signIn" | "signUp";
  authError: string | null;
  backToHome: string;
  continueAsGuest: string;
  googleSignIn: ReactNode;
  onSignIn: () => void;
  onSignUp: () => void;
  onSignInClick: () => void;
  onSignUpClick: () => void;
  onAnonymousLogin: () => void;
};

function LoginShell({
  className,
  nextUrl,
  mode,
  authError,
  backToHome,
  continueAsGuest,
  googleSignIn,
  onSignIn,
  onSignUp,
  onSignInClick,
  onSignUpClick,
  onAnonymousLogin,
  ...props
}: LoginShellProps) {
  const guestButton = (
    <Button
      data-testid={`login-shell-anonymous-${MODE_SLUGS[mode]}-btn`}
      type="button"
      variant="ghost"
      className="w-full text-muted-foreground hover:text-foreground"
      onClick={onAnonymousLogin}
    >
      {continueAsGuest}
    </Button>
  );
  const card =
    mode === "signIn" ? (
      <LoginCard onSignIn={onSignIn} onSignUpClick={onSignUpClick}>
        {googleSignIn}
        {guestButton}
      </LoginCard>
    ) : (
      <SignUpCard onSignUp={onSignUp} onSignInClick={onSignInClick}>
        {googleSignIn}
        {guestButton}
      </SignUpCard>
    );
  return (
    <RequireGuest redirectTo={nextUrl}>
      <div
        data-slot="login-shell"
        {...props}
        className={cn(
          "relative min-h-[90vh] flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden",
          className
        )}
      >
        <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none">
          <div className="size-125 bg-primary/[0.03] dark:bg-primary/[0.05] rounded-full blur-3xl transform -translate-y-12" />
          <div className="size-75 bg-primary/[0.02] dark:bg-primary/[0.04] rounded-full blur-2xl transform translate-x-32 translate-y-24" />
        </div>
        <div className="w-full max-w-sm space-y-4">
          {authError ? (
            <Alert variant="destructive" data-testid="login-shell-auth-error">
              <AlertCircle className="size-4" />
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          ) : null}
          {card}
        </div>
        <div className="mt-8 text-center text-xs text-muted-foreground">
          <Link
            href="/"
            className="inline-flex items-center gap-1 hover:text-foreground underline-offset-4 hover:underline transition-colors"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            {backToHome}
          </Link>
        </div>
      </div>
    </RequireGuest>
  );
}

export { LoginShell, type LoginShellProps };
