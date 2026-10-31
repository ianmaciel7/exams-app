import type { ComponentProps } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type HomeHeroProps = ComponentProps<"div">;

function HomeHero({ className, ...props }: HomeHeroProps) {
  return (
    <div
      data-slot="home-hero"
      {...props}
      className={cn("flex flex-col gap-8", className)}
    />
  );
}

type HomeHeroHeaderProps = ComponentProps<"div">;

function HomeHeroHeader({ className, ...props }: HomeHeroHeaderProps) {
  return (
    <div
      data-slot="home-hero-header"
      {...props}
      className={cn(
        "flex flex-col items-center gap-6 text-center sm:items-start sm:text-left",
        className,
      )}
    />
  );
}

type HomeHeroTitleProps = ComponentProps<"h1">;

function HomeHeroTitle({ className, ...props }: HomeHeroTitleProps) {
  return (
    <h1
      data-slot="home-hero-title"
      {...props}
      className={cn(
        "max-w-xs text-3xl font-semibold leading-10 tracking-tight text-foreground",
        className,
      )}
    />
  );
}

type HomeHeroDescriptionProps = ComponentProps<"p">;

function HomeHeroDescription({
  className,
  ...props
}: HomeHeroDescriptionProps) {
  return (
    <p
      data-slot="home-hero-description"
      {...props}
      className={cn(
        "max-w-md text-lg leading-8 text-muted-foreground",
        className,
      )}
    />
  );
}

type HomeHeroActionsProps = ComponentProps<"div">;

function HomeHeroActions({ className, ...props }: HomeHeroActionsProps) {
  return (
    <div
      data-slot="home-hero-actions"
      {...props}
      className={cn(
        "flex flex-col gap-4 text-base font-medium sm:flex-row w-full sm:w-auto",
        className,
      )}
    />
  );
}

type HomeHeroActionVariant = "default" | "outline";

/**
 * One size for every hero action (links, sign-out, and their loading
 * skeletons) so the row never shifts when the session resolves. There is no
 * `w-full`: the column container already stretches the actions on mobile, and
 * a percentage width would let the button's `transition-all` animate the
 * width when the viewport crosses the `sm` breakpoint.
 */
const homeHeroActionSize =
  "h-12 rounded-full px-5 text-base font-medium sm:w-[158px]";

function homeHeroActionVariants(variant: HomeHeroActionVariant = "default") {
  return buttonVariants({ variant, className: homeHeroActionSize });
}

export {
  HomeHero,
  HomeHeroActions,
  HomeHeroDescription,
  HomeHeroHeader,
  HomeHeroTitle,
  homeHeroActionSize,
  homeHeroActionVariants,
};
