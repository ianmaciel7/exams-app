# ADR 0004: Configure Internationalization

- **Status**: Accepted
- **Date**: 2026-10-16
- **Deciders**: ianmaciel7

## Context
Applications built from this template require multi-language support (English, Portuguese `pt-BR`, and Spanish `es`). We need a robust internationalization architecture that works seamlessly across Next.js Server Components, Client Components, and routing without complex boilerplate or degraded SSR performance, following the proven pattern in `ianmaciel7/exams-app`.

## Decision
We adopt `next-intl` with a decoupled routing, provider, and message structure:

1. **Cookie-Driven Routing Without Middleware or Locale Route Segments**:
   The routing strategy is **100% cookie-driven (`NEXT_LOCALE`) without `middleware.ts` / `src/proxy.ts` and without a `[locale]` folder prefix in the App Router**. The application serves routes like `src/app/page.tsx` directly at `/`, avoiding proxy scripts, internal or external path rewriting overhead, or localized route nesting. This cookie-only, unprefixed route tree under `src/app/` is an explicit maintainer requirement: an internally rewritten `src/app/[locale]/` route segment via `NextResponse.rewrite()` and `next/root-params` was evaluated and rejected because even internal locale route segments violate this constraint.

2. **Routing Definition (`src/i18n/routing.ts`)**:
   Defines supported locales (`["en", "pt-BR", "es"]`), the fallback default locale (`"en"`), cookie name (`"NEXT_LOCALE"`), and the locale type guard (`isLocale`).
   ```ts
   import { hasLocale } from "next-intl";
   import { defineRouting } from "next-intl/routing";

   export const routing = defineRouting({
     locales: ["en", "pt-BR", "es"],
     defaultLocale: "en",
   });

   export const { locales, defaultLocale } = routing;
   export type Locale = (typeof routing.locales)[number];

   export function isLocale(value: unknown): value is Locale {
     return typeof value === "string" && hasLocale(locales, value);
   }

   export const localeCookie = "NEXT_LOCALE";
   ```

3. **Server Request Configuration (`src/i18n/request.ts`)**:
   Resolves the active locale from the `NEXT_LOCALE` request cookie (`cookies()`) or explicit server translation overrides and dynamically imports the corresponding JSON message dictionary from `src/messages/${locale}.json`. If missing or unsupported, it cleanly falls back to `defaultLocale` (`"en"`). Cookie-resolution regression tests cover every supported locale, invalid or missing cookies, and explicit overrides without mocking root parameters.

4. **Request-Localized Root HTML Language (`src/app/layout.tsx`)**:
   The root layout remains synchronous and composition-only. An outer `Suspense`
   boundary with an empty fallback renders the async `IntlDocumentServer` from
   `src/components/ui/extensions/intl-document-server.tsx`. It resolves
   `getLocale()` from the existing cookie-only request configuration and emits
   `<html lang={locale}>` with the original body classes. A separate nested
   `Suspense` retains the existing provider loading UI. The empty root fallback
   prevents an English document shell from being sent while a non-English
   request is pending. Production Playwright tests verify both the visible
   document language and the raw HTML response's first root tag for English,
   Portuguese and Spanish. This preserves `cacheComponents: true`,
   `partialPrefetching: true`, direct unprefixed routes and the explicit
   prohibition on `[locale]` segments or Proxy rewrites. Any change to the
   root fallback must rerun the server-response language checks.

5. **Navigation**:
   Navigation uses the standard Next.js `Link`, `useRouter`, and `usePathname` directly against unprefixed public URLs (localized navigation wrappers are also available via `src/i18n/navigation.ts` when needed, without internal pathname normalization helpers).

6. **Context Provider Wrapper (`src/components/ui/extensions/intl-provider-server.tsx`)**:
   An async Server Component (`server-only`) adhering to pure React context provider standards. It extends `Omit<React.ComponentProps<typeof NextIntlClientProvider>, "locale" | "messages">`, removes unnecessary DOM wrapper markup (`<div className="contents">`) to eliminate DOM tree pollution, resolves messages and locale server-side cleanly (`getLocale()`, `getMessages()`), assigns `locale` and `messages` after caller props, and adopts the standardized shadcn `function ... export { ... }` convention:
   ```tsx
   import "server-only";
   import { NextIntlClientProvider } from "next-intl";
   import { getLocale, getMessages } from "next-intl/server";
   import type * as React from "react";

   type IntlProviderServerProps = Omit<
     React.ComponentProps<typeof NextIntlClientProvider>,
     "locale" | "messages"
   >;

   async function IntlProviderServer({
     children,
     ...props
   }: IntlProviderServerProps) {
     const [locale, messages] = await Promise.all([getLocale(), getMessages()]);

     return (
       <NextIntlClientProvider {...props} locale={locale} messages={messages}>
         {children}
       </NextIntlClientProvider>
     );
   }

   export { IntlProviderServer };
   export type { IntlProviderServerProps };
   ```

