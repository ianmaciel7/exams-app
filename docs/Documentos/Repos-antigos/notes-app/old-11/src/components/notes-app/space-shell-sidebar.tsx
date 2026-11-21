"use client";

import type { User } from "firebase/auth";
import type { ComponentProps } from "react";
import { CreateSpaceDialog } from "@/components/notes-app/create-space-dialog";
import { ExamNavigation } from "@/components/notes-app/exam-navigation";
import { SettingsDialog } from "@/components/notes-app/settings-dialog";
import { SidebarUserMenu } from "@/components/notes-app/sidebar-user-menu";
import { SpaceSwitcher } from "@/components/notes-app/space-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import type { SpaceShellState } from "@/hooks/use-space-shell";
import { cn } from "@/lib/utils";

type SpaceShellSidebarProps = Omit<
  ComponentProps<typeof Sidebar>,
  "children"
> & {
  shell: SpaceShellState;
  user: User;
};

function SpaceShellSidebar({
  className,
  shell,
  user,
  ...props
}: SpaceShellSidebarProps) {
  const { activeSpace } = shell;

  return (
    <>
      <Sidebar
        data-slot="space-shell-sidebar"
        variant="inset"
        collapsible="none"
        {...props}
        className={cn("sticky top-0 h-svh self-start", className)}
      >
        <SidebarHeader>
          <SpaceSwitcher
            activeSpace={activeSpace}
            onCreate={shell.openCreateDialog}
            onSelect={shell.selectSpace}
            spaces={shell.spaces}
          />
        </SidebarHeader>
        <SidebarContent>
          {activeSpace ? <ExamNavigation spaceId={activeSpace.id} /> : null}
        </SidebarContent>
        <SidebarFooter className="mt-auto">
          <SidebarUserMenu
            user={user}
            onOpenSettings={shell.openSettingsDialog}
            onSignOut={shell.signOutUser}
          />
        </SidebarFooter>
      </Sidebar>
      <CreateSpaceDialog
        open={shell.createDialogOpen}
        onOpenChange={shell.onCreateDialogOpenChange}
        onSubmitSpace={shell.submitCreateSpace}
        isLoading={shell.isCreating}
      />
      <SettingsDialog
        open={shell.settingsDialogOpen}
        onOpenChange={shell.onSettingsDialogOpenChange}
      />
    </>
  );
}

export { SpaceShellSidebar, type SpaceShellSidebarProps };
