import { Badge } from "@/components/ui/badge";
import { Version } from "@/components/ui/extensions/version";
import { Home, HomeContent, HomeFooter, HomeLogo } from "./_components/home";
import { HomeWelcomeHero } from "./_components/home-welcome-hero";

export default function HomePage() {
  return (
    <Home>
      <HomeContent>
        <HomeLogo />
        <HomeWelcomeHero />
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
