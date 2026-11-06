"use client";

import { getTranslation } from "@firebase-oss/ui-core";
import {
  useMultiFactorTotpAuthVerifyFormSchema,
  useTotpMultiFactorAssertionFormAction,
  useUI,
} from "@firebase-oss/ui-react";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import type { MultiFactorInfo, UserCredential } from "firebase/auth";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/extensions/form";
import { FormError } from "@/components/ui/extensions/form-error";
import { VerificationCodeField } from "@/components/ui/extensions/verification-code-field";
import { Spinner } from "@/components/ui/spinner";
import { getAuthActionErrorMessage } from "@/lib/firebase/auth-error-message";

type TotpMultiFactorAssertionFormProps = {
  hint: MultiFactorInfo;
  onSuccess?: (credential: UserCredential) => void;
};

function TotpMultiFactorAssertionForm(
  props: TotpMultiFactorAssertionFormProps,
) {
  const ui = useUI();
  const schema = useMultiFactorTotpAuthVerifyFormSchema();
  const action = useTotpMultiFactorAssertionFormAction();

  const form = useForm<{ verificationCode: string }>({
    resolver: standardSchemaResolver(schema),
    mode: "onChange",
    defaultValues: {
      verificationCode: "",
    },
  });

  const onSubmit = async (values: { verificationCode: string }) => {
    try {
      const credential = await action({
        verificationCode: values.verificationCode,
        hint: props.hint,
      });
      props.onSuccess?.(credential);
    } catch (error) {
      form.setError("root", { message: getAuthActionErrorMessage(error, ui) });
    }
  };

  return (
    <FormProvider {...form}>
      <Form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-y-4"
      >
        <Controller
          control={form.control}
          name="verificationCode"
          render={({ field, fieldState }) => (
            <VerificationCodeField
              name={field.name}
              label={getTranslation(ui, "labels", "verificationCode")}
              value={field.value}
              onValueChange={field.onChange}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
            />
          )}
        />
        <Button
          type="submit"
          disabled={ui.state !== "idle"}
          focusableWhenDisabled
        >
          {ui.state !== "idle" ? (
            <>
              <Spinner data-icon="inline-start" aria-hidden="true" />
              {getTranslation(ui, "labels", "verifyCode")}
            </>
          ) : (
            getTranslation(ui, "labels", "verifyCode")
          )}
        </Button>
        {form.formState.errors.root && (
          <FormError>{form.formState.errors.root.message}</FormError>
        )}
      </Form>
    </FormProvider>
  );
}

export { TotpMultiFactorAssertionForm };
