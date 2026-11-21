import {
  createUserWithEmailAndPassword,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { describe, expect, it } from "vitest";
import { auth, connectToAuthEmulator } from "./client";

describe("Firebase Auth Emulator Integration", () => {
  it("authenticates against local auth emulator if reachable", async () => {
    const isEmulatorReachable = await fetch("http://127.0.0.1:9099")
      .then(() => true)
      .catch(() => false);

    if (!isEmulatorReachable) {
      // Graceful fallback for environments without running emulator daemon
      return;
    }

    connectToAuthEmulator("127.0.0.1:9099");

    // Clean initial state
    if (auth.currentUser) {
      await signOut(auth);
    }
    expect(auth.currentUser).toBeNull();

    // 1. Sign in anonymously
    const anonCredential = await signInAnonymously(auth);
    expect(anonCredential.user).toBeDefined();
    expect(anonCredential.user.isAnonymous).toBe(true);
    expect(auth.currentUser?.uid).toBe(anonCredential.user.uid);

    // Sign out
    await signOut(auth);
    expect(auth.currentUser).toBeNull();

    // 2. Create user with email and password
    const testEmail = `emulator-test-${Date.now()}@notesapp.dev`;
    const testPassword = "securePassword123";

    const createdCredential = await createUserWithEmailAndPassword(
      auth,
      testEmail,
      testPassword
    );
    expect(createdCredential.user.email).toBe(testEmail);
    expect(auth.currentUser?.email).toBe(testEmail);

    // Sign out
    await signOut(auth);
    expect(auth.currentUser).toBeNull();

    // 3. Sign in with email and password
    const signInCredential = await signInWithEmailAndPassword(
      auth,
      testEmail,
      testPassword
    );
    expect(signInCredential.user.email).toBe(testEmail);
    expect(auth.currentUser?.uid).toBe(createdCredential.user.uid);

    // Sign out
    await signOut(auth);
    expect(auth.currentUser).toBeNull();
  });
});
