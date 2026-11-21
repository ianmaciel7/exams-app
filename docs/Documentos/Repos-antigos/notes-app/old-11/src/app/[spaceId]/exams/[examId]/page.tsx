import { ExamList } from "@/components/notes-app/exam-list";
import { RequireAuth } from "@/components/notes-app/require-auth";
import { SpaceShell } from "@/components/notes-app/space-shell";

export default async function ExamPage({
  params,
}: PageProps<"/[spaceId]/exams/[examId]">) {
  const { spaceId, examId } = await params;
  const nextPath = `/${spaceId}/exams/${examId}`;

  return (
    <RequireAuth redirectTo={`/login?next=${encodeURIComponent(nextPath)}`}>
      <SpaceShell currentSpaceId={spaceId}>
        <main className="flex flex-1 flex-col bg-background font-sans">
          <ExamList spaceId={spaceId} examId={examId} />
        </main>
      </SpaceShell>
    </RequireAuth>
  );
}
