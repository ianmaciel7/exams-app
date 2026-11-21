import type { FieldValue, Timestamp } from "firebase/firestore";

export interface Space {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  icon: string;
  stateVersion: number;
  schemaVersion: number;
  createdAt: Timestamp | Date | string | null;
  updatedAt: Timestamp | Date | string | null;
}

export interface CreateSpaceInput {
  name: string;
  description?: string;
  icon?: string;
}

export interface SpaceFirestoreDocument {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  icon: string;
  stateVersion: number;
  schemaVersion: number;
  createdAt: FieldValue | Timestamp;
  updatedAt: FieldValue | Timestamp;
}
