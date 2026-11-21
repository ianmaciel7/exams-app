"use client";

import { useTranslations } from "next-intl";
import type { ComponentProps } from "react";
import { CreateSpaceForm } from "@/components/notes-app/create-space-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type CreateSpaceDialogProps = Omit<
  ComponentProps<typeof Dialog>,
  "children" | "open" | "onOpenChange"
> & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmitSpace: (name: string, icon: string) => Promise<void>;
  isLoading?: boolean;
};

function CreateSpaceDialog({
  open,
  onOpenChange,
  onSubmitSpace,
  isLoading = false,
  ...props
}: CreateSpaceDialogProps) {
  const t = useTranslations("spaces");

  return (
    <Dialog {...props} open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-slot="create-space-dialog"
        data-testid="create-space-dialog"
      >
        <DialogHeader>
          <DialogTitle>{t("dialogTitle")}</DialogTitle>
          <DialogDescription>{t("dialogDescription")}</DialogDescription>
        </DialogHeader>
        <CreateSpaceForm
          onSubmitSpace={onSubmitSpace}
          isLoading={isLoading}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

export { CreateSpaceDialog, type CreateSpaceDialogProps };
