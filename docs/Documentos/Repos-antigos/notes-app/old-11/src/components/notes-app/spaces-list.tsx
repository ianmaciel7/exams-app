"use client";

import type { PropsWithChildren, ReactNode } from "react";
import { SpacesEmpty } from "@/components/notes-app/spaces-empty";

type SpacesListProps = PropsWithChildren & {
  notFound: boolean;
  onCreate: () => void;
  showEmptyState: boolean;
  status: ReactNode;
};

function SpacesList({
  children,
  notFound,
  onCreate,
  showEmptyState,
  status,
}: SpacesListProps) {
  if (notFound) {
    return status;
  }
  if (showEmptyState) {
    return <SpacesEmpty onCreate={onCreate} />;
  }
  return children;
}

export { SpacesList, type SpacesListProps };
