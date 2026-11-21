"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useSpaces } from "@/hooks/use-spaces";

type UseSpaceShellOptions = {
  currentSpaceId?: string;
  onSelectSpace?: (spaceId: string) => void;
};

function useSpaceShell({
  currentSpaceId,
  onSelectSpace,
}: UseSpaceShellOptions) {
  const router = useRouter();
  const { user, isLoading: authLoading, signOutUser } = useAuth();
  const { spaces, loading, error, isOffline, retry, createSpace } = useSpaces();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const firstSpaceId = spaces[0]?.id;
  const activeSpace = currentSpaceId
    ? spaces.find((space) => space.id === currentSpaceId)
    : spaces[0];
  const notFound = Boolean(currentSpaceId && !activeSpace);

  useEffect(() => {
    if (authLoading || currentSpaceId) {
      return;
    }
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!loading && !error && firstSpaceId) {
      router.replace(`/${firstSpaceId}`);
    }
  }, [authLoading, currentSpaceId, error, firstSpaceId, loading, router, user]);

  const selectSpace = (spaceId: string) => {
    if (onSelectSpace) {
      onSelectSpace(spaceId);
      return;
    }

    router.push(`/${spaceId}`);
  };

  const submitCreateSpace = async (name: string, icon: string) => {
    setIsCreating(true);
    try {
      const id = await createSpace({ name, icon });
      setCreateDialogOpen(false);
      selectSpace(id);
    } finally {
      setIsCreating(false);
    }
  };

  return {
    activeSpace,
    authLoading,
    backToSpaces: () => router.replace("/"),
    createDialogOpen,
    error,
    isCreating,
    isOffline,
    loading,
    onCreateDialogOpenChange: (open: boolean) => setCreateDialogOpen(open),
    onSettingsDialogOpenChange: (open: boolean) => setSettingsDialogOpen(open),
    openCreateDialog: () => setCreateDialogOpen(true),
    openSettingsDialog: () => setSettingsDialogOpen(true),
    retry,
    selectSpace,
    settingsDialogOpen,
    signOutUser,
    spaces,
    submitCreateSpace,
    user,
    notFound,
  };
}

type SpaceShellState = ReturnType<typeof useSpaceShell>;

export { useSpaceShell, type SpaceShellState, type UseSpaceShellOptions };
