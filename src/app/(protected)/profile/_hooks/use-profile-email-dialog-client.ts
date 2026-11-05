import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { sendEmailChangeVerification } from "@/lib/auth";
import { toast } from "@/lib/toast";

/** Own the dialog and send browser-only email change requests. */
export function useProfileEmailDialogClient() {
  const t = useTranslations("Auth");
  const [isOpen, setIsOpen] = useState(false);
  const opening = useRef(0);

  const onOpenChange = (open: boolean) => {
    opening.current += 1;
    setIsOpen(open);
  };

  const changeEmail = async (email: string) => {
    const submittedOpening = opening.current;
    try {
      await sendEmailChangeVerification(email);
      toast.add({ title: t("emailVerificationSent"), type: "success" });
      // A request from a dismissed dialog must not close a newly opened one.
      if (submittedOpening === opening.current) setIsOpen(false);
      return true;
    } catch (cause) {
      console.error(cause);
      toast.add({ title: t("profileSaveError"), type: "error" });
      return false;
    }
  };

  return { t, isOpen, onOpenChange, changeEmail };
}
