import type { FirestoreTime } from "@/types/card";
import type { QuestionProperties } from "@/types/question";

export type LifecycleState =
  | "active"
  | "archived"
  | "trash"
  | "pendingApproval";

export interface BaseObjectDocument {
  id: string;
  spaceId: string;
  schemaVersion: number;
  objectTypeId: string;
  title: string;
  lifecycleState: LifecycleState;
  stateVersion: number;
  createdAt: FirestoreTime | null;
  updatedAt: FirestoreTime | null;
  conceptIds?: string[];
  outgoingLinkIds?: string[];
  deletedAt?: FirestoreTime | null;
}

export interface ExamProperties {
  provider: string;
  code: string;
  totalQuestionsCount: number;
  passingScorePercentage: number;
  timeLimitMinutes?: number;
  questionIds: string[];
}

export interface ExamObject extends BaseObjectDocument {
  objectTypeId: "exam";
  properties: ExamProperties;
}

export interface QuestionObject extends BaseObjectDocument {
  objectTypeId: "question";
  properties: QuestionProperties;
  content?: Record<string, unknown> | null;
}
