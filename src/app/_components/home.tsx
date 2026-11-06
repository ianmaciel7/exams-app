import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import Image from "next/image";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type HomeProps = useRender.ComponentProps<"main">;

function Home({ className, render, ...props }: HomeProps) {
  return useRender({
    defaultTagName: "main",
    render,
    props: mergeProps<"main">(
      {
        className: cn(
          "flex min-h-svh flex-col items-center justify-center bg-background text-foreground font-sans",
          className,
        ),
      },
      props,
    ),
    state: { slot: "home" },
  });
}

type HomeContentProps = useRender.ComponentProps<"div">;

function HomeContent({ className, render, ...props }: HomeContentProps) {
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      {
        className: cn(
          "flex flex-1 w-full max-w-3xl flex-col items-center justify-center gap-12 p-6 sm:items-start",
          className,
        ),
      },
      props,
    ),
    state: { slot: "home-content" },
  });
}

type HomeLogoProps = Omit<ComponentProps<typeof Image>, "src" | "alt">;

function HomeLogo({ className, ...props }: HomeLogoProps) {
  return (
    <Image
      data-slot="home-logo"
      className={cn("dark:invert h-5 w-[100px]", className)}
      src="/next.svg"
      alt=""
      role="presentation"
      width={100}
      height={20}
      priority
      {...props}
    />
  );
}

type HomeFooterProps = useRender.ComponentProps<"div">;

function HomeFooter({ className, ...props }: HomeFooterProps) {
  return (
    <div
      data-slot="home-footer"
      className={cn("w-full flex justify-center", className)}
      {...props}
    />
  );
}

export { Home, HomeContent, HomeFooter, HomeLogo };
