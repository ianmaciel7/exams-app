# Quality standards

<!-- cspell:words CLDR bidi DTCG ASVS MASVS LGPD PKCE HSTS -->

The project owner's agreed list of external standards for auditing the app.
This is the central applicability and evidence register for web quality
standards. It distinguishes normative requirements, best current practice,
implementation guidance, and local conventions. A standard's presence here
does not make every provision applicable or prove conformance.

## Status and evidence model

Use `Compliant` only for the stated, scoped requirement when implementation and
an appropriate check support it. `Partial` means evidence covers only part of
the applicable requirement. `Non-compliant` means a known, reproducible gap
exists. `Not verified` means the evidence is insufficient. `Not applicable`
requires a repository-specific reason. Automated checks are evidence only for
the scenarios they exercise; axe, static scans, Lighthouse, and mocks do not
prove complete standards conformance, real-user performance, or production
provider behavior.

| Requirement / source | Reference class | Applies to | Current status and implementation evidence | Gap / priority |
| --- | --- | --- | --- | --- |
| WCAG 2.2 A/AA, including 1.1.1, 1.3.1, 1.4.3, 1.4.10, 1.4.11, 1.4.12, 2.1.1, 2.4.3, 2.4.7, 2.4.11, 2.5.8, 3.3.1, 3.3.3, 4.1.2, 4.1.3 | Normative Standard: [WCAG 2.2 conformance](https://www.w3.org/TR/WCAG22/#conformance) and [success criteria](https://www.w3.org/TR/WCAG22/#guidelines) | All user-facing routes and interactions | **Partial** — Playwright axe A/AA, responsive, text-spacing, target-size, reduced-motion, and selected user-journey checks run in CI. Sign-in/register/recovery/profile field errors now connect `aria-invalid` controls to inline `FieldError`; Firebase Emulator journey checks this on recovery. | Keyboard/focus and screen-reader review remains manual; MFA/phone form associations and every criterion are not covered end-to-end. Priority: P1 for inaccessible critical errors; otherwise ongoing. |
| WAI-ARIA 1.2 and APG alert/dialog/widget patterns | Normative semantics plus Implementation Guidance: [WAI-ARIA 1.2](https://www.w3.org/TR/wai-aria-1.2/), [APG Alert](https://www.w3.org/WAI/ARIA/apg/patterns/alert/), [forms notifications](https://www.w3.org/WAI/tutorials/forms/notifications/) | Dynamic status, errors, dialogs, custom controls | **Partial** — native HTML and Base UI patterns are used; `FieldError` exposes `role="alert"`; axe and selected keyboard journeys run. | No complete per-widget APG keyboard matrix or assistive-technology verification. Avoid claiming APG conformance from axe alone. |
| HTML Living Standard, DOM, Fetch, URL, CSS, ECMAScript / ECMA-402 | Normative Standards: [HTML](https://html.spec.whatwg.org/), [DOM](https://dom.spec.whatwg.org/), [Fetch](https://fetch.spec.whatwg.org/), [URL](https://url.spec.whatwg.org/), [CSS](https://www.w3.org/TR/css/), [ECMAScript](https://tc39.es/ecma262/), [ECMA-402](https://tc39.es/ecma402/) | Browser output, APIs, styling, locale formatting | **Partial** — TypeScript, Biome, Next build, browser tests and locale catalogs validate selected contracts; installed browser tests run Chromium. | Not a full conformance suite. Firefox/WebKit and broader CSS Baseline compatibility are not currently part of the configured critical journey matrix. |
| HTTP semantics and caching (RFC 9110, 9111), cookies (RFC 6265), URI (RFC 3986), date/JSON formats (RFC 3339, 8259) | Normative Standards: [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110), [RFC 9111](https://www.rfc-editor.org/rfc/rfc9111), [RFC 6265](https://www.rfc-editor.org/rfc/rfc6265), [RFC 3986](https://www.rfc-editor.org/rfc/rfc3986), [RFC 3339](https://www.rfc-editor.org/rfc/rfc3339), [RFC 8259](https://www.rfc-editor.org/rfc/rfc8259) | Next.js responses, service-worker token bridge, Firebase SDK calls | **Partial** — HTTP response smoke tests, configured response headers, same-origin service-worker bridge, Firebase callable SDK and browser journeys are covered. | No first-party REST Route Handler or Server Action contract exists; there is no app-owned Problem Details/OpenAPI/JSON Patch API. Firebase-managed wire formats are not redefined. Audit cache/cookie behavior at deploy boundary remains limited. |
| CORS, CSRF, content negotiation and redirects | Platform/HTTP requirements applied to the actual request boundary | Browser-to-Firebase SDK requests and same-origin Firebase session bridge | **Not applicable** for a custom app API policy — there is no app-owned cross-origin HTTP API or session-cookie endpoint; redirects are constrained by the safe return-URL module and browser journeys. | Provider-managed Firebase CORS behavior and deployed hosting redirects are outside this local test boundary; re-evaluate if custom endpoints or cookies are introduced. |
| RFC 9457 Problem Details, OpenAPI, JSON Schema, JSON Patch | Normative/registry standards | App-owned HTTP APIs only | **Not applicable** — source inventory has no app-owned Next Route Handler or Server Action response API; Firebase callable functions retain their SDK contract. | Reassess when an app-owned HTTP API is introduced. |
| OAuth 2.0 Security BCP (RFC 9700), PKCE (RFC 7636), JWT BCP (RFC 8725), Firebase Auth | Normative Standards plus vendor Implementation Guidance: [RFC 9700](https://www.rfc-editor.org/rfc/rfc9700), [RFC 7636](https://www.rfc-editor.org/rfc/rfc7636), [RFC 8725](https://www.rfc-editor.org/rfc/rfc8725), [Firebase Google sign-in](https://firebase.google.com/docs/auth/web/google-signin) | Firebase identity, ID-token verification, role and data access | **Partial** — Firebase Auth Emulator browser journeys, blocking-function allowlists, revocation-aware Admin token verification, owner/admin Firestore rules, owner Storage rules, closed RTDB rules, and security scans are present. | Emulator does not validate actual Google consent/provider/browser popup behavior or production IAM. Deployed OAuth and permission review remains required. Priority: P1 for auth/security regressions. |
| CSP Level 3, HSTS (RFC 6797), OWASP ASVS / Cheat Sheets | W3C Working Draft / Normative RFC / Best Current Practice: [CSP3 status](https://www.w3.org/TR/CSP3/), [HSTS](https://www.rfc-editor.org/rfc/rfc6797), [ASVS](https://asvs.owasp.org/), [OWASP Cheat Sheets](https://cheatsheetseries.owasp.org/) | Deployed browser security boundary and code/security configuration | **Partial** — `next.config.ts` provides HSTS, nosniff, Referrer-Policy, frame options, Permissions-Policy, and restrictive CSP directives; browser check plus Semgrep, Gitleaks, workflow audit, and dependency audits run. | CSP is not a complete script policy; nonce integration was deferred because of Firebase Auth/runtime constraints. No ASVS level-by-level audit or production header observation is claimed. |
| BCP 47, RFC 5646/4647, ECMA-402, CLDR/UTS #35, Unicode bidi | Normative Standards: [RFC 5646](https://www.rfc-editor.org/rfc/rfc5646), [RFC 4647](https://www.rfc-editor.org/rfc/rfc4647), [ECMA-402](https://tc39.es/ecma402/), [UTS #35](https://www.unicode.org/reports/tr35/), [UAX #9](https://www.unicode.org/reports/tr9/) | Supported `en`, `pt-BR`, `es` content and browser formatting | **Partial** — localized catalogs and server-rendered `lang` are tested; locale fallback and persistence have unit/browser coverage. | No date/number formatting contract tests, RTL locale, bidi isolation, or RTL layout is required by the current supported locales. |
| Core Web Vitals and Web Platform Baseline | Best Current Practice: [Web Vitals](https://web.dev/articles/vitals), [Baseline](https://web.dev/baseline) | User-perceived loading, interaction, stability and browser support | **Partial** — Lighthouse CI gates selected lab budgets and bundle size; layout regression and responsive Playwright checks exist. | No RUM/field dataset, so no field CWV claim; Lighthouse lab results are not field performance. No explicit Baseline browser matrix. |
| PWA manifest / Service Worker and offline behavior | Platform standards and Implementation Guidance: [Manifest](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest), [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API) | Installability/offline only if product promises these capabilities | **Not applicable** for offline behavior — service worker exists only to bridge Firebase session tokens; app makes no offline capability promise. Manifest is independently validated. | No offline cache, offline mutation queue, or PWA icon/installability claim. |
| ISO 9241, ISO/IEC 25010, Nielsen heuristics, GOV.UK/Carbon/Material | Ergonomics/quality models and Implementation Guidance | Product interaction and quality review | **Partial/manual** — local design, mobile and interaction conventions plus CI quality checks cover selected concerns. | No formal ISO certification or complete heuristic/user research audit. These references are guidance, not universal implementation mandates. |
| RFC 9745 Deprecation, RFC 6902 JSON Patch, WebAuthn, Search structured data, WPT | Normative Standards / project-specific implementation | Only if app adds versioned HTTP APIs, patch semantics, passkeys, search schema or browser conformance ownership | **Not applicable** — none are present or promised by the product today. | Reassess when a corresponding capability is introduced. |

### Evidence scope

The source inventory for this revision found App Router pages/layouts and
Firebase callable SDK usage, but no project-authored `route.ts` handlers or
`'use server'` Server Functions. Firebase Security Rules remain the browser
data authorization boundary; Admin SDK operations require application-level
authorization because they bypass those rules. CI jobs and local commands are
listed in [TOOLING.md](../../TOOLING.md) and the journey coverage is documented
in [TESTING.md](../../TESTING.md). Context7 lookup was attempted for the exact
installed framework/SDK versions but was unavailable due to monthly quota; no
Context7 success is claimed. Version-matched Next.js installed docs and linked
primary sources informed the checks.

## Revision findings and validation

| Location | Finding and user impact | Reference | Change | Validation | Status |
| --- | --- | --- | --- | --- | --- |
| `playwright.config.ts`, `tests/home.spec.ts` | Local E2E could reuse an already-running server at port 3000, so results could come from a stale build. | [Playwright webServer](https://playwright.dev/docs/test-webserver); project convention | E2E now builds and starts its own production server on port 4173 with reuse disabled; locale-cookie tests target the same origin. | `pnpm verify:e2e`: production build passed; 40 passed, 31 skipped. | Resolved |
| `vitest.config.mts` | Vitest Browser Mode used port 62315, inside a Windows-reserved port range, so browser tests could not start on this host. | Installed Vitest Browser Mode API configuration; Windows port reservation query | Moved its local API to port 4174, separate from Playwright E2E. | `pnpm test:browser`: 5 files, 17 tests passed. | Resolved |
| Firebase sign-in, registration, recovery and profile forms | Inline field errors were visually present but not consistently described by invalid controls, weakening error recovery for assistive technology. | [WCAG 2.2 SC 3.3.1](https://www.w3.org/TR/WCAG22/#error-identification), [ARIA `aria-describedby`](https://www.w3.org/TR/wai-aria-1.2/#aria-describedby), [WAI form notifications](https://www.w3.org/WAI/tutorials/forms/notifications/) | Field error IDs are referenced by `aria-describedby`; the rule is recorded in `.agents/rules/forms.md`. | Firebase Emulator browser journey asserts invalid email relation; existing profile avatar test checks the same association pattern. | Resolved for these routes; Partial overall because MFA/phone and every form are not yet covered |
| Firebase sign-in, registration, recovery and email-link forms | In `@firebase-oss/ui-react` 7.1.0, action hooks converted non-`FirebaseUIError` failures to a generic message, hiding actionable Firebase error categories such as invalid credentials and network failures. | Installed package behavior; Firebase Auth [error handling](https://firebase.google.com/docs/auth/web/errors) | Forms call the corresponding `@firebase-oss/ui-core` operations, which preserve Firebase error classification and localized recovery messages while maintaining the UI pending lifecycle. | `CI` run [41150231413](https://github.com/ianmaciel7/exams-app/actions/runs/41150231413): Firebase Auth emulator E2E passed, including invalid credentials and password-reset failure assertions; TypeScript, English, and `verify:fast` passed locally. | Resolved for covered email flows; real Google OAuth popup behavior remains outside emulator coverage |
| `pnpm-workspace.yaml`, `pnpm-lock.yaml` | `pnpm audit` found moderate advisories affecting transitive `minimatch` and `glob`, causing the CI Security job to fail. | [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249), [GHSA-3g3m-2fjr-6pw4](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4); pnpm [dependency overrides](https://github.com/pnpm/pnpm.io/blob/main/docs/settings/dependency-resolution.md) | Added minimum patched overrides; the lockfile resolves `minimatch` 11.0.3 and `glob` 14.0.3. | Local `pnpm audit` passes with only the existing ignored low advisory; `verify:fast` passes. CI recheck pending. | Implemented; CI validation pending |
| Historical commit `0d9cef8`, `.agents/skills/firebase-ai-logic-basics/SKILL.md` (file deleted from the current tree) | Full-history Gitleaks found a UUID-shaped App Check debug token in an earlier public commit. The token value is not repeated here. If it is registered, it can be exchanged for valid App Check tokens. | Firebase [App Check debug provider](https://firebase.google.com/docs/app-check/cpp/debug-provider) says debug tokens must remain secret and compromised tokens should be deleted in Firebase Console. | No current-tree copy remains. The token's registration and project are unverified; history has not been rewritten and no Firebase Console change was made. | Local full-history `gitleaks git --redact --verbose` reproduces the finding. The ordinary CI checkout did not report it in earlier successful runs. | Pending owner action: identify the Firebase app, revoke the token if registered, then decide on coordinated public-history cleanup |
| `AGENTS.md`, `ARCHITECTURE.md`, `CODING_STANDARDS.md`, `TOOLING.md`, version guides | Operational docs described Next.js 16.4.2 while package and installed runtime were 16.4.3. | Installed package and `node_modules/next/dist/docs/` | Current operational references now agree on 16.4.3; historical ADR wording remains unchanged. | `pnpm verify:fast` and production build under E2E passed. | Resolved |
| Repository tool environment | Context7 refused lookups after monthly quota was reached; local Node was 22.19.0, below the package engine range `^22.22.1 \|\| ^24.5.0`. | Context7 result; `package.json` engines | Used exact installed Next.js docs plus directly consulted W3C, WHATWG, RFC Editor, Firebase and web.dev sources. No dependency/runtime upgrade was made. | Checks listed above ran with the available runtime. | Partial — repeat Context7 lookup and verification on a supported Node runtime |

This revision changes project code, docs and Playwright configuration; it does
not modify GitHub workflow definitions or Firebase authorization rules. Existing
CI remains the enforcement path. Chromium is the configured browser project;
Firefox/WebKit and manual screen-reader, keyboard-only and production OAuth
verification remain outstanding where they apply. The emulator's real-provider
limitations are documented in [TESTING.md](../../TESTING.md).

## Internationalization

| Standard | Status | Coverage |
| --- | --- | --- |
| [BCP 47 / RFC 5646](https://www.rfc-editor.org/rfc/rfc5646) | Automated | Server HTML `lang` per locale (`home.spec.ts`). |
| [ECMA-402](https://402.ecma-international.org/), [CLDR / UTS #35](https://www.unicode.org/reports/tr35/) | Partial | next-intl relies on `Intl`; no date or number formatting tests. |
| [Unicode](https://www.unicode.org/versions/latest/), [UAX #9 bidi](https://www.unicode.org/reports/tr9/), [W3C Internationalization](https://www.w3.org/International/) | Gap | No right-to-left locale or `dir` test. |

## Usability and design systems

| Standard | Status | Coverage |
| --- | --- | --- |
| [Apple HIG](https://developer.apple.com/design/human-interface-guidelines/), [Material Design 3](https://m3.material.io/) | Automated (touch) | 44px targets and no field zoom; see the [mobile rule](../../.agents/rules/mobile.md). |
| [shadcn/ui](https://ui.shadcn.com/) | Automated | Component convention guards in `TOOLING.md`. |
| [DTCG design tokens](https://www.designtokens.org/) | Gap | Tokens are CSS variables, not DTCG files. |
| [ISO 9241-110](https://www.iso.org/standard/75258.html), [ISO 9241-210](https://www.iso.org/standard/77520.html), [Nielsen heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/) | Manual | Heuristic review and user testing. |
| [Fluent 2](https://fluent2.microsoft.design/), [Carbon](https://carbondesignsystem.com/), [Primer](https://primer.style/), [Atlassian](https://atlassian.design/), [Spectrum 2](https://spectrum.adobe.com/), [GOV.UK](https://design-system.service.gov.uk/) | Reference | Design inspiration; not tested. |

## Web platform

| Standard | Status | Coverage |
| --- | --- | --- |
| [Responsive design](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Responsive_Design), [media queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_media_queries) | Automated | 320 to 1280px matrix, portrait and landscape, no horizontal scroll. |
| [Container queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries) | Automated | Vitest Browser Mode tests. |
| [Pointer Events](https://www.w3.org/TR/pointerevents3/), [UI Events](https://www.w3.org/TR/uievents/) | Automated | The mobile project matches `(pointer: coarse)`. |
| [Reduced motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion) | Automated | `mobile.spec.ts`. |
| [HTML Living Standard](https://html.spec.whatwg.org/) | Partial | `lang`, charset, one `h1`, landmarks (axe). |
| [CSS snapshot](https://www.w3.org/TR/css/), [CSS UI](https://www.w3.org/TR/css-ui-3/), [Baseline](https://web.dev/baseline) | Gap | No browser-compatibility lint. |
| [Web Platform Tests](https://web-platform-tests.org/) | Not applicable | Browser conformance suite. |

## Performance and installability

| Standard | Status | Coverage |
| --- | --- | --- |
| [Core Web Vitals](https://web.dev/articles/vitals) | Automated (partial) | CLS budget in `check:lighthouse`; LCP is reported, not gated. |
| [Web performance](https://web.dev/learn/performance), [Lighthouse](https://developer.chrome.com/docs/lighthouse/) | Automated | `check:lighthouse` mobile budgets and `size-limit` bundle budgets. |
| [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest) | Automated | `best-practices.spec.ts`. |
| [Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps), [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API) | Gap | Only the Firebase session worker exists; no offline support or 192/512px icons. |

## Security and privacy

| Standard | Status | Coverage |
| --- | --- | --- |
| [OWASP Cheat Sheets](https://cheatsheetseries.owasp.org/) | Automated (headers) | `best-practices.spec.ts` checks the `next.config.ts` headers. |
| [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP) | Automated | `src/proxy.ts` sets a per-request nonce policy with `'strict-dynamic'` ([ADR 0023](../adr/0023-enforce-a-nonce-based-content-security-policy.md)); `best-practices.spec.ts` checks the nonce on every script and no violations on public routes. `style-src-attr` still allows inline `style` attributes. |
| [OWASP ASVS](https://asvs.owasp.org/) | Partial | Semgrep, Gitleaks, zizmor, and `pnpm audit`; no level-by-level checklist. |
| [WebAuthn Level 3](https://www.w3.org/TR/webauthn-3/) | Gap | No passkeys. |
| [OWASP MASVS](https://mas.owasp.org/MASVS/) | Not applicable | Native mobile apps only. |
| [LGPD](https://www.gov.br/anpd/pt-br/centrais-de-conteudo/legislacao), [GDPR](https://eur-lex.europa.eu/eli/reg/2016/679/oj) | Gap | Needs a policy, consent, and retention review. |

## Search and product quality

| Standard | Status | Coverage |
| --- | --- | --- |
| [Google Search Essentials](https://developers.google.com/search/docs/essentials) | Automated | Lighthouse SEO budget and meta description test. |
| [Schema.org](https://schema.org/) | Gap | No structured data. |
| [ISO/IEC 25010](https://www.iso.org/standard/78176.html) | Indirect | The CI gates cover maintainability, security, and usability in part. |
| [axe-core](https://www.deque.com/axe/core-documentation/) | Automated | Desktop, mobile, light and dark, and authenticated routes. |

Update a row in the same change that adds or removes its check.
