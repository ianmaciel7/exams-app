import { useTranslations } from "next-intl";
import { useActionState } from "react";

/** The e-mail form's Action state around the injected change function. */
export function useProfileEmailForm(
  changeEmail: (email: string) => Promise<void>,
) {
  const t = useTranslations("Auth");
  const [, dispatch, pending] = useActionState(
    async (_previous: null, formData: FormData) => {
      await changeEmail(String(formData.get("newEmail") ?? "").trim());
      return null;
    },
    null,
  );
  return { t, dispatch, pending };
}
