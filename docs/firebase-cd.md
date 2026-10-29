<!-- cspell:words creds -->

# Firebase continuous delivery

The Firebase CD workflow in `.github/workflows/firebase-cd.yml` deploys stable
Semantic Versioning tags (`vX.Y.Z`) to the GitHub `production` environment.
It rejects prerelease tags and tags whose commit is not reachable from the
configured release branch.

## Production environment configuration

Create a GitHub Environment named `production`. Add these environment-scoped
variables there; do not commit their concrete values to the repository:

| Variable | Purpose |
| --- | --- |
| `FIREBASE_PROJECT_ID` | Firebase production project identifier. |
| `FIREBASE_APP_HOSTING_BACKEND_ID` | App Hosting backend that serves the Next.js application. |
| `FIREBASE_APP_HOSTING_LOCATION` | App Hosting backend location, used to configure the release build. |
| `FIREBASE_RELEASE_BRANCH` | Branch whose reachable commits are eligible for release. |
| `GOOGLE_SERVICE_ACCOUNT` | Deployment service-account email. |
| `GOOGLE_WORKLOAD_IDENTITY_PROVIDER` | Full Google Cloud Workload Identity Provider resource name. |

The workflow uses GitHub OIDC and Workload Identity Federation. Do not create
or store a long-lived service-account key in GitHub Secrets. The generated
credential file is ignored by `gha-creds-*.json`.

## Google Cloud and Firebase prerequisites

Before the first release, configure the production Firebase project with:

1. A Native-mode Firestore database, default Storage bucket, and default
   Realtime Database instance in `us-central1`.
2. A Firebase App Hosting backend connected to the application repository and
   release branch.
3. A deployment service account and a GitHub Workload Identity Provider trusted
   only for this repository and the `production` environment.
4. Permissions required to deploy Firebase Functions and security rules,
   including Cloud Functions Admin and Service Account User where applicable.
5. Runtime secrets in Secret Manager or App Hosting configuration.
6. Permission to update the App Hosting backend (`firebaseapphosting.backends.update`) and create rollouts.
7. A monthly US$10 budget with alerts at 50%, 90%, and 100%.

The deployment service account needs only deployment permissions. Personal
administrator access is for setup and troubleshooting, not normal releases.

## Release procedure

Create and push a stable tag from a commit already merged into the configured
release branch. For the first release, use `v0.1.0`. The workflow validates the
tag, runs `pnpm verify:fast`, deploys Functions and rules, then requests an App
Hosting rollout for that exact commit. Before that rollout, it updates the
backend override `NEXT_PUBLIC_GIT_TAG` with the triggering tag and makes it
available during the App Hosting build. Next.js embeds this public variable in
the browser bundle at build time.
