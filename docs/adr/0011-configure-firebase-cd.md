<!-- cspell:words southamerica -->

# ADR 0011: Configure Firebase continuous delivery

- **Status**: Accepted; incorporates former ADRs 0015, 0016, 0018, 0022
- **Date**: 2026-10-28
- **Deciders**: ianmaciel7

## Context

The application needs a repeatable production delivery path for its Next.js runtime, Firebase Functions, and Firebase security rules. The existing CI validates changes but deliberately does not deploy them. Firebase Hosting's static `public/` directory cannot host the application's server-rendered Next.js runtime, and the previous project alias did not identify the intended production project.

## Decision

Use one Firebase project as the production environment. Local development uses the Firebase Emulator Suite; no remote development project is introduced at this time. The repository will retain an explicit production alias and deployments must target it explicitly, rather than relying on a default project. The concrete project identifier is environment configuration, not repository documentation.

Use Firebase App Hosting for the Next.js runtime, connected to the application repository's release branch. Deploy Cloud Functions and the Firestore, Realtime Database, and Storage rules as part of the same release. Provision the default Native-mode Firestore database, default Storage bucket, and default Realtime Database instance in `us-central1`, with Functions colocated there. The choice prioritizes lower direct cost over latency for users in Brazil. Concrete backend, repository, and branch identifiers are environment configuration, not repository documentation.

Publish a production release automatically only for stable Semantic Versioning tags matching `vX.Y.Z`. The first production release is `v0.1.0`; `v0.x.y` versions are valid production releases before the eventual `v1.0.0`. A release tag must point to a commit already reachable from `main`; prerelease tags such as `v0.1.0-rc.1` do not deploy. The deployment job uses the GitHub `production` environment but has no manual approval gate.

Authenticate GitHub Actions with Google Cloud Workload Identity Federation and short-lived OIDC credentials. Keep runtime secrets in Secret Manager and App Hosting configuration, not in the repository or GitHub Secrets. Configure a monthly US$10 budget with alerts at 50%, 90%, and 100%, without automatic service shutdown.

## Considered options

- **Static Firebase Hosting**: rejected because it would publish only static assets and not the current server-capable Next.js application.
- **Manual production deploys**: rejected because release tags provide an auditable, immutable release trigger.
- **Long-lived service-account keys in GitHub Secrets**: rejected in favor of OIDC federation and short-lived credentials.
- **`southamerica-east1`**: rejected because the current priority is direct infrastructure cost rather than Brazilian latency.
- **A separate remote development project**: deferred; local emulators cover current development needs.

## Consequences

- Production infrastructure is deliberately centralized in one Firebase project, so repository configuration and release permissions must protect it from accidental use.
- `us-central1` reduces direct regional cost but may add latency for Brazilian users.
- App Hosting replaces the static Hosting deployment target for the Next.js runtime.
- The first setup requires privileged Google Cloud configuration for Workload Identity Federation, the App Hosting backend, data services, and budget alerts. Once configured, GitHub Actions uses only the narrowly scoped deployment identity.

## Incorporated decisions

The following records were merged into this one on 2026-11-01 at the maintainer's direction. Their text is kept as written, with the original number, status, and date, so the history stays traceable. The earlier files remain in Git history.

### Former ADR 0015: Publish releases to deploy

- **Original status**: Accepted
- **Original date**: 2026-10-29

#### Context (former ADR 0015)

[ADR 0011](0011-configure-firebase-cd.md) made the production release a push of a
stable `vX.Y.Z` tag. A tag is easy to push by accident, carries no release notes, and
is invisible on the repository's releases page, which is where a release is expected to
be announced. A later attempt to show the release tag in the app patched a backend
`overrideEnv` field that the App Hosting API does not have, so the first release with
that step failed with a 400. App Hosting builds from a commit, so the version shown in
the app has to come from that commit.

#### Decision (former ADR 0015)

Deploy production when a GitHub Release is **published**, not when a tag is pushed:

- The workflow runs on `release` events of type `published`. Draft releases never fire
  it, and prereleases are skipped. The tag is the release's tag, in the form `vX.Y.Z`.
- The release is created from a commit on the release branch. The workflow still rejects
  a commit that is not reachable from that branch.
- The version the app shows is `NEXT_PUBLIC_GIT_TAG` in `apphosting.yaml`, which is part
  of the commit that App Hosting builds. The workflow fails unless the release tag, the
  `package.json` version, and that value agree. `pnpm check:release` runs the same check
  in `verify:fast` and `verify:static`, so a mismatch is caught before the release.
- A release is prepared in a pull request that bumps `package.json` and the
  `apphosting.yaml` value together, then published from the merged commit.

Remove the workflow step that patched `overrideEnv`.

#### Considered options (former ADR 0015)

- **Keep pushing tags**: rejected for the reasons above.
- **Patch the backend with the tag**: rejected because the API has no such field, and no
  documented API sets a build variable per release.
- **Derive the version at build time from `package.json` in `next.config.ts`**: rejected
  because it would also show the version in CI builds and change the visual baselines.
- **A release workflow that commits the version**: deferred; it needs write access to the
  release branch, and the pull request bump is enough for now.

#### Consequences (former ADR 0015)

