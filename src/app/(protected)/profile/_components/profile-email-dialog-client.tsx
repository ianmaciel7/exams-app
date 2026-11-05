"use client";

import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useProfileEmailDialogClient } from "../_hooks/use-profile-email-dialog-client";
import { ProfileEmailForm } from "./profile-email-form";

type ProfileEmailDialogClientProps = Omit<
  ComponentProps<typeof Dialog>,
  "open" | "defaultOpen" | "onOpenChange" | "children"
> & {
  email: string;
};

function ProfileEmailDialogClient({
  email,
  ...props
}: ProfileEmailDialogClientProps) {
  const { t, isOpen, onOpenChange, changeEmail } =
    useProfileEmailDialogClient();

  return (
    <Dialog {...props} open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger render={<Button type="button" variant="outline" />}>
        {t("changeEmailButton")}
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="max-h-[calc(100dvh-2rem)] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle>{t("changeEmail")}</DialogTitle>
          <DialogDescription>{t("emailChangeDescription")}</DialogDescription>
        </DialogHeader>
        <ProfileEmailForm email={email} changeEmail={changeEmail} />
        <DialogClose render={<Button type="button" variant="ghost" />}>
          {t("cancelEmailChange")}
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}

export { ProfileEmailDialogClient };
