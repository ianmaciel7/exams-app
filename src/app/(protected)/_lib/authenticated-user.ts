import type { User } from "firebase/auth";
import { createContext } from "react";

const AuthenticatedUserContext = createContext<User | null>(null);

export { AuthenticatedUserContext };
