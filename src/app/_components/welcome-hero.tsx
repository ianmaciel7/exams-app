import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type { ComponentProps } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type WelcomeHeroProps = useRender.ComponentProps<"div">;

function WelcomeHero({ className, render, ...props }: WelcomeHeroProps) {
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      {
        className: cn("flex flex-col gap-8", className),
      },
      props,
    ),
    state: { slot: "welcome-hero" },
  });
}

type WelcomeHeroHeaderProps = useRender.ComponentProps<"div">;

function WelcomeHeroHeader({
  className,
  render,
  ...props
}: WelcomeHeroHeaderProps) {
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      {
        className: cn(
          "flex flex-col items-center gap-6 text-center sm:items-start sm:text-left",
          className,
        ),
      },
      props,
    ),
    state: { slot: "welcome-hero-header" },
  });
}

type WelcomeHeroTitleProps = useRender.ComponentProps<"h1">;

function WelcomeHeroTitle({
  className,
  render,
  ...props
}: WelcomeHeroTitleProps) {
  return useRender({
    defaultTagName: "h1",
    render,
    props: mergeProps<"h1">(
      {
        className: cn(
          "max-w-xs text-3xl font-semibold leading-10 tracking-tight text-foreground",
          className,
        ),
      },
      props,
    ),
    state: { slot: "welcome-hero-title" },
  });
}

type WelcomeHeroDescriptionProps = useRender.ComponentProps<"p">;

function WelcomeHeroDescription({
  className,
  render,
  ...props
}: WelcomeHeroDescriptionProps) {
  return useRender({
    defaultTagName: "p",
    render,
    props: mergeProps<"p">(
      {
        className: cn(
          "max-w-md text-lg leading-8 text-muted-foreground",
          className,
        ),
      },
      props,
    ),
    state: { slot: "welcome-hero-description" },
  });
}

type WelcomeHeroActionsProps = useRender.ComponentProps<"div">;

function WelcomeHeroActions({
  className,
  render,
  ...props
}: WelcomeHeroActionsProps) {
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      {
        className: cn(
          "flex flex-col gap-4 text-base font-medium sm:flex-row w-full sm:w-auto",
          className,
        ),
      },
      props,
    ),
    state: { slot: "welcome-hero-actions" },
  });
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
