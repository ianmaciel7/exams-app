"use client";

import type { ComponentProps } from "react";
import { LoadingStatus } from "@/components/ui/extensions/loading-status";
import { useProfileFormClient } from "../_hooks/use-profile-form-client";
import { ProfileForm } from "./profile-form";

type ProfileFormClientProps = Omit<
  ComponentProps<typeof ProfileForm>,
  "initialValues"
>;

/** Browser integration: reads the profile, then mounts the form with its values. */
function ProfileFormClient(props: ProfileFormClientProps) {
  const profile = useProfileFormClient();
  if (profile.isLoading) return <LoadingStatus />;

  return <ProfileForm {...props} initialValues={profile.values} />;
}

export { ProfileFormClient };
