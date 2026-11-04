import { useState } from "react";

type UseProfileAvatarDraftOptions<TState> = {
  actionState: TState;
  actionAvatar: File | null;
};

type DraftRecord<TState> = {
  baseState: TState;
  file: File | null;
};

/**
 * Encapsulates the avatar draft picked between Action dispatches.
 *
 * Uses pure derivation: when actionState changes, any previous draft
 * is automatically invalidated on the first render pass without
 * triggering render-phase state adjustments or cascading updates.
 */
export function useProfileAvatarDraft<TState>({
  actionState,
  actionAvatar,
}: UseProfileAvatarDraftOptions<TState>) {
  const [draftRecord, setDraftRecord] = useState<DraftRecord<TState>>({
    baseState: actionState,
    file: null,
  });

  const pickedAvatar =
    draftRecord.baseState === actionState ? draftRecord.file : null;

  const pickAvatar = (file: File | null) => {
    setDraftRecord({ baseState: actionState, file });
  };

  return {
    avatarFile: pickedAvatar ?? actionAvatar,
    pickedAvatar,
    pickAvatar,
  };
}
