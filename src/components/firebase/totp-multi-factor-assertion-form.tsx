"use client";

import { type UserCredential, type MultiFactorInfo } from "firebase/auth";
import { getTranslation } from "@firebase-oss/ui-core";
import {
  useMultiFactorTotpAuthVerifyFormSchema,
  useUI,
  useTotpMultiFactorAssertionFormAction,
} from "@firebase-oss/ui-react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";

import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Form } from "@/components/ui/extensions/form";
import { FormError } from "@/components/ui/extensions/form-error";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { getAuthActionErrorMessage } from "./auth-error-message";

type TotpMultiFactorAssertionFormProps = {
  hint: MultiFactorInfo;
  onSuccess?: (credential: UserCredential) => void;
};

export function TotpMultiFactorAssertionForm(props: TotpMultiFactorAssertionFormProps) {
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
      const credential = await action({ verificationCode: values.verificationCode, hint: props.hint });
      props.onSuccess?.(credential);
    } catch (error) {
      form.setError("root", { message: getAuthActionErrorMessage(error, ui) });
    }
  };

  return (
    <FormProvider {...form}>
      <Form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-y-4">
        <Controller
          control={form.control}
          name="verificationCode"
          render={({ field, fieldState }) => (
            <Field data-invalid={!!fieldState.error}>
              <FieldLabel htmlFor="verificationCode">{getTranslation(ui, "labels", "verificationCode")}</FieldLabel>
              <InputOTP id="verificationCode" maxLength={6} {...field} aria-invalid={!!fieldState.error} aria-describedby={fieldState.error ? "verificationCode-error" : undefined}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              {fieldState.error && <FieldError id="verificationCode-error">{fieldState.error.message}</FieldError>}
            </Field>
          )}
        />
        <Button type="submit" disabled={ui.state !== "idle"}>
          {ui.state !== "idle" ? (
            <><Spinner data-icon="inline-start" aria-hidden="true" />{getTranslation(ui, "labels", "verifyCode")}</>
          ) : (
            getTranslation(ui, "labels", "verifyCode")
          )}
        </Button>
        {form.formState.errors.root && <FormError>{form.formState.errors.root.message}</FormError>}
      </Form>
    </FormProvider>
  );
}
