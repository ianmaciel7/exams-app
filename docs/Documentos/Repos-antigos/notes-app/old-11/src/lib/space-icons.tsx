import { Book, Briefcase, Code, Folder } from "lucide-react";
import type { ComponentProps } from "react";
import type { AllowedSpaceIcon } from "@/lib/validators/space";

const SPACE_ICON_MAP: Record<AllowedSpaceIcon, typeof Folder> = {
  folder: Folder,
  book: Book,
  briefcase: Briefcase,
  code: Code,
  archive: Folder,
  compass: Folder,
};

type SpaceIconProps = ComponentProps<"svg"> & { iconKey?: string };

function SpaceIcon({ iconKey, ...props }: SpaceIconProps) {
  const Icon = SPACE_ICON_MAP[iconKey as AllowedSpaceIcon] ?? Folder;
  return <Icon {...props} />;
}

export { SPACE_ICON_MAP, SpaceIcon, type SpaceIconProps };
