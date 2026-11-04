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
