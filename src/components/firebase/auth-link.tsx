import Link from "next/link";
import type { ComponentProps } from "react";
import { buttonVariants } from "@/components/ui/button";
import type { AuthRoute } from "@/lib/navigation";
import { getAuthLinkHref } from "@/lib/return-url";
import { cn } from "@/lib/utils";

type AuthLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  route: AuthRoute;
  /** The validated `?next=` destination to keep when moving between auth screens. */
  next?: string | string[];
};

/**
 * A real link between authentication screens (Next.js `Link`: prefetching,
 * open in a new tab, announced as a link) that keeps the return destination.
 */
function AuthLink({ route, next, className, ...props }: AuthLinkProps) {
  return (
    <Link
      {...props}
      href={getAuthLinkHref(route, next)}
      className={cn(buttonVariants({ variant: "link", size: "xs" }), className)}
    />
  );
}

export { AuthLink };
