import { createContext } from "react";
import type { ProfileActionState } from "./definitions";

/**
 * State of the profile form Action shared with its fields. It is form-scoped
 * (not user identity, which comes from `useSession()`), the counterpart of what
 * `FormProvider` was for React Hook Form.
 */
type ProfileFormContextValue = {
  /** Last result of the form Action: values to show, pending upload, error. */
  submission: ProfileActionState;
  /** Avatar to upload on the next save, and how a new pick is recorded. */
  avatar: { file: File | null; pick: (file: File) => void };
};

const ProfileFormContext = createContext<ProfileFormContextValue | null>(null);

export { ProfileFormContext };
