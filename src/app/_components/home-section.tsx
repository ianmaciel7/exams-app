import type { ComponentProps } from "react";
import { Badge } from "@/components/ui/badge";
import { Version } from "@/components/ui/extensions/version";
import { Home, HomeContent, HomeFooter, HomeLogo } from "./home";
import { HomeWelcomeHero } from "./home-welcome-hero";

type HomeSectionProps = ComponentProps<"main">;

// A Server Component: only the session-dependent hero is a Client Component,
// so the logo, layout and footer stay out of the client bundle.
function HomeSection({ className, ...props }: HomeSectionProps) {
  return (
    <Home className={className} {...props}>
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

export { HomeSection };
