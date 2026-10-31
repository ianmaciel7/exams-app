# Security Policy

The project-specific security applicability and evidence status for HTTP
headers, authentication, authorization, and security testing is tracked in
[quality standards](docs/agents/quality-standards.md#status-and-evidence-model).

<!-- cspell:words gaxios googleusercontent -->

## Supported versions

Security fixes are applied to the current default branch of this template.

## Reporting a vulnerability

Please do not open a public issue for a suspected vulnerability. Report it
privately through GitHub private vulnerability reporting: open the repository's
**Security** tab and choose **Report a vulnerability**.

Include a clear description, affected files or versions, reproduction steps,
impact, and any suggested mitigation. Do not include credentials, access
tokens, or personal data in the report.

Maintainers will acknowledge a valid report, investigate it privately, and
coordinate disclosure and remediation with the reporter.

## Contributor expectations

- Keep secrets in local environment files; never commit `.env*` files or
  credentials. Never hardcode cloud credentials, API keys, private tokens, or
  environment overrides into tracked files, including `.vscode/launch.json` or
  tool configurations. Launch configurations must reference Git-ignored local
  files via `"envFile": "${workspaceFolder}/.env.production.local"`.
- Staged changes are automatically scanned for secrets by Gitleaks during the
  Husky pre-commit hook (`gitleaks protect --staged`). The `check:secret-guard`
  and `check:secrets` checks enforce this protection in `verify:fast` and CI.
- Validate and authorize all untrusted input at the server boundary.
- Firebase Web SDK access is still untrusted client input: enforce ownership and
  permitted fields, values, and upload constraints in Firestore and Storage
  Security Rules, not only in UI validation. Current profile rules scope
  `users/{uid}` documents and `users/{uid}/avatar` objects to the matching
  authenticated UID.
- The Firebase session worker transmits a refreshed ID token only to same-origin
  navigation/RSC requests. Its Firebase configuration is public Web SDK
  configuration, never Admin credentials. `FirebaseServerApp` verification can
  improve server rendering decisions but does not replace Firebase Security
  Rules or establish a shared authorization cache.
- Prefer server-side handling for sensitive operations and minimize data sent
  to Client Components.
- Keep dependencies current and review security advisories before upgrades.
  Dependabot proposes weekly updates; CI runs Semgrep, Gitleaks, `pnpm audit`,
  the separate Functions audit, actionlint, and zizmor. Document any audit exception with its justification,
  scope, and review condition rather than inheriting one you cannot justify.
- **Template-specific accepted risk:** `pnpm-workspace.yaml` suppresses
  `GHSA-vfj7-8cjw-p6xm` for `braces` based on the **template's current,
  development-only and trusted-glob use**. The advisory has no patched release
  in the dependency chain documented here. Before adopting this configuration
  in a derived project, inspect `pnpm why braces`, the full dependency tree
  and any production/runtime exposure; remove the exception as soon as the
  vulnerable dependency is gone. Never assume this acceptance covers new uses.
  Removing the suppression without remediating the dependency will make
  `pnpm audit` fail; do not hide that failure with broad audit exclusions.
- **Second accepted risk:** `GHSA-gcqx-w48m-w2h4` for `deepmerge` (low severity, no
  patched release) is suppressed because it is reached only through the shadcn CLI
  at development time. Apply the same re-check rules as for `braces`.
- Workflows use least-privilege permissions, full-SHA-pinned actions, and no
  deployment credentials. Keep it that way.
- Treat generated and third-party code as untrusted until reviewed. Vendored
  UI and AI Elements have scoped lint and analysis exceptions; those exceptions
  do not establish security or accessibility correctness. Review changes to
  HTML rendering, executable content, external links, and browser integrations
  at their usage boundaries.
- AI interface components do not configure an AI service, server-side
  authorization, or credentials. A derived application owns those decisions.

The template currently uses Firebase Authentication, Firestore preferences, and
Storage avatars. Projects derived from it must document their own access-control,
data-retention, and incident-response requirements, including changes to these
services or their Security Rules.

## Cloud Functions dependency audit

The Functions deployment has an independent `functions/package-lock.json`.
The root pnpm audit does not cover that graph. Run `pnpm audit:functions`;
the CI security job and `verify:security` include this separate audit.

`functions/package.json` pins the transitive `uuid` override to CommonJS-compatible
11.1.1 to address GHSA-w5hq-g745-h8pq (buffer bounds checking in v3/v5/v6).
The affected consumers `gaxios`, `google-gax`, and `teeny-request` use `v4()`;
their call sites and CommonJS resolution were inspected, and UUID generation
plus Firebase Admin/callable initialization were checked without network calls.
This is compatibility evidence, not a complete deployed integration test.
Remove the override when the parent packages resolve a patched compatible
version without it, and re-run the backend audit and relevant integration tests.

## Component registry updates

Registry items become executable application source and may introduce package
dependencies, styles, environment variable placeholders, and additional files.
Schema validation confirms the payload's shape; it does not establish that the
source or its dependencies are safe. Review the resolved project changes with
`shadcn add --dry-run`, `--diff`, or `--view` before installation, following
[TOOLING.md](TOOLING.md#shadcnui-cli-workflow).

Review the explicit registry or repository, requested version/ref, dependencies,
file destinations, and any configuration changes. Prefer an immutable commit
ref for a reviewed GitHub registry update. Keep private registry credentials in
environment variables and reference placeholders in configuration. Never store
live credentials in source inventories, examples, or command output. A public
registry health score is not a security audit.

Client form validation, disabled actions, and route guards do not authorize
Firebase data access. Preserve the existing Firestore and Storage ownership,
field/value, MIME type, and upload-size checks when updating UI source.

## Next.js server and environment boundaries

Server Components do not make all imported modules or returned props private.
Keep privileged server data access in a `server-only` boundary and project only
the fields the client needs. Client Components can render initial HTML on the
server and must still be treated as browser code. `"use server"` identifies
callable Server Functions; it does not establish user or resource permissions.

If a Server Function or Route Handler is introduced, validate untrusted inputs
and authenticate and authorize the operation at its data-access boundary.
Page redirects, client guards, Proxy matchers, hidden buttons, encrypted action
identifiers, and closed-over values do not replace those checks. Review response
serialization, upload limits, error disclosure, and cookie options with the
new endpoint. Role-based authorization follows [ADR 0009](docs/adr/0009-integrate-firebase-authentication.md):
verify tokens with Firebase Admin (`checkRevoked`) and gate protected data
through `verifySession` or `verifyRole` in `src/app/(protected)/_lib/dal.ts`
(using role claims from `src/lib/role.ts`); Security Rules remain the
enforcement point for browser access.

`NEXT_PUBLIC_*` values are public and inlined at build time. Also treat every
entry in `next.config.ts`'s `env` object as public bundle configuration,
regardless of its prefix. The current configuration has no `env` object;
browser emulator endpoints use explicit `NEXT_PUBLIC_*` configuration. Never
add credentials, Admin service-account data, private keys, or session secrets
to public bundle configuration. A prefix-free name in a future `env` object
would not make its value secret.
Changing a deployment environment does not rewrite already-built public values.

Shared caching must preserve tenant/user isolation and permission changes.
Do not put cookie stores, request headers, tokens, or privileged results into
a shared cache through closures or unresolved promises. Resolve request inputs
outside the cache, authorize access, and deliberately choose cache keys,
returned fields, lifetime, and invalidation. Cache invalidation is not access
control. Private/remote cache examples and taint APIs are optional tools, not
proof that cached data is safe.

For new external image sources, use narrow `remotePatterns`; validate external
URLs and proxy destinations to prevent unintended server requests. An
instrumentation exporter or hosting adapter needs a deployment and rendering
review. See the [Next.js maintenance rule](.agents/rules/cache.md).

## Content Security Policy

`src/proxy.ts` sends a nonce-based CSP on every document
([ADR 0023](docs/adr/0023-enforce-a-nonce-based-content-security-policy.md)).
`src/lib/csp.ts` owns the directives. Scripts run only with the request nonce
or when a script carrying the nonce loads them (`'strict-dynamic'`); eval is blocked in
production. Read the nonce with `getNonce()` from `src/lib/headers.ts` in a
Server Component and pass it to any library that renders inline `<script>` or
`<style>` tags; Base UI receives it through `CspProviderServer`. Never add
`'unsafe-eval'` or `'unsafe-inline'` for production styles or scripts; add the
narrowest origin to the matching directive instead. `img-src` allows only
`'self'`, `blob:`, `data:`, Firebase Storage, and Google account photos
(`lh3.googleusercontent.com`), so profile photos render without opening
`https:` for every image. Cloud Functions expose callables and blocking
triggers only; `functions/public-surface.test.cjs` fails on an `onRequest`
endpoint. `worker-src` also allows
`https://www.gstatic.com/firebasejs/`, where the auth service worker imports
the Firebase SDK from; Chromium checks those imports against the page policy.

## React rendering and input boundaries

React escapes ordinary text children; that does not sanitize arbitrary HTML,
executable content, DOM sinks, external URLs, or third-party renderers. Review
`dangerouslySetInnerHTML`, rich/streamed markup, JSX parsing, and URL-bearing
props at the actual trust boundary. Use the application's reviewed sanitization
and URL policies when such content is introduced; a registry or UI component's
presence is not a security approval.

Render purity and immutable inputs reduce unexpected cross-render behavior,
but lint and Compiler diagnostics do not establish authorization. React Actions,
optimistic updates, context providers, pending/disabled UI, and error boundaries
are not data-access controls. Server Function inputs and outputs remain
untrusted network boundaries; preserve the Next.js and Firebase security
contracts already documented above.

Do not expose privileged data through client props, raw server errors,
profiling artifacts, or broad cache entries. Framework-managed RSC transport
and hydration are not reasons to add custom serialization or HTML injection.
React and React DOM versions, framework integration, and server-component
security advisories must be reviewed together during an authorized upgrade.
The [React rules](.agents/rules/react.md) record architectural guardrails, not a
continuing vulnerability audit.
