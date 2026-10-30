<!-- cspell:words creds -->

# Firebase continuous delivery

The Firebase CD workflow in `.github/workflows/firebase-cd.yml` deploys to the GitHub
`production` environment when a stable GitHub Release (`vX.Y.Z`) is published
([ADR 0015](adr/0015-publish-releases-to-deploy.md)). Draft releases and
prereleases do not deploy, and a release whose commit is not reachable from the
configured release branch is rejected.

## Production environment configuration

Create a GitHub Environment named `production`. Add these environment-scoped
variables there; do not commit their concrete values to the repository:

| Variable | Purpose |
| --- | --- |
| `FIREBASE_PROJECT_ID` | Firebase production project identifier. |
| `FIREBASE_APP_HOSTING_BACKEND_ID` | App Hosting backend that serves the Next.js application. |
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

1. Open a pull request that bumps the `version` in `package.json` and sets
   `NEXT_PUBLIC_GIT_TAG` in `apphosting.yaml` to the same value with a `v` prefix.
   `pnpm check:release` fails when they differ.
2. Merge it into the release branch.
3. On the Releases page of the repository, create a release for the new tag
   (`vX.Y.Z`) targeting the merged commit, write the notes, and publish it.

A `browser-checks` job first runs `pnpm verify:e2e` (desktop and Pixel 7 mobile
projects, axe, visual) and `pnpm check:lighthouse` on the release commit in the
pinned Playwright container; the deploy job needs it, so a failure stops the
release before anything reaches production. The deploy job then validates the tag
against `package.json` and `apphosting.yaml`, runs `pnpm verify:fast`, deploys Functions and rules, turns off the Cloud Run invoker check
on the callable Functions so browsers can call them ([ADR 0016](adr/0016-disable-invoker-iam-check-for-callable-functions.md)),
then requests an App Hosting rollout for that exact commit. Next.js embeds `NEXT_PUBLIC_GIT_TAG` in the browser bundle at
build time, so the app shows the version that was released.
