import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type HomeHeroProps = useRender.ComponentProps<"div">;

function HomeHero({ className, render, ...props }: HomeHeroProps) {
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      {
        className: cn("flex flex-col gap-8", className),
      },
      props,
    ),
    state: { slot: "home-hero" },
  });
}

type HomeHeroHeaderProps = useRender.ComponentProps<"div">;

function HomeHeroHeader({ className, render, ...props }: HomeHeroHeaderProps) {
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
    state: { slot: "home-hero-header" },
  });
}

type HomeHeroTitleProps = useRender.ComponentProps<"h1">;

function HomeHeroTitle({ className, render, ...props }: HomeHeroTitleProps) {
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
    state: { slot: "home-hero-title" },
  });
}

type HomeHeroDescriptionProps = useRender.ComponentProps<"p">;

function HomeHeroDescription({
  className,
  render,
  ...props
}: HomeHeroDescriptionProps) {
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
    state: { slot: "home-hero-description" },
  });
}

type HomeHeroActionsProps = useRender.ComponentProps<"div">;

function HomeHeroActions({
  className,
  render,
  ...props
}: HomeHeroActionsProps) {
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
    state: { slot: "home-hero-actions" },
  });
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
  "h-12 rounded-lg px-5 text-base font-medium sm:w-[158px]";

function homeHeroActionVariants(variant: HomeHeroActionVariant = "default") {
  return cn(buttonVariants({ variant, className: homeHeroActionSize }));
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
