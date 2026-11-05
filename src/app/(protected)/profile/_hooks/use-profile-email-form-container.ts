import { useTranslations } from "next-intl";
import { toast } from "@/lib/toast";
import { useProfileGateway } from "./use-profile-gateway";

/** The e-mail change function: browser SDK through the port, then a toast. */
export function useProfileEmailFormContainer() {
  const t = useTranslations("Auth");
  const gateway = useProfileGateway();

  return async (email: string) => {
    try {
      await gateway.changeEmail(email);
      toast.add({ title: t("emailVerificationSent"), type: "success" });
    } catch (cause) {
      console.error(cause);
      toast.add({ title: t("profileSaveError"), type: "error" });
    }
  };
}
