import { Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { Version } from "@/components/ui/extensions/version";
import { Home, HomeContent, HomeFooter, HomeLogo } from "./_components/home";
import { WelcomeHeroSkeleton } from "./_components/welcome-hero";
import { WelcomeHeroServer } from "./_components/welcome-hero-server";

export default function HomePage() {
  return (
    <Home>
      <HomeContent>
        <HomeLogo />
        <Suspense fallback={<WelcomeHeroSkeleton />}>
          <WelcomeHeroServer />
        </Suspense>
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
