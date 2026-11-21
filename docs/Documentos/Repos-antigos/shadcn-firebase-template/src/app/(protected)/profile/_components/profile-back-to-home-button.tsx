import Link from "next/link";
import { useTranslations } from "next-intl";
import type { ComponentProps } from "react";
import { buttonVariants } from "@/components/ui/button";
import { routes } from "@/lib/navigation";
import { cn } from "@/lib/utils";

type ProfileBackToHomeButtonProps = Omit<
  ComponentProps<typeof Link>,
  "children" | "href"
>;

function ProfileBackToHomeButton({
  className,
  ...props
}: ProfileBackToHomeButtonProps) {
  const t = useTranslations("Auth");

  return (
    <Link
      {...props}
      href={routes.home}
      className={buttonVariants({
        variant: "link",
        size: "sm",
        className: cn("w-full text-xs", className),
      })}
    >
      {t("backToHome")}
    </Link>
  );
}

export { ProfileBackToHomeButton };
