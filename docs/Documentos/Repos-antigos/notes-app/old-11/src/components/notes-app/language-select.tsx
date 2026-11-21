"use client";

import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { type ComponentProps, useTransition } from "react";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { auth } from "@/lib/firebase/client";
import {
  SUPPORTED_LOCALES,
  type SupportedLocale,
  syncFirebaseLocale,
} from "@/lib/i18n/locale-sync";
import { cn } from "@/lib/utils";

type LanguageSelectProps = ComponentProps<typeof ButtonGroup>;

function LanguageSelect({ className, ...props }: LanguageSelectProps) {
  const currentLocale = useLocale();
  const t = useTranslations("language");
  const { isPending, handleLocaleChange } = useLanguageSelect(currentLocale);

  const getLocaleLabel = (loc: SupportedLocale) => {
    switch (loc) {
      case "en":
        return t("en");
      case "pt-BR":
        return t("ptBR");
      case "es":
        return t("es");
      default:
        return loc;
    }
  };

  return (
    <ButtonGroup
      data-slot="language-select"
      data-testid="language-select-container"
      {...props}
      className={cn(
        "flex items-center gap-1 text-xs text-muted-foreground",
        className
      )}
    >
      <Select
        items={SUPPORTED_LOCALES.map((loc) => ({
          value: loc,
          label: getLocaleLabel(loc),
        }))}
        value={currentLocale}
        onValueChange={handleLocaleChange}
        disabled={isPending}
      >
        <SelectTrigger
          data-testid="language-select"
          aria-label={t("label")}
          size="sm"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end">
          <SelectGroup>
            {SUPPORTED_LOCALES.map((loc) => (
              <SelectItem key={loc} value={loc}>
                {getLocaleLabel(loc)}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </ButtonGroup>
  );
}

function useLanguageSelect(currentLocale: string) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleLocaleChange(newLocale: string | null) {
    if (!newLocale || newLocale === currentLocale) {
      return;
    }
    syncFirebaseLocale(auth, newLocale as SupportedLocale);
    startTransition(() => router.refresh());
  }

  return { isPending, handleLocaleChange };
}

export { LanguageSelect, type LanguageSelectProps, useLanguageSelect };
