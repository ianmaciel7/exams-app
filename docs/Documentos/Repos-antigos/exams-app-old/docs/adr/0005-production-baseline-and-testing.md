# ADR 0005: Production Baseline, Observability, and Automated Testing

## Status
Accepted

## Date
2026-11-10 (Consolidated & Cleaned: 2026-11-11)

## Context
Following the native Next.js 16 foundations ([ADR 0004](0004-native-nextjs-foundations.md)), the project requires establishing a production-grade infrastructure baseline before developing product features:

1. **Environment Variables**: Standalone `.env*` loading in test runners and standalone scripts, coupled with a centralized, type-safe runtime configuration.
2. **Observability & Telemetry**: Distributed OpenTelemetry server tracing, structured JSON request error logging, client-side Core Web Vitals monitoring, and privacy-first web analytics compatible with Firebase / Google Cloud.
3. **Feature Flagging**: Server-only feature flags configured strictly around active project environment variables.
4. **Performance Auditing**: Automated bundle composition and size inspections (`pnpm analyze`).
5. **Two-Tier Automated Testing**: Fast in-memory unit/component testing with Vitest and React Testing Library, paired with browser-level End-to-End (E2E) validation via Playwright.

### Deliberate Exclusions & Scope Discipline
In alignment with our architecture simplicity principles:
- **Excluded: `@vercel/analytics` & `@vercel/speed-insights`**: Proprietary endpoints (`/_vercel/insights/event`, `/_vercel/speed-insights/v1`) that fail outside Vercel infrastructure. Replaced with cloud-agnostic `@next/third-parties` (GA4 / Firebase) and native `next/web-vitals`.
- **Excluded: `@next/mdx` & `@mdx-js/*`**: Markdown/MDX content compilation is a domain/content requirement for future educational questions, not baseline production infrastructure. Kept out of the baseline to avoid unnecessary build and route complexity (`pageExtensions`).
- **Excluded: `@next/codemod`**: One-off AST migration tools are executed on-demand via `npx @next/codemod` and must not be committed to persistent `devDependencies`.
- **Eliminated: Mock Feature Flags**: Removed hypothetical examples (`showNewExamEngine`). Feature flags in `src/lib/flags.ts` are strictly wired to real project environment variables (`enableAnalytics`, `enableTelemetry`).

---

## Decision

We establish five integrated pillars across production runtime, observability, and test automation:

### 1. Environment Variable Management (`@next/env` & `src/lib/env.ts`)

- **Standalone Loader (`@next/env`)**:
  Used in non-Next runtime contexts (such as `src/test/setup.ts` for Vitest) to mirror Next.js cascading `.env` file resolution:
  ```ts
  import { loadEnvConfig } from "@next/env";
  loadEnvConfig(process.cwd());
  ```
- **Runtime Environment Module (`src/lib/env.ts`)**:
  Provides a typed single source of truth for runtime variables without heavy external validation libraries:
  ```ts
  export interface Env {
    readonly NODE_ENV: "development" | "production" | "test";
    readonly OTEL_SERVICE_NAME: string | undefined;
    readonly NEXT_PUBLIC_GA_ID: string | undefined;
  }

  export const env: Env = {
    NODE_ENV: (process.env.NODE_ENV as Env["NODE_ENV"]) ?? "development",
    OTEL_SERVICE_NAME: process.env.OTEL_SERVICE_NAME,
    NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
  };
  ```

---

### 2. Observability & Telemetry

- **OpenTelemetry Tracing (`@vercel/otel`)**:
  Initializes distributed tracing and span instrumentation in `src/instrumentation.ts`:
  ```ts
  import { registerOTel } from "@vercel/otel";
  import { env } from "@/lib/env";

  export async function register() {
    registerOTel({
      serviceName: env.OTEL_SERVICE_NAME,
    });
  }
  ```
- **Structured Error Logging (`onRequestError`)**:
  Captures uncaught server and route errors in `src/instrumentation.ts` and outputs structured JSON to stdout, natively ingested by Google Cloud Logging / Firebase:
  ```ts
  export const onRequestError: Instrumentation.onRequestError = async (
    err,
    request,
    context,
  ) => {
    console.error(
      JSON.stringify({
        severity: "ERROR",
        event: "next_request_error",
        message: err instanceof Error ? err.message : String(err),
        digest: (err as { digest?: string }).digest,
        path: request.path,
        method: request.method,
        routerKind: context.routerKind,
        routeType: context.routeType,
      }),
    );
  };
  ```
