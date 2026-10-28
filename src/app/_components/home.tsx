import Image from "next/image";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import {
  HomeHeroDescription,
  HomeHeroHeader,
  HomeHeroTitle,
} from "./home-hero";

type HomeProps = ComponentProps<"main">;

function Home({ className, ...props }: HomeProps) {
  return (
    <main
      data-slot="home"
      className={cn(
        "flex min-h-svh flex-col items-center justify-center bg-background text-foreground font-sans",
        className,
      )}
      {...props}
    />
  );
}

type HomeContentProps = ComponentProps<"div">;

function HomeContent({ className, ...props }: HomeContentProps) {
  return (
    <div
      data-slot="home-content"
      className={cn(
        "flex flex-1 w-full max-w-3xl flex-col items-center justify-center gap-12 p-6 sm:items-start",
        className,
      )}
      {...props}
    />
  );
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

type HomeHeadingProps = ComponentProps<typeof HomeHeroHeader> & {
  title: string;
  description: string;
};

function HomeHeading({ title, description, ...props }: HomeHeadingProps) {
  return (
    <HomeHeroHeader data-slot="home-heading" {...props}>
      <HomeHeroTitle>{title}</HomeHeroTitle>
      <HomeHeroDescription>{description}</HomeHeroDescription>
    </HomeHeroHeader>
  );
}

type HomeFooterProps = ComponentProps<"div">;

function HomeFooter({ className, ...props }: HomeFooterProps) {
  return (
    <div
      data-slot="home-footer"
      className={cn("w-full flex justify-center", className)}
      {...props}
    />
  );
}

export { Home, HomeContent, HomeFooter, HomeHeading, HomeLogo };
