import {
  type ForgotPasswordAuthFormSchema,
  sendPasswordResetEmail,
} from "@firebase-oss/ui-core";
import { useForgotPasswordAuthFormSchema, useUI } from "@firebase-oss/ui-react";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigation } from "@/hooks/use-navigation";
import { getAuthErrorMessage } from "@/lib/firebase/auth-error-message";

export function useForgotPasswordFormClient() {
  const ui = useUI();
  const schema = useForgotPasswordAuthFormSchema();
  const { goToSignIn } = useNavigation();
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm<ForgotPasswordAuthFormSchema>({
    resolver: standardSchemaResolver(schema),
    mode: "onChange",
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: ForgotPasswordAuthFormSchema) => {
    try {
      await sendPasswordResetEmail(ui, values.email);
      setEmailSent(true);
    } catch (error) {
      form.setError("root", { message: getAuthErrorMessage(error, ui) });
    }
  };

  return {
    emailSent,
    form,
    goToSignIn,
    isPending: ui.state !== "idle",
    onSubmit,
  };
}
