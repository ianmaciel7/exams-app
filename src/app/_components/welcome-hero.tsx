import type { ComponentProps } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type WelcomeHeroProps = ComponentProps<"div">;

function WelcomeHero({ className, ...props }: WelcomeHeroProps) {
  return (
    <div
      data-slot="welcome-hero"
      className={cn("flex flex-col gap-8", className)}
      {...props}
    />
  );
}

type WelcomeHeroHeaderProps = ComponentProps<"div">;

function WelcomeHeroHeader({ className, ...props }: WelcomeHeroHeaderProps) {
  return (
    <div
      data-slot="welcome-hero-header"
      className={cn(
        "flex flex-col items-center gap-6 text-center sm:items-start sm:text-left",
        className,
      )}
      {...props}
    />
  );
}

type WelcomeHeroTitleProps = ComponentProps<"h1">;

function WelcomeHeroTitle({ className, ...props }: WelcomeHeroTitleProps) {
  return (
    <h1
      data-slot="welcome-hero-title"
      className={cn(
        "max-w-xs text-3xl font-semibold leading-10 tracking-tight text-foreground",
        className,
      )}
      {...props}
    />
  );
}

type WelcomeHeroDescriptionProps = ComponentProps<"p">;

function WelcomeHeroDescription({
  className,
  ...props
}: WelcomeHeroDescriptionProps) {
  return (
    <p
      data-slot="welcome-hero-description"
      className={cn(
        "max-w-md text-lg leading-8 text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

type WelcomeHeroActionsProps = ComponentProps<"div">;

function WelcomeHeroActions({ className, ...props }: WelcomeHeroActionsProps) {
  return (
    <div
      data-slot="welcome-hero-actions"
      className={cn(
        "flex flex-col gap-4 text-base font-medium sm:flex-row w-full sm:w-auto",
        className,
      )}
      {...props}
    />
  );
}

type WelcomeHeroActionVariant = "default" | "outline";

/**
 * One size for every hero action (links, sign-out, and their loading
 * skeletons) so the row never shifts while the session streams in. There is no
 * `w-full`: the column container already stretches the actions on mobile, and
 * a percentage width would let the button's `transition-all` animate the
 * width when the viewport crosses the `sm` breakpoint.
 */
const welcomeHeroActionSize =
  "h-12 rounded-lg px-5 text-base font-medium sm:w-[158px]";

function welcomeHeroActionVariants(
  variant: WelcomeHeroActionVariant = "default",
) {
  return cn(buttonVariants({ variant, className: welcomeHeroActionSize }));
}

type WelcomeHeroSkeletonProps = ComponentProps<typeof WelcomeHero>;

function WelcomeHeroSkeleton(props: WelcomeHeroSkeletonProps) {
  return (
    <WelcomeHero {...props}>
      <WelcomeHeroHeader>
        <Skeleton className="h-10 w-64 max-w-full" />
        <Skeleton className="h-5 w-80 max-w-full" />
      </WelcomeHeroHeader>
      <WelcomeHeroActions>
        <div
          role="status"
          className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row"
        >
          <Skeleton
            aria-hidden="true"
            className={cn(welcomeHeroActionSize, "motion-reduce:animate-none")}
          />
          <Skeleton
            aria-hidden="true"
            className={cn(welcomeHeroActionSize, "motion-reduce:animate-none")}
          />
        </div>
      </WelcomeHeroActions>
    </WelcomeHero>
  );
}

export {
  WelcomeHero,
  WelcomeHeroActions,
  WelcomeHeroDescription,
  WelcomeHeroHeader,
  WelcomeHeroSkeleton,
  WelcomeHeroTitle,
  welcomeHeroActionSize,
  welcomeHeroActionVariants,
};