- A release is an explicit, announced action with notes, visible on the releases page.
- Every release needs a version bump in a merged pull request before it is published.
- Publishing a release with a mismatching tag fails fast, before anything is deployed.
- This record supersedes the tag-push trigger of ADR 0011. Its release branch, region,
  federation, and budget decisions remain in force.

### Former ADR 0016: Disable the invoker IAM check for callable Functions

- **Original status**: Accepted
- **Original date**: 2026-10-29

#### Context (former ADR 0016)

After the production rebuild, every protected page showed "Unable to record access" and
`/profile` never finished loading. The browser blocked the call to the `recordUsage`
callable with a CORS error. The Functions are Cloud Run services whose invoker policy was
empty, and Cloud Run rejects an unauthenticated request, including the CORS preflight that
browsers send without credentials, before the function runs. The Firebase ID token cannot
help: Cloud Run's check expects a Google identity, and only the handler verifies the
Firebase token.

Granting `roles/run.invoker` to `allUsers` was tried and refused: the organization policy
`iam.allowedPolicyMemberDomains` (domain restricted sharing) rejects `allUsers`.

#### Decision (former ADR 0016)

Turn off the Cloud Run invoker IAM check on the callable Functions that browsers call
(`recordusage`, `setuserrole`) with `gcloud run services update --no-invoker-iam-check`.
Google documents this as the recommended way to make a service public when domain
restricted sharing applies, and it creates no IAM binding, so the policy does not block it.

The CD workflow runs the command after `firebase deploy`. It is idempotent and restores the
setting if a deploy resets it. The deploy service account already holds `roles/run.admin`.

The Functions are not anonymous. Each handler verifies the Firebase ID token and rejects
callers without one, and `setUserRole` also checks the caller's role. `helloWorld` stays
private.

#### Considered options (former ADR 0016)

- **`allUsers` as invoker**: refused by the organization policy.
- **An exception to the organization policy**: rejected because it changes a policy owned by
  the organization and is not needed.
- **Proxy the calls through the Next.js server**: rejected as a larger change with no gain,
  since the handlers already authenticate callers.
- **Manage the setting in Terraform**: rejected because `firebase deploy` creates and
  updates these services, so Terraform would conflict with it.

#### Consequences (former ADR 0016)

- Adding a callable Function means adding its Cloud Run service name to the workflow step.
- The setting is applied on each release, not at the moment a service is created.
- Access control for these Functions lives only in their handlers.

### Former ADR 0018: Cover blocking functions in the release deploy

- **Original status**: Accepted
- **Original date**: 2026-10-29

#### Context (former ADR 0018)

The first release with the sign-in blocking functions ([ADR 0009](0009-integrate-firebase-authentication.md))
failed in two places. Blocking functions deploy to `us-east1` by default, so the Firebase
CLI created them there and could not make them public, because the organization policy
blocks `allUsers` ([ADR 0011](0011-configure-firebase-cd.md)).
The deploy of a new region also stops in non-interactive mode when no artifact cleanup
policy exists.

#### Decision (former ADR 0018)

- The step that disables the Cloud Run invoker check also covers `restrictsignup` and
  `restrictsignin`, each in its own region.
- `firebase deploy` runs with `--force`, so the CLI sets the artifact cleanup policy for
  the new region instead of failing.

#### Consequences (former ADR 0018)

- Moving a function to another region means updating the service list in the workflow.
- `--force` also lets a deploy delete functions that were removed from the source.

### Former ADR 0022: Gate production deploys on browser checks

- **Original status**: Accepted
- **Original date**: 2026-10-30

#### Context (former ADR 0022)

Firebase CD ran only `pnpm verify:fast` before deploying, so no browser test
guarded a release. The Playwright responsiveness and axe suites resized a desktop
browser, which ignores the meta viewport and never matches `(pointer: coarse)`.
Touch targets of 28 to 32px, 14px field text on landscape phones, missing
autofill tokens, missing level-one headings, and a sign-in layout shift all
passed. Without Firebase configuration in CI, the auth-route checks skipped.

#### Decision (former ADR 0022)

- Add a Playwright `mobile` project (Pixel 7 device emulation) for
  `tests/mobile.spec.ts`, and `tests/best-practices.spec.ts` for headers, the
  manifest, and document metadata.
- Add `pnpm check:lighthouse` with mobile budgets: accessibility 95, best
  practices 90, SEO 90, CLS 0.1, and performance 40 as a regression floor.
- Give the CI `e2e` job a placeholder Firebase web configuration so the auth
  forms render, then run Lighthouse after `pnpm verify:e2e`.
- Add a Firebase CD `browser-checks` job that runs the same suites on the release
  commit; the deploy job needs it. Only the deploy job holds `id-token: write`.

#### Consequences (former ADR 0022)

- A release that breaks mobile, accessibility, or layout stability stops before
  any production change.
- Releases take longer by one Playwright and Lighthouse run.
- The performance floor is low because the home hero waits for the client
  Firebase session (LCP about 6s on simulated slow 4G). Raise it after the hero
  renders on the server.
- The checks are listed in `TESTING.md`; the conventions they enforce are in
  `.agents/rules/mobile.md`.
