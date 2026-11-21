"use client";

import { useTranslations } from "next-intl";
import type { ComponentProps } from "react";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type CreateSpaceNameFieldProps = Omit<
  ComponentProps<typeof Field>,
  "children" | "onChange"
> & {
  error: string | null;
  isLoading: boolean;
  name: string;
  onNameChange: (name: string) => void;
};

function CreateSpaceNameField({
  error,
  isLoading,
  name,
  onNameChange,
  ...props
}: CreateSpaceNameFieldProps) {
  const t = useTranslations("spaces");

  return (
    <Field
      data-slot="create-space-name-field"
      data-invalid={Boolean(error) || undefined}
      {...props}
    >
      <FieldLabel htmlFor="create-space-name-field-input">
        {t("spaceName")}
      </FieldLabel>
      <Input
        id="create-space-name-field-input"
        placeholder={t("spaceNamePlaceholder")}
        value={name}
        onChange={(event) => onNameChange(event.target.value)}
        autoFocus
        data-testid="create-space-name-field-input"
        aria-invalid={Boolean(error) || undefined}
        disabled={isLoading}
      />
      {error ? (
        <FieldError data-testid="create-space-name-field-error">
          {error}
        </FieldError>
      ) : null}
    </Field>
  );
}

export { CreateSpaceNameField, type CreateSpaceNameFieldProps };
