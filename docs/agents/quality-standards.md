# Quality standards

<!-- cspell:words CLDR bidi DTCG ASVS MASVS LGPD -->

The project owner's agreed list of external standards for auditing the app.
Use it to choose which standard a change must satisfy and to find gaps. Status
says how the repository checks each one today: **automated** means a check fails
in CI and in the Firebase CD `browser-checks` job, **partial** means only part of
the standard is machine-checkable, and **gap** means nothing checks it yet.

## Accessibility

| Standard | Status | Coverage |
| --- | --- | --- |
| [WCAG 2.2](https://www.w3.org/TR/WCAG22/) | Automated (partial) | axe A/AA on desktop and mobile; reflow 1.4.10, text spacing 1.4.12, input purpose 1.3.5, and motion 2.3.3 have dedicated tests. Keyboard and screen-reader behavior stay manual. |
| [Target Size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum) | Automated | 24px on desktop (`check:responsiveness`, `responsive.spec.ts`), 44px on coarse pointers (`mobile.spec.ts`). |
| [WAI-ARIA 1.2](https://www.w3.org/TR/wai-aria-1.2/), [ARIA APG](https://www.w3.org/WAI/ARIA/apg/) | Partial | axe validates roles and attributes; Base UI provides the keyboard patterns, which are not tested one by one. |
| [WAI Forms Tutorial](https://www.w3.org/WAI/tutorials/forms/) | Partial | Labels (axe), autofill tokens, and 16px field text. |
| [WCAG2ICT](https://www.w3.org/WAI/standards-guidelines/wcag/non-web-ict/), [EN 301 549](https://www.etsi.org/technologies/human-factors-accessibility) | Indirect | EN 301 549 references WCAG AA for web content. |
| [Android accessibility](https://developer.android.com/guide/topics/ui/accessibility/apps) | Partial | 44px targets and Android device emulation. |

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
