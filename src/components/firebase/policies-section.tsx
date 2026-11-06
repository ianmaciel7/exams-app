import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PoliciesSectionProps = useRender.ComponentProps<"div"> & {
  policies: {
    parts: {
      key: number;
      text: string;
      link?: { url: string | URL; label: string };
    }[];
    onNavigate?: (url: string | URL) => void;
  } | null;
};

const linkClassName =
  "font-medium text-foreground underline underline-offset-4 hover:text-primary";

function PoliciesSection({
  policies,
  className,
  render,
  ...props
}: PoliciesSectionProps) {
  const rendered = useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      {
        className: cn("text-center text-xs text-muted-foreground", className),
        children: policies?.parts.map(({ key, text, link }) => {
          if (!link) {
            return <span key={key}>{text}</span>;
          }

          return policies.onNavigate ? (
            <Button
              key={key}
              type="button"
              variant="link"
              className={cn("h-auto p-0 text-xs", linkClassName)}
              onClick={() => policies.onNavigate?.(link.url)}
            >
              {link.label}
            </Button>
          ) : (
            <a
              key={key}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClassName}
              href={link.url.toString()}
            >
              {link.label}
            </a>
          );
        }),
      },
      props,
    ),
    state: { slot: "policies-section" },
  });
  return policies ? rendered : null;
}

export { PoliciesSection };
