"use client";

import { useTranslations } from "next-intl";
import type { ComponentProps } from "react";
import { SettingsForm } from "@/components/notes-app/settings-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type SettingsDialogProps = Omit<
  ComponentProps<typeof Dialog>,
  "children" | "open" | "onOpenChange"
> & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function SettingsDialog({ open, onOpenChange, ...props }: SettingsDialogProps) {
  const t = useTranslations("settings");
  const spacesT = useTranslations("spaces");

  return (
    <Dialog
      {...props}
      open={open}
      onOpenChange={(nextOpen) => onOpenChange(nextOpen)}
    >
      <DialogContent data-slot="settings-dialog" data-testid="settings-dialog">
        <DialogHeader>
          <DialogTitle>{t("settings")}</DialogTitle>
          <DialogDescription>{t("settingsDescription")}</DialogDescription>
        </DialogHeader>
        <SettingsForm />
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            {spacesT("done")}
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { SettingsDialog, type SettingsDialogProps };
