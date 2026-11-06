import { getTranslation } from "@firebase-oss/ui-core";
import {
  useRecaptchaVerifier,
  useSmsMultiFactorAssertionPhoneFormAction,
  useUI,
} from "@firebase-oss/ui-react";
import { useRef, useState } from "react";
import { getAuthActionErrorMessage } from "@/lib/firebase/auth-error-message";
import type { MultiFactorInfo } from "@/lib/firebase/multi-factor";

type PhoneMultiFactorInfo = MultiFactorInfo & { phoneNumber?: string };

type Options = {
  hint: MultiFactorInfo;
  onCodeSent: (verificationId: string) => void;
};

export function useSmsMultiFactorPhoneSectionClient({
  hint,
  onCodeSent,
}: Options) {
  const ui = useUI();
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const recaptchaVerifier = useRecaptchaVerifier(recaptchaContainerRef);
  const action = useSmsMultiFactorAssertionPhoneFormAction();
  const [error, setError] = useState<string | null>(null);

  const sendCode = async () => {
    try {
      setError(null);
      const verificationId = await action({
        hint,
        recaptchaVerifier: recaptchaVerifier!,
      });
      onCodeSent(verificationId);
    } catch (error) {
      setError(getAuthActionErrorMessage(error, ui));
    }
  };

  return {
    description: getTranslation(ui, "messages", "mfaSmsAssertionPrompt", {
      phoneNumber: (hint as PhoneMultiFactorInfo).phoneNumber || "",
    }),
    error,
    isPending: ui.state !== "idle",
    recaptchaContainerRef,
    sendCode,
    sendLabel: getTranslation(ui, "labels", "sendCode"),
    title: getTranslation(ui, "labels", "phoneNumber"),
  };
}
