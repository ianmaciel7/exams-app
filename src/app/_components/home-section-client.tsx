"use client";

import Image from "next/image";
import Link from "next/link";
import type { ComponentProps } from "react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { LoadingPrimitive } from "@/components/ui/extensions/loading-primitive";
import { Version } from "@/components/ui/extensions/version";
import { routes } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { useHomeSectionClient } from "../_hooks/use-home-section-client";
import {
  HomeHero,
  HomeHeroActions,
  HomeHeroDescription,
  HomeHeroHeader,
  HomeHeroTitle,
} from "./home-hero";
import { HomeSignOutButtonClient } from "./home-sign-out-button-client";

type HomeSectionClientProps = ComponentProps<"main">;

function HomeSectionClient({ className, ...props }: HomeSectionClientProps) {
  const { t, session, title, description } = useHomeSectionClient();
  const user = session.user;

  if (session.isLoading)
    return <LoadingPrimitive>{t("loading")}</LoadingPrimitive>;

  return (
    <main
      {...props}
      className={cn(
        "flex min-h-svh flex-col items-center justify-center bg-background text-foreground font-sans",
        className,
      )}
    >
      <div className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center gap-12 p-6 sm:items-start">
        <HomeSectionClientLogo />
        <HomeHero>
          <HomeSectionClientHeading title={title} description={description} />
          <HomeHeroActions>
            {user ? (
              <>
                <Link
                  href={routes.profile}
                  className={buttonVariants({
                    className:
                      "flex h-12 items-center justify-center rounded-full px-5 text-base font-medium sm:w-[158px]",
                  })}
                >
                  {t("manageAccount")}
                </Link>
                <HomeSignOutButtonClient />
              </>
            ) : (
              <>
                <Link
                  href={routes.signIn}
                  className={buttonVariants({
                    className:
                      "flex h-12 items-center justify-center rounded-full px-5 text-base font-medium sm:w-[158px]",
                  })}
                >
                  {t("signIn")}
                </Link>
                <Link
                  href={routes.register}
                  className={buttonVariants({
                    variant: "outline",
                    className:
                      "flex h-12 items-center justify-center rounded-full px-5 text-base font-medium sm:w-[158px]",
                  })}
                >
                  {t("getStarted")}
                </Link>
              </>
            )}
          </HomeHeroActions>
        </HomeHero>
      </div>
      <Version
        render={
          <Badge className="mb-6 font-mono text-xs" variant="secondary" />
        }
      />
    </main>
  );
}

type HomeSectionClientLogoProps = Omit<
  ComponentProps<typeof Image>,
  "src" | "alt"
>;

function HomeSectionClientLogo({
  className,
  ...props
}: HomeSectionClientLogoProps) {
  return (
    <Image
      className={cn("dark:invert h-5 w-[100px]", className)}
      src="/next.svg"
      alt=""
      role="presentation"
      width={100}
      height={20}
      priority
      {...props}
    />
  );
}

type HomeSectionClientHeadingProps = ComponentProps<typeof HomeHeroHeader> & {
  title: string;
  description: string;
};

function HomeSectionClientHeading({
  title,
  description,
  ...props
}: HomeSectionClientHeadingProps) {
  return (
    <HomeHeroHeader {...props}>
      <HomeHeroTitle>{title}</HomeHeroTitle>
      <HomeHeroDescription>{description}</HomeHeroDescription>
    </HomeHeroHeader>
  );
}

export { HomeSectionClient, HomeSectionClientHeading, HomeSectionClientLogo };
