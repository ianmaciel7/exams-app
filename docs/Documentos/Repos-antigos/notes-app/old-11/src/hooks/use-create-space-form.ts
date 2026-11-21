"use client";

import { useTranslations } from "next-intl";
import { type FormEvent, useState } from "react";
import {
  type AllowedSpaceIcon,
  validateCreateSpaceInput,
} from "@/lib/validators/space";

type UseCreateSpaceFormOptions = {
  onSubmitSpace: (name: string, icon: string) => Promise<void>;
};

const DEFAULT_ICON: AllowedSpaceIcon = "folder";

type SpaceValidation = ReturnType<typeof validateCreateSpaceInput>;

function getValidationErrorCode(validation: SpaceValidation): string {
  const { fieldErrors } = validation;
  return (
    fieldErrors?.name ||
    fieldErrors?.description ||
    fieldErrors?.icon ||
    validation.error ||
    "nameRequired"
  );
}

function useCreateSpaceForm({ onSubmitSpace }: UseCreateSpaceFormOptions) {
  const t = useTranslations("spaces");
  const [name, setName] = useState("");
  const [selectedIcon, setSelectedIcon] =
    useState<AllowedSpaceIcon>(DEFAULT_ICON);
  const [error, setError] = useState<string | null>(null);

  const onNameChange = (value: string) => {
    setName(value);
    if (error) {
      setError(null);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = validateCreateSpaceInput({
      name,
      icon: selectedIcon,
    });

    if (!validation.success || !validation.data) {
      setError(t(`validation.${getValidationErrorCode(validation)}`));
      return;
    }

    try {
      setError(null);
      await onSubmitSpace(
        validation.data.name,
        validation.data.icon || DEFAULT_ICON
      );
      setName("");
      setSelectedIcon(DEFAULT_ICON);
    } catch {
      setError(t("failedToCreate"));
    }
  };

  return {
    error,
    handleSubmit,
    name,
    onIconChange: setSelectedIcon,
    onNameChange,
    selectedIcon,
  };
}

export { useCreateSpaceForm, type UseCreateSpaceFormOptions };
