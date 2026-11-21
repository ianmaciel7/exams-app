"use client";

import type { User } from "firebase/auth";
import { createContext } from "react";

export interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  signOutUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
