import { useTranslations } from "next-intl";
import { type FormEvent, useActionState } from "react";

type ProfileEmailFormState = { email: string; hasError: boolean };

/** The e-mail form's Action state around the injected change function. */
export function useProfileEmailForm(
  changeEmail: (email: string) => Promise<boolean>,
  email: string,
) {
  const t = useTranslations("Auth");
  const [state, dispatch, pending] = useActionState(
    async (_previous: ProfileEmailFormState, formData: FormData) => {
      const nextEmail = String(formData.get("newEmail") ?? "").trim();
      const sent = await changeEmail(nextEmail);
      return { email: nextEmail, hasError: !sent };
    },
    { email, hasError: false },
  );
  // Portals separate the DOM forms, but React submit events still bubble.
  const onSubmit = (event: FormEvent<HTMLFormElement>) =>
    event.stopPropagation();
  return { t, dispatch, pending, state, onSubmit };
}
