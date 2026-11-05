"use client";

import type { ComponentProps } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoadingStatus } from "@/components/ui/extensions/loading-status";
import { cn } from "@/lib/utils";
import { useProfileCardClient } from "../_hooks/use-profile-card-client";
import { ProfileForm } from "./profile-form";

type ProfileCardClientProps = ComponentProps<typeof Card> & {
  title: string;
  description: string;
};

function ProfileCardClient({
  title,
  description,
  className,
  ...props
}: ProfileCardClientProps) {
  const profile = useProfileCardClient();
  if (profile.isLoading) return <LoadingStatus />;

  return (
    <Card
      {...props}
      className={cn(
        "mx-auto w-full max-w-sm shadow-md ring-foreground/20 sm:max-w-md lg:max-w-lg",
        className,
      )}
    >
      <CardHeader>
        <CardTitle role="heading" aria-level={1}>
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ProfileForm initialValues={profile.values} />
      </CardContent>
    </Card>
  );
}

export { ProfileCardClient };
