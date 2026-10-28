<!-- cspell:words southamerica -->

# ADR 0011: Configure Firebase continuous delivery

- **Status**: Accepted
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
