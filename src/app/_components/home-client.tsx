"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { Badge } from "@/components/ui/badge";
import { Version } from "@/components/ui/extensions/version";
import { Skeleton } from "@/components/ui/skeleton";
import { routes } from "@/lib/navigation";
import { useHomeClient } from "../_hooks/use-home-client";
import { Home, HomeContent, HomeFooter, HomeHeading, HomeLogo } from "./home";
import {
  HomeHero,
  HomeHeroActions,
  homeHeroActionSize,
  homeHeroActionVariants,
} from "./home-hero";
import { HomeSignOutButtonClient } from "./home-sign-out-button-client";

type HomeClientProps = ComponentProps<"main">;

function HomeClient({ className, ...props }: HomeClientProps) {
  const { t, session, title, description } = useHomeClient();
  const user = session.user;

  return (
    <Home className={className} {...props}>
      <HomeContent>
        <HomeLogo />
        <HomeHero>
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
                  className={`${homeHeroActionSize} motion-reduce:animate-none`}
                />
                <Skeleton
                  aria-hidden="true"
                  className={`${homeHeroActionSize} motion-reduce:animate-none`}
                />
              </div>
            ) : user ? (
              <>
                <Link
                  href={routes.profile}
                  className={homeHeroActionVariants()}
                >
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
      </HomeContent>
      <HomeFooter>
        <Version
          render={
            <Badge className="mb-6 font-mono text-xs" variant="secondary" />
          }
        />
      </HomeFooter>
    </Home>
  );
}

export { HomeClient };
