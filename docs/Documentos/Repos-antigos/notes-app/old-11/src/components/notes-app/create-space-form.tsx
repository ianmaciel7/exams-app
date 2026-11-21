"use client";

import type { ComponentProps } from "react";
import { CreateSpaceFormFooter } from "@/components/notes-app/create-space-form-footer";
import { CreateSpaceIconField } from "@/components/notes-app/create-space-icon-field";
import { CreateSpaceNameField } from "@/components/notes-app/create-space-name-field";
import { FieldGroup } from "@/components/ui/field";
import { useCreateSpaceForm } from "@/hooks/use-create-space-form";
import { cn } from "@/lib/utils";

type CreateSpaceFormProps = Omit<ComponentProps<"form">, "onSubmit"> & {
  onSubmitSpace: (name: string, icon: string) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
};

function CreateSpaceForm({
  onSubmitSpace,
  onCancel,
  isLoading = false,
  className,
  ...props
}: CreateSpaceFormProps) {
  const form = useCreateSpaceForm({ onSubmitSpace });

  return (
    <form
      data-slot="create-space-form"
      data-testid="create-space-form"
      onSubmit={form.handleSubmit}
      {...props}
      className={cn("flex flex-col gap-4", className)}
    >
      <FieldGroup>
        <CreateSpaceNameField
          error={form.error}
          isLoading={isLoading}
          name={form.name}
          onNameChange={form.onNameChange}
        />
        <CreateSpaceIconField
          isLoading={isLoading}
          onIconChange={form.onIconChange}
          selectedIcon={form.selectedIcon}
        />
      </FieldGroup>
      <CreateSpaceFormFooter
        isLoading={isLoading}
        name={form.name}
        onCancel={onCancel}
      />
    </form>
  );
}

export { CreateSpaceForm, type CreateSpaceFormProps };
