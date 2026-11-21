"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import type { ComponentProps } from "react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
} from "@/components/ui/sidebar";
import { useExamNavigation } from "@/hooks/use-exam-navigation";

type ExamNavigationProps = Omit<
  ComponentProps<typeof SidebarGroup>,
  "children"
> & {
  spaceId: string;
};

function ExamNavigation({ spaceId, ...props }: ExamNavigationProps) {
  const t = useTranslations("exam");
  const { exams, loading, error } = useExamNavigation({ spaceId });

  const showSkeleton = !error && loading;
  const settled = !error && !loading;
  const showEmpty = settled && exams.length === 0;
  const showList = settled && exams.length > 0;

  return (
    <SidebarGroup data-slot="exam-navigation" {...props}>
      <SidebarGroupLabel>{t("navLabel")}</SidebarGroupLabel>
      <SidebarGroupContent>
        {error && (
          <p role="alert" className="px-2 text-xs text-destructive">
            {t("navError")}
          </p>
        )}
        {showSkeleton && <SidebarMenuSkeleton />}
        {showEmpty && (
          <p className="px-2 text-xs text-sidebar-foreground/70">
            {t("navEmpty")}
          </p>
        )}
        {showList && (
          <SidebarMenu>
            {exams.map((exam) => (
              <SidebarMenuItem key={exam.id}>
                <SidebarMenuButton
                  render={
                    <Link href={`/${spaceId}/exams/${exam.id}`}>
                      {exam.title}
                    </Link>
                  }
                />
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        )}
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export { ExamNavigation, type ExamNavigationProps };
