import {
  type SignInAuthFormSchema,
  signInWithEmailAndPassword,
} from "@firebase-oss/ui-core";
import { useSignInAuthFormSchema, useUI } from "@firebase-oss/ui-react";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useForm } from "react-hook-form";
import { useNavigation } from "@/hooks/use-navigation";
import { getAuthErrorMessage } from "@/lib/firebase/auth-error-message";

export function useSignInFormClient() {
  const ui = useUI();
  const schema = useSignInAuthFormSchema();
  const { goToRegister, goToForgotPassword } = useNavigation();

  const form = useForm<SignInAuthFormSchema>({
    resolver: standardSchemaResolver(schema),
    mode: "onChange",
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: SignInAuthFormSchema) => {
    try {
      await signInWithEmailAndPassword(ui, values.email, values.password);
    } catch (error) {
      form.setError("root", { message: getAuthErrorMessage(error, ui) });
    }
  };

  return {
    form,
    goToForgotPassword,
    goToRegister,
    isMfa: Boolean(ui.multiFactorResolver),
    isPending: ui.state !== "idle",
    onSubmit,
  };
}
