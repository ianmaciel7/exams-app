"use client";

import type { ComponentProps } from "react";
import { useProfileEmailFormContainer } from "../_hooks/use-profile-email-form-container";
import { ProfileEmailForm } from "./profile-email-form";

type ProfileEmailFormContainerProps = Omit<
  ComponentProps<typeof ProfileEmailForm>,
  "changeEmail"
>;

/**
 * Container: a Server Component page cannot pass the browser-only e-mail
 * change function down, so this client component injects it into the form.
 */
function ProfileEmailFormContainer(props: ProfileEmailFormContainerProps) {
  const changeEmail = useProfileEmailFormContainer();
  return <ProfileEmailForm {...props} changeEmail={changeEmail} />;
}

export { ProfileEmailFormContainer };
