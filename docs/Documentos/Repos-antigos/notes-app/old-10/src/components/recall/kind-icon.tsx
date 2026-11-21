import {
  BookOpen,
  CircleHelp,
  FileText,
  FolderOpen,
  Link2,
  type LucideIcon,
  Tag,
} from "lucide-react";
import type { RecallObject } from "@/domain/recall";

export const kindIcon: Record<RecallObject["kind"], LucideIcon> = {
  question: CircleHelp,
  note: FileText,
  citation: Link2,
  exam: BookOpen,
  tag: Tag,
  collection: FolderOpen,
};

export function KindIcon({
  kind,
  className,
}: {
  kind: RecallObject["kind"];
  className?: string;
}) {
  const Icon = kindIcon[kind];
  return <Icon className={className} />;
}
