"use client";
import { useRouter } from "next/navigation";
import { StudyPanel } from "@/components/recall/study-panel";
import type { Snapshot } from "@/domain/recall";

// Thin client wrapper: StudyPanel takes an onUpdate callback, which must be a
// function reference, not something serializable from a Server Component.
export function StudySession({ data }: { data: Snapshot }) {
  const router = useRouter();
  return <StudyPanel data={data} onUpdate={async () => router.refresh()} />;
}
