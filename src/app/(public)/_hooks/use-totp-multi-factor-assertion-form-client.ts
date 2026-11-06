import { getTranslation } from "@firebase-oss/ui-core";
import {
  useMultiFactorTotpAuthVerifyFormSchema,
  useTotpMultiFactorAssertionFormAction,
  useUI,
} from "@firebase-oss/ui-react";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useForm } from "react-hook-form";
import { getAuthActionErrorMessage } from "@/lib/firebase/auth-error-message";
import type {
  MultiFactorInfo,
  UserCredential,
} from "@/lib/firebase/multi-factor";

type Options = {
  hint: MultiFactorInfo;
  onSuccess?: (credential: UserCredential) => void;
};

export function useTotpMultiFactorAssertionFormClient({
  hint,
  onSuccess,
}: Options) {
  const ui = useUI();
  const schema = useMultiFactorTotpAuthVerifyFormSchema();
  const action = useTotpMultiFactorAssertionFormAction();
  const form = useForm<{ verificationCode: string }>({
    resolver: standardSchemaResolver(schema),
    mode: "onChange",
    defaultValues: { verificationCode: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const credential = await action({
        verificationCode: values.verificationCode,
        hint,
      });
      onSuccess?.(credential);
    } catch (error) {
      form.setError("root", { message: getAuthActionErrorMessage(error, ui) });
    }
  });

  return {
    codeLabel: getTranslation(ui, "labels", "verificationCode"),
    control: form.control,
    isPending: ui.state !== "idle",
    onSubmit,
    rootError: form.formState.errors.root?.message,
    submitLabel: getTranslation(ui, "labels", "verifyCode"),
  };
}
