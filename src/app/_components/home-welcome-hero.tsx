"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { routes } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { useHomeWelcomeHero } from "../_hooks/use-home-welcome-hero";
import { HomeHeading } from "./home";
import {
  HomeHero,
  HomeHeroActions,
  homeHeroActionSize,
  homeHeroActionVariants,
} from "./home-hero";
import { HomeSignOutButtonClient } from "./home-sign-out-button-client";

type HomeWelcomeHeroProps = ComponentProps<typeof HomeHero>;

function HomeWelcomeHero(props: HomeWelcomeHeroProps) {
  const { t, session, title, description } = useHomeWelcomeHero();
  const user = session.user;

  return (
    <HomeHero {...props}>
      <HomeHeading title={title} description={description} />
      <HomeHeroActions>
        {session.isLoading ? (
          // The hero text paints from the server HTML; only the actions
          // wait for Firebase. Placeholders the size of the buttons keep
          // the layout stable and no visitor action shows before the
          // session is known.
          <div
            role="status"
            className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row"
          >
            <span className="sr-only">{t("loading")}</span>
            <Skeleton
              aria-hidden="true"
              className={cn(homeHeroActionSize, "motion-reduce:animate-none")}
            />
            <Skeleton
              aria-hidden="true"
              className={cn(homeHeroActionSize, "motion-reduce:animate-none")}
            />
          </div>
        ) : user ? (
          <>
            <Link href={routes.profile} className={homeHeroActionVariants()}>
              {t("manageAccount")}
            </Link>
            <HomeSignOutButtonClient />
          </>
        ) : (
          <>
            <Link href={routes.signIn} className={homeHeroActionVariants()}>
              {t("signIn")}
            </Link>
            <Link
              href={routes.register}
              className={homeHeroActionVariants("outline")}
            >
              {t("getStarted")}
            </Link>
          </>
        )}
      </HomeHeroActions>
    </HomeHero>
  );
}

export { HomeWelcomeHero };
