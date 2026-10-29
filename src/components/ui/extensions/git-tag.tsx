import type { ReactNode } from "react";

type GitTagProps = {
  children: (tag: string) => ReactNode;
};

function GitTag({ children }: GitTagProps) {
  const tag = process.env.NEXT_PUBLIC_GIT_TAG;

  return tag ? children(tag) : null;
}

export { GitTag };
