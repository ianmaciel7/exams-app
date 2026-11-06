# Base UI principles and their guards

<!-- base-ui-version: 1.9.0 -->

Every principle of the official Base UI documentation maps to a guard here. `pnpm check:repo` runs
`scripts/checks/check-base-ui-principles.mjs`, which fails when a row has no guard, a referenced guard
does not exist, an ast-grep rule under `.ast-grep/rules/base-ui` is missing from this table, or the
installed `@base-ui/react` version differs from the version above. After an upgrade, read the release
notes, update the table, then bump the version marker.

Sources: [About](https://base-ui.com/react/overview/about),
[Accessibility](https://base-ui.com/react/overview/accessibility),
[Composition](https://base-ui.com/react/handbook/composition),
[Styling](https://base-ui.com/react/handbook/styling),
[Forms](https://base-ui.com/react/handbook/forms),
[Animation](https://base-ui.com/react/handbook/animation),
[Customization](https://base-ui.com/react/handbook/customization),
[TypeScript](https://base-ui.com/react/handbook/typescript),
[useRender](https://base-ui.com/react/utils/use-render),
[mergeProps](https://base-ui.com/react/utils/merge-props),
[CSPProvider](https://base-ui.com/react/utils/csp-provider),
[DirectionProvider](https://base-ui.com/react/utils/direction-provider),
[Toast](https://base-ui.com/react/components/toast).

Guard column: `rule:<id>` is an ast-grep rule, `check:<name>` is a script in `scripts/checks`,
`test:<path>` is a test file, and `manual:<reason>` is a documented review step with the reason it
cannot be automated.

| Principle                                                          | Guard                                                                    |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| Use the Base UI wrappers, not primitives                           | rule:no-base-ui-primitive-import                                         |
| No Radix primitives or `asChild`                                   | rule:no-radix-primitive-import, rule:no-as-child                         |
| No Radix state attributes or variables                             | rule:no-radix-state-selector                                             |
| Compose with `render`, not `cloneElement`                          | rule:no-clone-element                                                    |
| Owned components accept `render` through `useRender`               | rule:require-use-render-props                                            |
| A `render` function spreads the received props                     | rule:require-render-function-spread-props                                |
| Non-button `render` on a button part sets `nativeButton={false}`   | rule:require-native-button-false                                         |
| A trigger composes Button through `render`, never nests it         | rule:no-nested-button-in-trigger                                         |
| Links are real anchors, not Button with `render`                   | rule:no-button-render-link                                               |
| Buttons use the shared Button                                      | rule:no-raw-button-element                                               |
| Value controls use change callbacks, not `onClick`                 | rule:no-onclick-on-value-control                                         |
| Menu items fire `onClick`                                          | rule:menu-item-on-click                                                  |
| Disabled buttons stay focusable                                    | rule:require-focusable-when-disabled                                     |
| Form controls use Form, Field and labels                           | rule:no-raw-form-element, rule:no-manual-label-wiring                    |
| Invalid fields expose `data-invalid`                               | rule:require-field-data-invalid                                          |
| Error toasts use `priority: "high"`                                | rule:require-toast-error-priority                                        |
| State styling uses `data-*` attributes                             | rule:no-radix-state-selector                                             |
| Keyboard navigation and focus follow WAI-ARIA                      | test:tests/a11y.spec.ts                                                  |
| `initialFocus` and `finalFocus` return focus to a sensible element | manual:focus return depends on the surrounding page, review per dialog   |
| Popups animate with `data-starting-style` and `data-ending-style`  | manual:animation intent is not visible to static analysis                |
| `eventDetails.cancel()` and `reason` branches are intentional      | manual:handler intent is not visible to static analysis                  |
| CSP nonce reaches Base UI through `CSPProvider`                    | test:src/lib/csp.test.ts                                                 |
| Text direction reaches portals through `DirectionProvider`         | manual:no test yet, DirectionProvider is mounted once in the root layout |
