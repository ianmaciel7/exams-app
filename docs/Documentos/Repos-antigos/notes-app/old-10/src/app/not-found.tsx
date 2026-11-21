import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-5 bg-canvas px-6 text-center">
      <p className="text-sm font-medium uppercase tracking-[0.16em] text-coral">
        404
      </p>
      <h1 className="display-face text-4xl text-ink">We can't find that.</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        It may have been archived, or it belongs to a Space you are not a member
        of.
      </p>
      <Button nativeButton={false} render={<Link href="/space" />}>
        Back to your space
      </Button>
    </main>
  );
}
