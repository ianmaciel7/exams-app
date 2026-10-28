import Link from "next/link";
import { useTranslations } from "next-intl";
import { buttonVariants } from "@/components/ui/button";
import { routes } from "@/lib/navigation";

export default function NotFound() {
  const t = useTranslations("App");

  return (
    <main className="flex min-h-svh flex-1 flex-col items-center justify-center p-6 text-center">
      <h1 className="text-4xl font-bold tracking-tight">
        {t("notFoundTitle")}
      </h1>
      <p className="mt-2 text-muted-foreground">{t("notFoundMessage")}</p>
      <Link
        href={routes.home}
        className={buttonVariants({ className: "mt-6" })}
      >
        {t("backHome")}
      </Link>
    </main>
  );
}
