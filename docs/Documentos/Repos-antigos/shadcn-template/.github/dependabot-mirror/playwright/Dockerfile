# Mirror of the `container.image` in workflows/ci.yml and workflows/visual-baselines.yml.
# Dependabot's docker ecosystem does not read workflow files, only Dockerfiles,
# so this file exists solely to receive tag+digest bump PRs. It is never built.
# When a PR bumps this line, copy the same tag@digest into both workflows
# (and keep it aligned with @playwright/test in package.json).
FROM mcr.microsoft.com/playwright:v1.64.1-noble@sha256:7852dc5a7d72f5fe458a597d690f6c42fbc8e9e26ddfa95f8e6ef552558d9bbf
