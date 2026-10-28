import type { ComponentProps, ReactNode } from "react";
import { LoadingState } from "@/components/ui/extensions/loading-state";
import type { ProfileStatus } from "../_hooks/use-profile-status";
import { ProfileCard, ProfileCardContent } from "./profile-card";

type ProfileGuardProps = ComponentProps<"div"> & {
  status: ProfileStatus;
  children: ReactNode;
};

function ProfileGuard({ status, children, ...props }: ProfileGuardProps) {
  if (status.isLoading) {
    return (
      <div {...props}>
        <LoadingState boundary="profile-preferences" />
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
