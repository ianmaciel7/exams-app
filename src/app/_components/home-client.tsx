"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { LoadingPrimitive } from "@/components/ui/extensions/loading-primitive";
import { Version } from "@/components/ui/extensions/version";
import { routes } from "@/lib/navigation";
import { useHomeClient } from "../_hooks/use-home-client";
import { Home, HomeContent, HomeFooter, HomeHeading, HomeLogo } from "./home";
import { HomeHero, HomeHeroActions } from "./home-hero";
import { HomeSignOutButtonClient } from "./home-sign-out-button-client";

type HomeClientProps = ComponentProps<"main">;

function HomeClient({ className, ...props }: HomeClientProps) {
  const { t, session, title, description } = useHomeClient();
  const user = session.user;

  if (session.isLoading)
    return (
      <LoadingPrimitive boundary="home-session">
        {t("loading")}
      </LoadingPrimitive>
    );

  return (
    <Home className={className} {...props}>
      <HomeContent>
        <HomeLogo />
        <HomeHero>
          <HomeHeading title={title} description={description} />
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
