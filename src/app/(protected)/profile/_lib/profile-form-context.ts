import { createContext } from "react";
import type { ProfileActionState } from "./definitions";

/**
 * State of the profile form Action shared with its fields, read with
 * `use(ProfileFormContext)`. It is form-scoped (user identity comes from
 * `useSession()`), the counterpart of what `FormProvider` was for React Hook
 * Form.
 */
type ProfileFormContextValue = {
  /** Last result of the form Action: values to show, pending upload, error. */
  submission: ProfileActionState;
  /** Avatar to upload on the next save, and how a new pick is recorded. */
  avatar: { file: File | null; pick: (file: File) => void };
};

const emptyValues = {
  displayName: "",
  email: "",
  locale: "en",
  theme: "system",
} as const;

/** Only seen by a field rendered outside `ProfileFormClient`. */
const ProfileFormContext = createContext<ProfileFormContextValue>({
  submission: {
    saved: emptyValues,
    values: emptyValues,
    avatarFile: null,
    error: null,
    savedCount: 0,
  },
  avatar: { file: null, pick: () => {} },
});

export { ProfileFormContext };
