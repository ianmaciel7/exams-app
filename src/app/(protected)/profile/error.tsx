"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  ProfileCard,
  ProfileCardContent,
  ProfileCardFooter,
} from "./_components/profile-card";
import { forgetFailedProfiles } from "./_lib/profile-resource";

export default function ProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("Auth");
  const app = useTranslations("App");

  useEffect(() => {
    console.error(error);
  }, [error]);

  function handleRetry() {
    forgetFailedProfiles();
    reset();
  }

  return (
    <ProfileCard>
      <ProfileCardContent>
        <p role="alert">{t("profileLoadError")}</p>
      </ProfileCardContent>
      <ProfileCardFooter>
        <Button onClick={handleRetry}>{app("tryAgain")}</Button>
      </ProfileCardFooter>
    </ProfileCard>
  );
}
