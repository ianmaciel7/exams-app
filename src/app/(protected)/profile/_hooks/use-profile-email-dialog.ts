import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { toast } from "@/lib/toast";
import { useProfileGateway } from "./use-profile-gateway";

/** Own the dialog and inject the browser-only e-mail change operation. */
export function useProfileEmailDialog() {
  const t = useTranslations("Auth");
  const gateway = useProfileGateway();
  const [isOpen, setIsOpen] = useState(false);
  const opening = useRef(0);

  const onOpenChange = (open: boolean) => {
    opening.current += 1;
    setIsOpen(open);
  };

  const changeEmail = async (email: string) => {
    const submittedOpening = opening.current;
    try {
      await gateway.changeEmail(email);
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
