import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { buttonVariants } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";

export default function Home() {
  const t = useTranslations("App");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground font-sans">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 sm:items-start">
        <Image
          className="dark:invert h-5 w-[100px]"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />

        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-foreground">
            {t("getStartedPrefix")}{" "}
            <Kbd className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.9em] text-foreground border border-border h-auto">
              {t("pageFile")}
            </Kbd>{" "}
            {t("getStartedSuffix")}
          </h1>
          <p className="max-w-md text-lg leading-8 text-muted-foreground">
            {t("instructionsPrefix")}{" "}
            <Link
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-foreground hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("templates")}
            </Link>{" "}
            {t("instructionsMiddle")}{" "}
            <Link
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-foreground hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("learning")}
            </Link>{" "}
            {t("instructionsSuffix")}
          </p>
        </div>

        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row w-full sm:w-auto">
          <Link
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("deployNow")}
            className={buttonVariants({
              className:
                "flex h-12 w-full items-center justify-center gap-2 rounded-full px-5 text-base font-medium md:w-[158px]",
            })}
          >
            <Image
              className="dark:invert h-[14px] w-4"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={14}
            />
            {t("deployNow")}
          </Link>
          <Link
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("documentation")}
            className={buttonVariants({
              variant: "outline",
              className:
                "flex h-12 w-full items-center justify-center rounded-full px-5 text-base font-medium md:w-[158px]",
            })}
          >
            {t("documentation")}
          </Link>
        </div>
      </main>
    </div>
  );
}
