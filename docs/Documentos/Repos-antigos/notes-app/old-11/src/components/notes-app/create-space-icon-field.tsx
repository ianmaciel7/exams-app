"use client";

import { useTranslations } from "next-intl";
import type { ComponentProps } from "react";
import { Field, FieldLabel } from "@/components/ui/field";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { SPACE_ICON_MAP } from "@/lib/space-icons";
import type { AllowedSpaceIcon } from "@/lib/validators/space";

const ICON_KEYS = ["folder", "book", "briefcase", "code"] as const;

type CreateSpaceIconFieldProps = Omit<
  ComponentProps<typeof Field>,
  "children" | "onChange"
> & {
  isLoading: boolean;
  onIconChange: (icon: AllowedSpaceIcon) => void;
  selectedIcon: AllowedSpaceIcon;
};

function CreateSpaceIconField({
  isLoading,
  onIconChange,
  selectedIcon,
  ...props
}: CreateSpaceIconFieldProps) {
  const t = useTranslations("spaces");

  return (
    <Field data-slot="create-space-icon-field" {...props}>
      <FieldLabel>{t("icon")}</FieldLabel>
      <ToggleGroup
        value={[selectedIcon]}
        onValueChange={(value) => {
          if (value.length > 0) {
            onIconChange(value[0] as AllowedSpaceIcon);
          }
        }}
        disabled={isLoading}
        variant="outline"
        className="flex items-center gap-2 pt-1"
        data-testid="create-space-icon-field-selector"
      >
        {ICON_KEYS.map((iconKey) => {
          const IconComp = SPACE_ICON_MAP[iconKey];
          return (
            <ToggleGroupItem
              key={iconKey}
              value={iconKey}
              size="sm"
              aria-label={t("selectIconAria", { icon: iconKey })}
              data-testid={`create-space-icon-field-btn-${iconKey}`}
            >
              <IconComp />
            </ToggleGroupItem>
          );
        })}
      </ToggleGroup>
    </Field>
  );
}

export { CreateSpaceIconField, type CreateSpaceIconFieldProps };