7. **Message Catalogs (`src/messages/*.json`)**:
   Structured JSON files per locale (`en.json`, `pt-BR.json`, `es.json`) maintaining type-safe translation keys.

8. **Structural Catalog Validation and Property-Based Testing**:
   - **Catalog Structural Contract (`src/messages/messages.test.ts`)**: An automated Vitest suite that enforces catalog completeness across all supported locales. It verifies that `pt-BR.json` and `es.json` define the exact identical key hierarchy as `en.json`, that no translated string is empty or whitespace-only, and that ICU placeholders (such as `{name}`) match the reference catalog exactly.
   - **Property-Based Testing (`src/i18n/routing.test.ts`)**: Employs `fast-check` to assert that `isLocale` accepts every supported locale while strictly rejecting arbitrary non-locale strings, casing discrepancies (such as `pt-br` or `PT-BR`), and non-string inputs.
   - **Spelling Dictionary Integration (`@cspell/dict-pt-br`)**: Configured in `cspell.json` (`"language": "en,pt_BR"` with import `@cspell/dict-pt-br/cspell-ext.json`) to validate Portuguese terminology without false positives during spelling checks.

9. **Next.js Config Integration (`next.config.ts`)**:
   Wrap the Next.js configuration using the official `createNextIntlPlugin`:
   ```ts
   import createNextIntlPlugin from "next-intl/plugin";

   const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");
   export default withNextIntl(nextConfig);
   ```

10. **TypeScript Global Message Augmentation (`src/types/global.d.ts`)**:
    Declare global `IntlMessages` interface extending `Messages` (`typeof en`) to enable strict autocomplete and compile-time verification on `useTranslations()` keys:
    ```ts
    import type en from "../messages/en.json";

    type Messages = typeof en;

    declare global {
      // Use type safe message keys with `next-intl`
      interface IntlMessages extends Messages {}
    }
    ```

11. **Biome Linting Enforcement (`noJsxLiterals` and Next.js Grit rules)**:
    To ensure strings are not left hardcoded across the application:
    - **`style.noJsxLiterals`**: Configured as `"error"` with `"ignoreProps": true`. This flags raw JSX string literals (such as `<Kbd>page.tsx</Kbd>`) while ignoring attribute props (`className="..."`, `href="..."`, `variant="..."`) and translation calls (`{t("key")}`).
    - **UI Overrides**: Pre-built UI primitives in `src/components/ui/**` and `src/lib/highlighter.tsx` have `"noJsxLiterals": "off"` in `biome.json` overrides to prevent flagging internal accessibility labels (`Close`, `Toggle Sidebar`).
    - **Localized metadata**: Follow the `next-intl` pattern and use `generateMetadata()` with `getTranslations()` whenever metadata includes text that varies by locale. Static `metadata` exports remain valid for metadata that is identical in every locale, as supported by Next.js.
    - **Next.js route type helpers**: Custom rules under `.biome/rules/nextjs/` recommend the generated `PageProps`, `LayoutProps`, and `RouteContext` helpers instead of manually declaring route props. These helpers are generated by `next dev`, `next build`, or `next typegen`.

## Consequences
- **Positive**:
  - Full support for Server Components and Client Components out-of-the-box.
  - 100% cookie-driven locale resolution (`NEXT_LOCALE`) without `middleware.ts` overhead or `[locale]` path prefix pollution.
  - Compile-time type-safety for translation keys via the `IntlMessages` global interface augmentation.
  - Automated structural test suite (`src/messages/messages.test.ts`) guaranteeing identical keys and ICU placeholder consistency across all catalogs.
  - Property-based testing via `fast-check` ensuring robustness of locale type guards.
  - Native Portuguese spelling validation with `@cspell/dict-pt-br`.
  - Pure React context provider with zero DOM pollution or unexpected layout side effects.
  - Consistent shadcn component declaration and export pattern across UI extensions.
  - Automated Biome static analysis preventing un-translated JSX text without breaking Tailwind `className` DX.
- **Negative / Trade-offs**:
  - Requires maintaining translations across 3 language JSON files for UI strings.
  - Root document output waits for request-specific locale resolution before emitting the HTML element, trading an immediate static root fallback for correct server-rendered language.
  - Requires configuring `next.config.ts` with `createNextIntlPlugin`.
  - Developers must use `generateMetadata()` with `getTranslations()` when metadata needs localization.
