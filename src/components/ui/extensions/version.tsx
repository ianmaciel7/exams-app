import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cn } from "cn";

type VersionState = {
  slot: "version";
  value: string;
};

type VersionProps = useRender.ComponentProps<"span", VersionState>;

function Version({ className, children, render, ...props }: VersionProps) {
  const tag = process.env.NEXT_PUBLIC_GIT_TAG;

  const rendered = useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(className),
        children: children ? children : tag,
      },
      props,
    ),
    render,
    state: {
      slot: "version",
      value: tag ? tag : "",
    },
  });

  if (!tag) {
    return null;
  }

  return rendered;
}

export { Version, type VersionProps, type VersionState };
