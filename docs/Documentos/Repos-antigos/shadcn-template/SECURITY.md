# Security Policy

## Supported versions

Security fixes are applied to the current default branch of this template.

## Reporting a vulnerability

Please do not open a public issue for a suspected vulnerability. Report it
through the repository's private vulnerability-reporting channel when one is
published. This repository does not currently publish a dedicated private
reporting channel. Until one is configured, contact the repository maintainers
through an established private channel before sharing vulnerability details.

Maintainers must enable GitHub private vulnerability reporting or add a direct
private contact here before inviting public security reports.

Include a clear description, affected files or versions, reproduction steps,
impact, and any suggested mitigation. Do not include credentials, access
tokens, or personal data in the report.

Maintainers will acknowledge a valid report, investigate it privately, and
coordinate disclosure and remediation with the reporter.

## Contributor expectations

- Keep secrets in local environment files; never commit `.env*` files or
  credentials.
- Validate and authorize all untrusted input at the server boundary.
- Prefer server-side handling for sensitive operations and minimize data sent
  to Client Components.
- Keep dependencies current and review security advisories before upgrades.
  Dependabot proposes weekly updates; CI runs Semgrep, Gitleaks, `pnpm audit`,
  actionlint, and zizmor. Document any audit exception with its justification,
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
- Workflows use least-privilege permissions, full-SHA-pinned actions, and no
  deployment credentials. Keep it that way.
- Treat generated and third-party code as untrusted until reviewed. Vendored
  UI and AI Elements have scoped lint and analysis exceptions; those exceptions
  do not establish security or accessibility correctness. Review changes to
  HTML rendering, executable content, external links, and browser integrations
  at their usage boundaries.
- AI interface components do not configure an AI service, server-side
  authorization, or credentials. A derived application owns those decisions.

This template does not prescribe an authentication provider or data store.
Projects derived from it must document their own access-control, data-retention,
and incident-response requirements.
