import {
  createUserWithEmailAndPassword,
  type SignUpAuthFormSchema,
} from "@firebase-oss/ui-core";
import {
  useRequireDisplayName,
  useSignUpAuthFormSchema,
  useUI,
} from "@firebase-oss/ui-react";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useForm } from "react-hook-form";
import { useNavigation } from "@/hooks/use-navigation";
import { getAuthErrorMessage } from "@/lib/firebase/auth-error-message";

export function useRegisterFormClient() {
  const ui = useUI();
  const schema = useSignUpAuthFormSchema();
  const requireDisplayName = useRequireDisplayName();
  const { goToSignIn } = useNavigation();

  const form = useForm<SignUpAuthFormSchema>({
    resolver: standardSchemaResolver(schema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
      displayName: requireDisplayName ? "" : undefined,
    },
  });

  const onSubmit = async (values: SignUpAuthFormSchema) => {
    try {
      await createUserWithEmailAndPassword(
        ui,
        values.email,
        values.password,
        values.displayName,
      );
    } catch (error) {
      form.setError("root", { message: getAuthErrorMessage(error, ui) });
    }
  };

  return {
    rootError: form.formState.errors.root?.message,
    form,
    goToSignIn,
    isMfa: Boolean(ui.multiFactorResolver),
    isPending: ui.state !== "idle",
    onSubmit,
    requireDisplayName,
  };
}
