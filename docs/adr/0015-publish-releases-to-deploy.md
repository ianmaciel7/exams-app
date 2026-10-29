# ADR 0015: Publish releases to deploy

- **Status**: Accepted
- **Date**: 2026-10-29
- **Deciders**: ianmaciel7

## Context

[ADR 0011](0011-configure-firebase-cd.md) made the production release a push of a
stable `vX.Y.Z` tag. A tag is easy to push by accident, carries no release notes, and
is invisible on the repository's releases page, which is where a release is expected to
be announced. A later attempt to show the release tag in the app patched a backend
`overrideEnv` field that the App Hosting API does not have, so the first release with
that step failed with a 400. App Hosting builds from a commit, so the version shown in
the app has to come from that commit.

## Decision

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

## Considered options

- **Keep pushing tags**: rejected for the reasons above.
- **Patch the backend with the tag**: rejected because the API has no such field, and no
  documented API sets a build variable per release.
- **Derive the version at build time from `package.json` in `next.config.ts`**: rejected
  because it would also show the version in CI builds and change the visual baselines.
- **A release workflow that commits the version**: deferred; it needs write access to the
  release branch, and the pull request bump is enough for now.

## Consequences

- A release is an explicit, announced action with notes, visible on the releases page.
- Every release needs a version bump in a merged pull request before it is published.
- Publishing a release with a mismatching tag fails fast, before anything is deployed.
- This record supersedes the tag-push trigger of ADR 0011. Its release branch, region,
  federation, and budget decisions remain in force.
