"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { forgetFailedProfiles } from "./_lib/profile-resource";

export default function ProfileError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const t = useTranslations("Auth");
  const app = useTranslations("App");

  useEffect(() => {
    console.error(error);
  }, [error]);

  function handleRetry() {
    forgetFailedProfiles();
    retry();
  }

  return (
    <Card className="mx-auto w-full max-w-sm shadow-md ring-foreground/20 sm:max-w-md lg:max-w-lg">
      <CardContent>
        <p role="alert">{t("profileLoadError")}</p>
      </CardContent>
      <CardFooter className="border-t-0 bg-transparent pt-0">
        <Button onClick={handleRetry}>{app("tryAgain")}</Button>
      </CardFooter>
    </Card>
  );
}
