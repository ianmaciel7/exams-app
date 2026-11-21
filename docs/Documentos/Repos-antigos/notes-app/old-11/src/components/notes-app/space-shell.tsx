"use client";

import type { ComponentProps, ReactNode } from "react";
import { SpaceLoading } from "@/components/notes-app/space-loading";
import { SpaceShellSidebar } from "@/components/notes-app/space-shell-sidebar";
import { SpacesErrorStatus } from "@/components/notes-app/spaces-error-status";
import { SpacesList } from "@/components/notes-app/spaces-list";
import { SpacesLoadingStatus } from "@/components/notes-app/spaces-loading-status";
import { SpacesNotFoundStatus } from "@/components/notes-app/spaces-not-found-status";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useSpaceShell } from "@/hooks/use-space-shell";
import { cn } from "@/lib/utils";

type SpaceShellProps = Omit<
  ComponentProps<typeof SidebarProvider>,
  "children"
> & {
  children?: ReactNode;
  currentSpaceId?: string;
  onSelectSpace?: (spaceId: string) => void;
};

function SpaceShell({
  children,
  className,
  currentSpaceId,
  onSelectSpace,
  ...props
}: SpaceShellProps) {
  const shell = useSpaceShell({ currentSpaceId, onSelectSpace });
  const notFoundStatus = shell.notFound ? (
    <SpacesNotFoundStatus
      onBack={shell.backToSpaces}
      {...props}
      className={className}
    />
  ) : null;

  if (shell.authLoading) {
    return <SpaceLoading />;
  }

  if (shell.error) {
    return (
      <SpacesErrorStatus
        isOffline={shell.isOffline}
        onRetry={shell.retry}
        {...props}
        className={className}
      />
    );
  }

  if (shell.loading) {
    return <SpacesLoadingStatus {...props} className={className} />;
  }

  if (!shell.user) {
    return notFoundStatus;
  }

  return (
    <SidebarProvider
      {...props}
      className={cn("min-h-svh", className)}
      data-slot="space-shell"
      data-testid="space-shell"
    >
      <SpaceShellSidebar shell={shell} user={shell.user} />
      <SidebarInset>
        <SpacesList
          notFound={shell.notFound}
          onCreate={shell.openCreateDialog}
          showEmptyState={shell.spaces.length === 0}
          status={notFoundStatus}
        >
          {children}
        </SpacesList>
      </SidebarInset>
    </SidebarProvider>
  );
}

export { SpaceShell, type SpaceShellProps };
