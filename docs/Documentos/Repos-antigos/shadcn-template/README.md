# shadcn template

This is a [Next.js](https://nextjs.org) template using the App Router,
TypeScript, Tailwind CSS, shadcn/ui, Biome, and `next-intl`.

## Getting Started

Use Node.js `^22.19.0 || ^24.5.0` and pnpm `12.11.2`, as declared in
`package.json`. Install dependencies with the committed lockfile and start the
development server:

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `src/app/page.tsx`. The page
auto-updates as you edit the file.

## After creating a repository from this template

1. Run `pnpm setup:github` (requires authenticated `gh` CLI) to configure GitHub
   repository merge policies (Squash only, Auto-merge enabled) and enable branch
   protection on the default branch (`CI result` required check, strict linear
   history, conversation resolution). GitHub template repositories do not inherit
   branch protection or repository settings from their template automatically.
2. Rename the package in `package.json`, update the application metadata and
   replace the starter home page. Update the README and domain documentation.
3. Keep the generic Playwright smoke, localization-request, and new-tab safety
   checks; adjust the `/` route assertions if your app does not expose a home
   page or primary heading. Add behavior-specific E2E tests for your own pages.
4. The visual baselines still capture the **starter UI**, not a reusable design
   contract. Once you replace the page, run the manual **Update visual baselines**
   workflow, review its PNG artifacts, and commit the new baseline images.
5. Reassess the documented `braces` audit exception in `pnpm-workspace.yaml`
   against the **new** dependency tree. Do not treat the original template's
   risk assessment as applicable to a different app.
6. Run `pnpm verify:fast`, `pnpm verify:full`, and `pnpm verify:e2e` before
   merging changes. Review the 70% coverage floor for code owned by your app;
   do not lower it merely to make CI green.
7. Keep CI provider-independent. Add staging, deployment and credentials only
   when the derived application has selected its hosting platform.

See [Testing](TESTING.md) and [Security](SECURITY.md) for details.

## Current application behavior

The starter exposes `/`. `next-intl` selects `en`, `pt-BR`, or `es` from an
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
