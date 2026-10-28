"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const t = useTranslations("App");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-svh flex-1 flex-col items-center justify-center p-6 text-center">
      <h2 className="text-2xl font-semibold tracking-tight">
        {t("errorTitle")}
      </h2>
      <p className="mt-2 text-muted-foreground">{t("errorMessage")}</p>
      <Button onClick={() => retry()} className="mt-6">
        {t("tryAgain")}
      </Button>
    </main>
  );
}
