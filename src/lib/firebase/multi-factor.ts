import {
  GoogleAuthProvider,
  type MultiFactorInfo,
  PhoneMultiFactorGenerator,
  TotpMultiFactorGenerator,
  type UserCredential,
} from "firebase/auth";

// The Firebase SDK port for auth components and hooks: they import these
// names from here and never from `firebase/*` directly.
export const phoneFactorId = PhoneMultiFactorGenerator.FACTOR_ID;
export const totpFactorId = TotpMultiFactorGenerator.FACTOR_ID;

export function createGoogleAuthProvider() {
  return new GoogleAuthProvider();
}

export type { MultiFactorInfo, UserCredential };
