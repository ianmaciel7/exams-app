# exams-app

This is a [Next.js](https://nextjs.org) template using the App Router,
TypeScript, Tailwind CSS, shadcn/ui, Biome, and `next-intl`.

## Getting Started

Use Node.js `^22.22.1 || ^24.5.0` and pnpm `12.14.0`, as declared in
`package.json`. The intended reproducible setup installs dependencies with
the committed lockfile and starts the development server:

```bash
pnpm install --frozen-lockfile
pnpm dev
```

pnpm 12 stores package-manager metadata and the application dependency graph
in separate YAML documents within the committed lockfile. Read both documents
when inspecting it. See [Package management](TOOLING.md#package-management).

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `src/app/page.tsx`. The page
auto-updates as you edit the file.

## After creating a repository from this template

1. Enable CodeQL in **Settings → Code security → Code scanning → Set up → Default**
   and confirm that its first analysis succeeds. Code scanning must be available
   for the repository (private repositories may require GitHub Code Security).
   The ruleset requires CodeQL results; applying it without an active scanner
   blocks pull request merges.
2. Run `pnpm setup:github` locally with a `gh` CLI session authenticated
   as a repository administrator. This configures Squash-only merges,
   auto-merge, and protection of the default branch (required `CI result`
   check, strict linear history, and review-conversation resolution). GitHub
   template repositories do not inherit these settings automatically.
   Repository administration is deliberately **not** performed by GitHub
   Actions: the default `GITHUB_TOKEN` lacks permission to modify rulesets,
   and privileged repository secrets must not be exposed to branch-selectable
   workflows. Re-run the local command when repository policies change.
3. Rename the package in `package.json`, update the application metadata and
   replace the starter home page. Update the README and domain documentation.
4. Keep the generic Playwright smoke, localization-request, and new-tab safety
   checks; adjust the `/` route assertions if your app does not expose a home
   page or primary heading. Add behavior-specific E2E tests for your own pages.
5. The visual baselines still capture the **starter UI**, not a reusable design
   contract. Once you replace the page, run the manual **Update visual baselines**
   workflow, review its PNG artifacts, and commit the new baseline images.
6. Reassess the documented `braces` audit exception in `pnpm-workspace.yaml`
   against the **new** dependency tree. Do not treat the original template's
   risk assessment as applicable to a different app.
7. Run `pnpm verify:fast`, `pnpm verify:full`, and `pnpm verify:e2e` before
   merging changes. Review the 70% coverage floor for code owned by your app;
   do not lower it merely to make CI green.
8. Keep CI provider-independent. Add staging, deployment and credentials only
   when the derived application has selected its hosting platform.

See [Testing](TESTING.md) and [Security](SECURITY.md) for details.

## Current application behavior

The starter exposes `/`, public authentication routes (`/sign-in`, `/register`,
`/forgot-password`), and the client-guarded `/profile` route. Firebase Security
Rules enforce data ownership; the client guard handles navigation only.
`next-intl` selects `en`, `pt-BR`, or `es` from an
explicit request locale or the `NEXT_LOCALE` cookie, falling back to `en`.
There is no locale route segment or request proxy configured. The root
`<html lang="en">` is currently static; cookie-based translations do not update
that attribute. See [Architecture](ARCHITECTURE.md#internationalization).

## Documentation

Start with the [documentation guide](docs/README.md) for ownership, maintenance,
and the distinction between current guidance and historical decisions.

- [Design system](DESIGN.md)
- [Architecture](ARCHITECTURE.md)
- [Coding standards](CODING_STANDARDS.md)
- [Tooling](TOOLING.md)
- [Testing](TESTING.md)
- [Contributing](CONTRIBUTING.md)
- [Security](SECURITY.md)
- [Glossary](GLOSSARY.md)
- [Entity-relationship diagram](DER.md)
- [Architecture decision records](docs/adr/README.md)
- [Agent integrations and skills](.agents/README.md)
- [Agent rules by topic](.agents/rules/README.md)

## Validation

Run the following before opening a pull request:

```bash
pnpm verify:fast   # lint, typecheck, unit tests (seconds)
pnpm verify:full   # adds analysis, coverage, browser tests, builds, and size budgets
pnpm verify:e2e    # Playwright: functional, accessibility, visual
```

Develop components in isolation with `pnpm ladle`. See [TESTING.md](TESTING.md)
for the test strategy and [TOOLING.md](TOOLING.md) for every command and host
prerequisite.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js)
for framework source and release notes.
