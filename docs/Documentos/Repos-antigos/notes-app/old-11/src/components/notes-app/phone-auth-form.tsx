"use client";

import type { PhoneAuthFormProps as FirebasePhoneAuthFormProps } from "@firebase-oss/ui-react";
import { useState } from "react";
import { PhoneNumberForm } from "@/components/notes-app/phone-number-form";
import { VerifyPhoneNumberForm } from "@/components/notes-app/verify-phone-number-form";

type PhoneAuthFormProps = FirebasePhoneAuthFormProps;

function PhoneAuthForm(props: PhoneAuthFormProps) {
  const [verificationId, setVerificationId] = useState<string | null>(null);

  if (!verificationId) {
    return (
      <PhoneNumberForm
        data-slot="phone-auth-form"
        onSubmit={setVerificationId}
      />
    );
  }

  return (
    <VerifyPhoneNumberForm
      data-slot="phone-auth-form"
      verificationId={verificationId}
      onSuccess={(credential) => {
        props.onSignIn?.(credential);
      }}
    />
  );
}

export { PhoneAuthForm, type PhoneAuthFormProps };
