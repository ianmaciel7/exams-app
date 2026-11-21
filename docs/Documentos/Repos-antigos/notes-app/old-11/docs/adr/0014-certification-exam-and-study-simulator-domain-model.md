# 0014. Certification Exam and Study Simulator Domain Model and RBAC

- **Status:** Superseded by `docs/adr/0017-lean-exam-topics-domain-model-and-typedashboard.md`
- **Date:** 2026-09-29
- **Canonical Owner:** `ARCHITECTURE.md`

> **Superseded Notice:** The entity model (separate root collections for `Exam`, `Question`, `Option`, `ExamSession`, `UserAnswer`) defined in Section 2 is superseded by the unified polymorphic `Object` model (`DER.md` schemaVersion 4) and append-only `attempts` model in [ADR 0017](./0017-lean-exam-topics-domain-model-and-typedashboard.md).

## Context and Problem Statement

The platform requires an interactive study and exam simulator engine supporting self-paced question reviews, randomization, and formal timed test modes. The application needs a cohesive domain model that supports:
1. **Canonical vs. Randomized Presentation**: Ability to shuffle questions and choices while preserving canonical sequences and enabling instant resets.
2. **Progress & Answer Persistence**: Tracking in-flight answers, solution reveals, and session state without loss on refresh or navigation.
3. **Google-Recommended RBAC**: Access control must distinguish standard students/learners from administrators (e.g. for authoring or inline question editing via "Edit Answer") following Google Cloud and Firebase identity best practices rather than ad-hoc custom roles.

## Decision Outcome

We define the domain model and access-control architecture for the Certification Exam & Study Simulator module:

### 1. Identity & Authorization Model (Google Recommended Practice)

Following Google Cloud & Firebase Identity recommendations:
- **Binary Privilege Model**: All authenticated users are standard users by default. Privileged capabilities are granted strictly via Firebase Custom User Claims:
  ```typescript
  interface UserTokenClaims {
    admin?: boolean; // Granted exclusively via Firebase Admin SDK / Cloud Functions
  }

  interface UserProfile {
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    isAdmin: boolean; // Derived on client via token claims: !!tokenResult.claims.admin
  }
  ```
- **Server-Side Enforcement**: Backend and Firestore Security Rules protect administrative actions directly at the token layer:
  ```javascript
  function isAdmin() {
    return request.auth != null && request.auth.token.admin == true;
  }
  ```
- **UI Gating**: UI capabilities such as the "Edit Answer" button are conditionally rendered based on `isAdmin`.

### 2. Core Domain Entities

The module consists of 6 primary entities:

1. **`Exam`**: The top-level assessment or certification package.
   - `id`: string (slug or UUID)
   - `title`: string
   - `category`: string (e.g., "CERTIFICATION EXAMS", "DOCUMENTATION")
   - `badgeText`?: string (e.g., "Google Cloud Certified")
   - `organization`: string
   - `totalQuestionsCount`: number

2. **`Question`**: Individual assessment item.
   - `id`: string
   - `examId`: string (FK to `Exam`)
   - `originalOrderIndex`: number (canonical order)
   - `statement`: string (Markdown/rich-text supporting code blocks)
   - `questionType`: `'SINGLE_CHOICE' | 'MULTIPLE_CHOICE'`
   - `explanation`?: string (Markdown explanation revealed upon request)
   - `tags`: string[]

3. **`Option`**: Selectable answer choice for a question.
   - `id`: string
   - `questionId`: string (FK to `Question`)
   - `originalOrderIndex`: number (canonical choice sequence)
   - `text`: string
   - `isCorrect`: boolean (restricted from client payloads during formal test modes)

4. **`ExamSession`**: Runtime state tracking an active study or test session.
   - `id`: string
   - `userId`: string (FK to `UserProfile.uid`)
   - `examId`: string (FK to `Exam`)
   - `mode`: `'STUDY' | 'TEST'`
   - `isRandomized`: boolean
   - `questionOrder`: string[] (ordered array of Question IDs)
   - `startedAt`: timestamp
   - `completedAt`?: timestamp

5. **`UserAnswer`**: Record of user selections per question within a session.
   - `id`: string
   - `sessionId`: string (FK to `ExamSession`)
   - `questionId`: string (FK to `Question`)
   - `selectedOptionIds`: string[]
   - `isRevealed`: boolean (toggled by "Show Answer")

6. **`User` / `UserProfile`**: Authenticated actor mapped to Firebase Auth `uid` and token claims.

### Positive Consequences

- **Security Alignment**: Follows Google-recommended coarse-grained Firebase Custom Claims, preventing token bloat and eliminating extra database lookups in security rules.
- **Deterministic Presentation**: Preserves canonical order indexes while enabling stateless client-side shuffling and instant order restoration.
- **Decoupled Architecture**: Clean separation between read-only content (`Exam`, `Question`, `Option`) and mutable user runtime data (`ExamSession`, `UserAnswer`).

### Negative Consequences

- Updating admin privileges requires an ID token refresh (`getIdToken(true)`) to take immediate effect on the client.
- In test mode, answers must be validated server-side or via Cloud Functions to prevent clients from inspecting `isCorrect` before submission.

## Related References and Control Documents

- [`ARCHITECTURE.md`](../../ARCHITECTURE.md) - Core system architecture and security model
- [ADR 0009](./0009-adopt-firebase-auth-with-local-emulator.md) - Firebase Authentication & Identity
- [ADR 0013](./0013-adopt-native-firebase-firestore-with-persistent-local-cache.md) - Firestore Persistence Layer
