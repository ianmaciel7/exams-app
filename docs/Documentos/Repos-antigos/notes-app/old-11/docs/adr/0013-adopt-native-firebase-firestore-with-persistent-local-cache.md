# 0013. Adopt Native Firebase Firestore with Persistent Local Cache

- **Status:** Accepted
- **Date:** 2026-09-29
- **Canonical Owner:** `ARCHITECTURE.md`

## Context and Problem Statement

The application requires an offline-capable, zero-latency data persistence layer that seamlessly synchronizes with cloud storage when online. The initial architecture contemplated a separate custom local database alongside a distinct remote backend layer. This dual-store approach introduced architectural friction:
1. **Schema & Logic Duplication**: Separate models and data access layers required maintaining custom synchronization protocols and transformation logic.
2. **Conflict Resolution & Offline Queueing**: Manually reconciling offline writes with remote state is error-prone and adds maintenance overhead.
3. **Multi-Tab Coordination**: Synchronizing IndexedDB writes across multiple browser tabs without race conditions requires complex manual locking.

We need a unified data architecture that provides offline persistence, multi-tab synchronization, instant local optimistic writes, SSR compatibility, and zero-latency reads while natively integrating with the Firebase Auth identity model and local emulator suite.

## Decision Outcome

We adopt native Firebase Firestore (`firebase/firestore`) with persistent local cache as the foundational data persistence layer for the application:

1. **Persistent Local Cache Configuration**: In browser environments (`typeof window !== "undefined"`), initialize Firestore via `initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) })`. This leverages IndexedDB for durable offline storage and manages multi-tab state transitions without locking conflicts.
2. **Resilient Initialization & SSR Fallback**: In server-side rendering (SSR) / Server Component contexts or environments where IndexedDB is restricted (e.g. private browsing or strict storage partitioning), fall back gracefully to `getFirestore(app)` or `initializeFirestore(app, { localCache: memoryLocalCache() })`.
3. **Local Emulator Integration**: Configure transparent connection to the Firebase Firestore emulator (`127.0.0.1:8080`) during local development and testing, supporting deterministic offline and multi-client testing.
4. **Unified Firebase SDK**: Use the native Firestore client as the single data persistence layer with snapshot listeners (`onSnapshot`) and optimistic writes, achieving zero-latency local interactions backed by native IndexedDB persistence.

### Positive Consequences

- **Zero-Latency Offline First**: Read and write operations immediately resolve against the local IndexedDB cache with background cloud synchronization.
- **Simplified Stack**: Single SDK and API surface eliminate duplicate validation and manual synchronization layers.
- **Built-In Multi-Tab Sync**: `persistentMultipleTabManager` synchronizes mutations across concurrent open tabs automatically.
- **Seamless Local Testing**: Full integration with the Firebase Firestore emulator enables hermetic local development and CI testing.
- **SSR & Universal Safety**: Graceful fallback ensures no crashes in Node.js server environments or restricted browser contexts.

### Negative Consequences

- Requires careful query design matching Firestore indexing and compound query capabilities.
- Local integration tests require the Firestore emulator running alongside the Auth emulator.

## Architectural Rules and Invariants

- All Firestore database interactions must route through the single-source-of-truth export `db` in `src/lib/firebase/firestore.ts`.
- Firestore emulator connection logic must remain idempotent and safe against Next.js Fast Refresh / HMR restarts.
- Data structures must maintain canonical English identifiers for database keys and system attributes.

## Related References and Control Documents

- [`ARCHITECTURE.md`](../../ARCHITECTURE.md) - Section 1 (System Context), Section 3 (Technology Decisions) & Section 4 (Runtime State & Data Flow)
- [ADR 0009](./0009-adopt-firebase-auth-with-local-emulator.md) - Firebase Authentication integration and emulator environment
- [ADR 0011](./0011-adopt-cookie-based-next-intl-with-firebase-sync.md) - Cookie-based next-intl and user locale synchronization
- [ADR 0012](./0012-adopt-playwright-for-e2e-testing.md) - Playwright E2E browser and emulator testing setup
