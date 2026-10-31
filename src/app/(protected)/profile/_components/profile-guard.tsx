import { useTranslations } from "next-intl";
import type { ComponentProps, ReactNode } from "react";
import { LoadingPrimitive } from "@/components/ui/extensions/loading-primitive";
import type { ProfileStatus } from "../_hooks/use-profile-status";
import { ProfileCard, ProfileCardContent } from "./profile-card";

type ProfileGuardProps = ComponentProps<"div"> & {
  status: ProfileStatus;
  children: ReactNode;
};

function ProfileGuard({ status, children, ...props }: ProfileGuardProps) {
  const t = useTranslations("Auth");

  if (status.isHidden) return null;

  if (status.isLoading) {
    return (
      <div {...props}>
        <LoadingPrimitive boundary="profile-preferences">
          {t("loading")}
        </LoadingPrimitive>
      </div>
    );
  }

  if (status.isError) {
    return (
      <ProfileCard {...props}>
        <ProfileCardContent>
          <p role="alert">{status.errorMessage}</p>
        </ProfileCardContent>
      </ProfileCard>
    );
  }

  return children;
}

export { ProfileGuard };
