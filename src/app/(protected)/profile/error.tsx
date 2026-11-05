"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

type ProfileErrorProps = {
  error: Error & { digest?: string };
  retry: () => void;
};

export default function ProfileError({ error, retry }: ProfileErrorProps) {
  const t = useTranslations("Auth");
  const app = useTranslations("App");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Card className="mx-auto w-full max-w-sm shadow-md ring-foreground/20 sm:max-w-md lg:max-w-lg">
      <CardContent>
        <Alert variant="destructive">
          <AlertDescription>{t("profileLoadError")}</AlertDescription>
        </Alert>
      </CardContent>
      <CardFooter className="border-t-0 bg-transparent pt-0">
        <Button onClick={retry}>{app("tryAgain")}</Button>
      </CardFooter>
    </Card>
  );
}
