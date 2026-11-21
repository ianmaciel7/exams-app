"use client";

import { useTranslations } from "next-intl";
import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type CreateSpaceFormFooterProps = Omit<
  ComponentProps<typeof Field>,
  "children"
> & {
  isLoading: boolean;
  name: string;
  onCancel?: () => void;
};

function CreateSpaceFormFooter({
  className,
  isLoading,
  name,
  onCancel,
  ...props
}: CreateSpaceFormFooterProps) {
  const t = useTranslations("spaces");

  return (
    <Field
      data-slot="create-space-form-footer"
      orientation="horizontal"
      {...props}
      className={cn("justify-end pt-2", className)}
    >
      {onCancel ? (
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          data-testid="create-space-form-footer-cancel"
        >
          {t("cancel")}
        </Button>
      ) : null}
      <Button
        type="submit"
        disabled={isLoading || !name.trim()}
        data-testid="create-space-form-footer-submit"
      >
        {isLoading ? <Spinner data-icon="inline-start" /> : null}
        {isLoading ? t("creating") : t("createSpace")}
      </Button>
    </Field>
  );
}

export { CreateSpaceFormFooter, type CreateSpaceFormFooterProps };