- **Real User Monitoring (`next/web-vitals`)**:
  Colocated in `src/app/_components/web-vitals.tsx` using native Next.js APIs to track Core Web Vitals (LCP, FID, CLS, INP) without vendor lock-in.
- **Web Analytics (`@next/third-parties`)**:
  Integrates Google Analytics 4 in `src/app/layout.tsx` deferred post-hydration when `NEXT_PUBLIC_GA_ID` is defined.

---

### 3. Server-Only Feature Flagging (`flags`)

Feature flags in `src/lib/flags.ts` leverage `flags/next` to evaluate server-only conditions tied directly to real project configuration:
```ts
import { flag } from "flags/next";
import { env } from "./env";

export const enableAnalytics = flag<boolean>({
  key: "enable-analytics",
  defaultValue: false,
  description: "Enables Google Analytics tracking when NEXT_PUBLIC_GA_ID is set",
  async decide() {
    return Boolean(env.NEXT_PUBLIC_GA_ID);
  },
});

export const enableTelemetry = flag<boolean>({
  key: "enable-telemetry",
  defaultValue: false,
  description:
    "Enables OpenTelemetry runtime instrumentation when OTEL_SERVICE_NAME is set",
  async decide() {
    return Boolean(env.OTEL_SERVICE_NAME);
  },
});
```

---

### 4. Production Bundle Auditing (`@next/bundle-analyzer`)

Configured in `next.config.ts` to inspect JavaScript bundle composition and size distributions on-demand:
- Script: `pnpm analyze` (`cross-env ANALYZE=true next build`).

---

### 5. Automated Testing Infrastructure

A two-tier testing architecture separates fast in-memory execution from full browser rendering:

#### Layer 1: Unit & Component Testing (Vitest + React Testing Library)
- **Packages**: `vitest`, `@vitejs/plugin-react`, `jsdom`, `@testing-library/react`, `@testing-library/dom`, `@testing-library/jest-dom`.
- **Configuration (`vitest.config.mts`)**: Configured with `environment: "jsdom"`, tsconfig paths resolution, and `setupFiles: ["./src/test/setup.ts"]`.
- **Test Placement**: Colocated under `src/` (e.g., `src/lib/env.test.ts`, `src/lib/flags.test.ts`, `src/app/api/health/route.test.ts`, `src/app/not-found.test.tsx`, `src/app/error.test.tsx`).

#### Layer 2: End-to-End Testing (Playwright)
- **Packages**: `@playwright/test` targeting Chromium.
- **Configuration (`playwright.config.ts`)**: Configured with `testDir: "./tests"`, automated `webServer` (`pnpm dev` on `http://localhost:3000`), retry tracing, and parallel worker controls.
- **Test Placement**: Root `./tests` directory (e.g., `tests/home.spec.ts`).

#### Scripts
- `pnpm test`: `vitest run`
- `pnpm test:watch`: `vitest`
- `pnpm test:e2e`: `playwright test`

---

## Consequences

- **Positive**:
  - **Clean & Cohesive Baseline**: Single architectural decision record governing runtime production readiness and automated verification.
  - **Zero Bloat**: Unused content loaders (MDX) and CLI codemods eliminated from `package.json`, removing over 250 transient dependencies.
  - **Full Observability**: OpenTelemetry tracing, structured error logging, Core Web Vitals, and GA4 telemetry active and configurable.
  - **Real Flags Only**: Feature flags strictly represent actual project environment variables (`NEXT_PUBLIC_GA_ID`, `OTEL_SERVICE_NAME`).
  - **Continuous Verification**: Comprehensive test coverage across unit, route handler, React component, and end-to-end browser flows.
- **Operational**:
  - Production deployments require configuring `NEXT_PUBLIC_GA_ID` and `OTEL_SERVICE_NAME` in production environment variables.
  - Playwright requires local browser binaries (`pnpm exec playwright install chromium`).

---

## Implementation Audit — 2026-11-11

- **Clean Package Footprint**: Confirmed removal of `@next/mdx`, `@mdx-js/loader`, `@mdx-js/react`, `@types/mdx`, and `@next/codemod`.
- **Verified Suite**:
  - `pnpm lint`: Biome check passed with 0 errors across 31 files.
  - `pnpm typecheck`: Next.js type generation and TypeScript compiler passed with 0 errors.
  - `pnpm test`: 5 test files, 6 tests passed (100% pass rate).
  - `pnpm test:e2e`: 2 Playwright browser tests passed (100% pass rate).
  - `pnpm build`: Next.js Turbopack production build succeeded cleanly.
