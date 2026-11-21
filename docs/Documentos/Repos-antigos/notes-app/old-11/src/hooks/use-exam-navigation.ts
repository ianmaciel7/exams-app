"use client";

import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase/firestore";

export interface ExamLink {
  id: string;
  title: string;
}

export interface UseExamNavigationOptions {
  spaceId: string;
}

export interface UseExamNavigationResult {
  exams: ExamLink[];
  loading: boolean;
  error: Error | null;
}

/** Subscribes to the active Exam objects of a space for sidebar navigation. */
export function useExamNavigation({
  spaceId,
}: UseExamNavigationOptions): UseExamNavigationResult {
  const { user } = useAuth();
  const [exams, setExams] = useState<ExamLink[]>([]);
  const [loading, setLoading] = useState(Boolean(user));
  const [error, setError] = useState<Error | null>(null);
  const uid = user?.uid;

  useEffect(() => {
    if (!uid) {
      setExams([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const examsQuery = query(
      collection(db, "users", uid, "spaces", spaceId, "objects"),
      where("objectTypeId", "==", "exam"),
      where("lifecycleState", "==", "active")
    );

    return onSnapshot(
      examsQuery,
      (snapshot) => {
        setExams(
          snapshot.docs
            .map((docSnap) => ({
              id: docSnap.id,
              title: String(docSnap.data().title ?? ""),
            }))
            .sort((a, b) => a.title.localeCompare(b.title))
        );
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );
  }, [uid, spaceId]);

  return { exams, loading, error };
}
