import "server-only";

import Link from "next/link";
import type { ComponentProps } from "react";
import { TranslationTextServer as T } from "@/app/_components/translation-text-server";
import { routes } from "@/lib/navigation";
import { getSession } from "@/lib/session";
import { SignOutButtonClient } from "./sign-out-button-client";
import {
  WelcomeHero,
  WelcomeHeroActions,
  WelcomeHeroDescription,
  WelcomeHeroHeader,
  WelcomeHeroTitle,
  welcomeHeroActionVariants,
} from "./welcome-hero";

type WelcomeHeroServerProps = Omit<
  ComponentProps<typeof WelcomeHero>,
  "children"
>;

async function WelcomeHeroServer(props: WelcomeHeroServerProps) {
  const session = await getSession();

  return (
    <WelcomeHero {...props}>
      <WelcomeHeroHeader>
        <WelcomeHeroTitle>
          {session.isAuthenticated ? (
            <T
              message="Home.welcome"
              values={{ name: session.displayName || "Home.friend" }}
            />
          ) : (
            <T message="Home.title" />
          )}
        </WelcomeHeroTitle>
        <WelcomeHeroDescription>
          <T
            message={
              session.isAuthenticated
                ? "Home.signedInDescription"
                : "Home.description"
            }
          />
        </WelcomeHeroDescription>
      </WelcomeHeroHeader>
      <WelcomeHeroActions>
        {session.isAuthenticated ? (
          <>
            <Link href={routes.profile} className={welcomeHeroActionVariants()}>
              <T message="Home.manageAccount" />
            </Link>
            <SignOutButtonClient />
          </>
        ) : (
          <>
            <Link href={routes.signIn} className={welcomeHeroActionVariants()}>
              <T message="Home.signIn" />
            </Link>
            <Link
              href={routes.register}
              className={welcomeHeroActionVariants("outline")}
            >
              <T message="Home.getStarted" />
            </Link>
          </>
        )}
      </WelcomeHeroActions>
    </WelcomeHero>
  );
}

export { WelcomeHeroServer };
