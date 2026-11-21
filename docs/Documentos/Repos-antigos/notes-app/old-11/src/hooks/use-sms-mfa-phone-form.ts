"use client";

import {
  FirebaseUIError,
  formatPhoneNumber,
  getTranslation,
  verifyPhoneNumber,
} from "@firebase-oss/ui-core";
import {
  useMultiFactorPhoneAuthNumberFormSchema,
  useRecaptchaVerifier,
  useUI,
} from "@firebase-oss/ui-react";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { multiFactor } from "firebase/auth";
import type { FormEvent } from "react";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import type { CountrySelectorRef } from "@/components/notes-app/country-select";

type PhoneNumberFormValues = { displayName: string; phoneNumber: string };

type UseSmsMfaPhoneFormOptions = {
  onSubmit: (verificationId: string, displayName?: string) => void;
};

function useSmsMfaPhoneForm({
  onSubmit: onVerificationSent,
}: UseSmsMfaPhoneFormOptions) {
  const ui = useUI();
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const recaptchaVerifier = useRecaptchaVerifier(recaptchaContainerRef);
  const countrySelector = useRef<CountrySelectorRef>(null);
  const schema = useMultiFactorPhoneAuthNumberFormSchema();

  const form = useForm<PhoneNumberFormValues>({
    resolver: standardSchemaResolver(schema),
    mode: "onChange",
    defaultValues: {
      displayName: "",
      phoneNumber: "",
    },
  });

  const verifyValues = async (values: PhoneNumberFormValues) => {
    try {
      const countrySelectorInstance = countrySelector.current;
      const currentUser = ui.auth.currentUser;
      const verifier = recaptchaVerifier;
      if (!countrySelectorInstance || !currentUser || !verifier) {
        form.setError("root", {
          message: getTranslation(ui, "errors", "unknownError"),
        });
        return;
      }
      const formatted = formatPhoneNumber(
        values.phoneNumber,
        countrySelectorInstance.getCountry()
      );
      const mfaUser = multiFactor(currentUser);
      const confirmationResult = await verifyPhoneNumber(
        ui,
        formatted,
        verifier,
        mfaUser
      );
      onVerificationSent(confirmationResult, values.displayName);
    } catch (error) {
      const message =
        error instanceof FirebaseUIError ? error.message : String(error);
      form.setError("root", { message });
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void form.handleSubmit(verifyValues)(event);
  };

  return { countrySelector, form, handleSubmit, recaptchaContainerRef, ui };
}

export { useSmsMfaPhoneForm, type UseSmsMfaPhoneFormOptions };
