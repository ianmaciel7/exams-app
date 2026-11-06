import { getTranslation } from "@firebase-oss/ui-core";
import {
  useMultiFactorPhoneAuthVerifyFormSchema,
  useSmsMultiFactorAssertionVerifyFormAction,
  useUI,
} from "@firebase-oss/ui-react";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useForm } from "react-hook-form";
import { getAuthActionErrorMessage } from "@/lib/firebase/auth-error-message";
import type { UserCredential } from "@/lib/firebase/multi-factor";

type Options = {
  verificationId: string;
  onSuccess?: (credential: UserCredential) => void;
};

export function useSmsMultiFactorVerifyFormClient({
  verificationId,
  onSuccess,
}: Options) {
  const ui = useUI();
  const schema = useMultiFactorPhoneAuthVerifyFormSchema();
  const action = useSmsMultiFactorAssertionVerifyFormAction();
  const form = useForm<{ verificationId: string; verificationCode: string }>({
    resolver: standardSchemaResolver(schema),
    mode: "onChange",
    defaultValues: { verificationId, verificationCode: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const credential = await action({
        verificationId: values.verificationId,
        verificationCode: values.verificationCode,
      });
      onSuccess?.(credential);
    } catch (error) {
      form.setError("root", { message: getAuthActionErrorMessage(error, ui) });
    }
  });

  return {
    codeDescription: getTranslation(ui, "prompts", "smsVerificationPrompt"),
    codeLabel: getTranslation(ui, "labels", "verificationCode"),
    control: form.control,
    isPending: ui.state !== "idle",
    onSubmit,
    rootError: form.formState.errors.root?.message,
    submitLabel: getTranslation(ui, "labels", "verifyCode"),
  };
}
