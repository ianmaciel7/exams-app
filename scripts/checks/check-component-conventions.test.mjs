import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  inspectComponent,
  inspectComponentPlacement,
  inspectComponentRuntime,
  inspectDataModuleConventions,
  inspectHookFilename,
  inspectLibPlacement,
  inspectNaming,
  inspectUiPhaseStatus,
  isOwnedComponent,
  isOwnedHookModule,
} from "./check-component-conventions.mjs";

const profile = "src/app/(protected)/profile/_components/profile-card.tsx";
const inspect = (content, file = profile) =>
  inspectComponent(content, file).map((issue) => issue.message);

function compoundForm(source) {
  return source.replace(
    "export { ProfileForm };",
    "function ProfileFormContent() { return <FieldGroup>{children}</FieldGroup>; } function ProfileFormFooter() { return <div>{children}</div>; } export { ProfileForm, ProfileFormContent, ProfileFormFooter };",
  );
}

function expectValid(content, file) {
  assert.deepEqual(inspect(content, file), []);
}

function expectInvalid(content, pattern, file) {
  assert.match(inspect(content, file).join(" "), pattern);
}

const compoundParts = [
  "function ProfileCardAction(props) { return <CardAction {...props} />; }",
  "function ProfileCardHeader(props) { return <CardHeader {...props} />; }",
  "function ProfileCardTitle(props) { return <CardTitle {...props} />; }",
  "function ProfileCardDescription(props) { return <CardDescription {...props} />; }",
  "function ProfileCardContent(props) { return <CardContent {...props} />; }",
  "function ProfileCardFooter(props) { return <CardFooter {...props} />; }",
].join(" ");

function compoundCard(source) {
  return source.replace(
    "export { ProfileCard };",
    `${compoundParts} export { ProfileCard, ProfileCardAction, ProfileCardHeader, ProfileCardTitle, ProfileCardDescription, ProfileCardContent, ProfileCardFooter };`,
  );
}

describe("owned hook filename/export parity", () => {
  const guard = "src/app/(protected)/_hooks/use-protected-guard.ts";
  const matching = "src/app/(protected)/_hooks/use-protected-guard-client.ts";
  const messages = (code, file = guard) =>
    inspectHookFilename(code, file)
      .map((item) => item.message)
      .join(" ");

  it("reproduces the original false negative: useProtectedGuardClient in use-protected-guard.ts", () => {
    assert.match(
      messages("export function useProtectedGuardClient() {}"),
      /does not match filename "use-protected-guard.ts"/,
    );
    assert.match(
      messages("export function useProtectedGuardClient() {}"),
      /must export "useProtectedGuard"/,
    );
  });

  it("accepts direct exports and local named exports with exact hook filenames", () => {
    assert.equal(
      messages("export function useProtectedGuardClient() {}", matching),
      "",
    );
    assert.equal(
      messages(
        "const useProtectedGuardClient = () => {}; export { useProtectedGuardClient };",
        matching,
      ),
      "",
    );
    assert.equal(
      messages("export const useProtectedGuardClient = () => {};", matching),
      "",
    );
    assert.equal(
      messages(
        "export const ProfileSessionContext = {}; export function useProfileSessionContext() {}",
        "src/app/(protected)/profile/_hooks/use-profile-session-context.ts",
      ),
      "",
    );
  });

  it("rejects wrong suffixes, missing hooks, multiple hooks, aliases, and re-exports", () => {
    for (const code of [
      "export function useProtectedGuardClient() {}",
      "export function useProtectedGuard() {} export function useOther() {}",
      "export const someValue = true;",
      "export { useProtectedGuardClient } from './other';",
      "function useProtectedGuardClient() {} export { useProtectedGuardClient as useProtectedGuard };",
    ]) {
      const result = messages(code);
      assert.ok(result, code);
    }
    assert.match(
      messages("export { useProtectedGuard } from './other';"),
      /re-exports are not allowed/,
    );
    assert.match(
      messages(
        "export function useProtectedGuard() {} export function useOther() {}",
      ),
      /does not match filename/,
    );
  });

  it("scopes the rule to owned private hooks, not vendor files or shadcn use-mobile", () => {
    assert.equal(isOwnedHookModule(guard), true);
    for (const path of [
      "src/hooks/use-mobile.ts",
      "src/app/_hooks/use-account.test.ts",
      "src/components/firebase/use-auth.ts",
      "src/app/(protected)/profile/_components/profile-card.tsx",
    ]) {
      assert.equal(isOwnedHookModule(path), false);
      assert.deepEqual(
        inspectHookFilename("export function useWrong() {}", path),
        [],
      );
    }
    assert.match(
      messages(
        "export function useAccount() {}",
        "src/app/_hooks/legacy-name.ts",
      ),
      /use-<semantic-name>/,
    );
  });
});

describe("presentation hooks in owned fields", () => {
  it("allows native form, translation and id hooks without a redundant wrapper", () => {
    const file =
      "src/app/(protected)/profile/_components/profile-email-field.tsx";
    const source = `"use client"; 
      import { useId } from "react";
      import { useTranslations } from "next-intl";
      import { useFormContext } from "react-hook-form";
      function ProfileEmailField(props) {
        const id = useId();
        const t = useTranslations("Auth");
        const { control } = useFormContext();
        return <Field {...props} data-testid={id}>{t("emailLabel")}</Field>;
      }
      export { ProfileEmailField };`;
    assert.deepEqual(
      inspectComponent(source, file).map((finding) => finding.message),
      [],
    );
  });

  it("continues rejecting mismatched application orchestration hooks", () => {
    expectInvalid(
      '"use client"; import { useWrong } from "../_hooks/use-wrong"; import { useId } from "react"; function AccountCard(props) { useId(); useWrong(); return <div {...props} />; } export { AccountCard };',
      /must delegate hook coordination to useAccountCard/,
      "src/app/_components/account-card.tsx",
    );
  });
});

describe("owned component conventions", () => {
  it("rejects component aliases and re-exports even with a matching local root", () => {
    const root = "function AccountCard() { return <div />; }";
    const file = "src/components/account-card.tsx";
    for (const exports of [
      "function OtherHeader() { return <div />; } export { AccountCard, OtherHeader as AccountCardHeader };",
      "function header() { return <div />; } export { AccountCard, header as AccountCardHeader };",
      "export { AccountCard }; export { OtherHeader as AccountCardHeader } from './other';",
      "export { AccountCard }; export { AccountCardHeader } from './other';",
      "export { AccountCard as accountCard };",
    ]) {
      expectInvalid(
        `${root} ${exports}`,
        /keep their local declaration name/,
        file,
      );
    }
  });

  it("accepts matching family names and type-only export aliases", () => {
    expectValid(
      "function AccountCard() { return <div />; } function AccountCardHeader() { return <div />; } export { AccountCard, AccountCardHeader }; export type { OtherProps as AccountCardProps } from './types'; export { type OtherHeader as AccountCardExtra } from './types';",
      "src/components/account-card.tsx",
    );
  });

  it("selects private components and project-owned extensions", () => {
    assert.equal(isOwnedComponent(profile), true);
    assert.equal(
      isOwnedComponent("src/app/_components/home-section-client.tsx"),
      true,
    );
    assert.equal(
      isOwnedComponent("src/components/ui/extensions/theme-provider.tsx"),
      true,
    );
  });

  it("excludes framework entrypoints, tests and generated registries", () => {
    assert.equal(isOwnedComponent("src/app/page.tsx"), false);
    assert.equal(isOwnedComponent("src/app/_components/card.test.tsx"), false);
    assert.equal(isOwnedComponent("src/components/ui/button.tsx"), false);
    assert.equal(
      isOwnedComponent("src/components/firebase/sign-in-auth-screen.tsx"),
      false,
    );
    assert.equal(
      isOwnedComponent("src/components/ai-elements/message.tsx"),
      false,
    );
  });

  it("allows semantic roles, matching exports and Server Components", () => {
    expectValid(
      compoundCard(
        '"use client"; type ProfileCardProps = ComponentProps<"div">; function ProfileCard(props: ProfileCardProps) { return <Card {...props} />; } export { ProfileCard };',
      ),
    );
    expectValid(
      "async function IntlProvider({ children }) { return <Provider>{children}</Provider>; } export { IntlProvider };",
      "src/components/ui/extensions/intl-provider.tsx",
    );
  });

  it("requires exact component names, including client and server suffixes", () => {
    const client = "src/app/_components/account-client.tsx";
    const server = "src/app/_components/account-server.tsx";
    expectInvalid(
      '"use client"; function Account(props) { return <div {...props} />; } export { Account };',
      /missing term/,
      client,
    );
    expectValid(
      '"use client"; function AccountClient(props) { return <div {...props} />; } export { AccountClient };',
      client,
    );
    expectInvalid(
      'import "server-only"; function Account(props) { return <div {...props} />; } export { Account };',
      /missing term/,
      server,
    );
    expectValid(
      'import "server-only"; function AccountServer(props) { return <div {...props} />; } export { AccountServer };',
      server,
    );
    expectInvalid(
      "function ProfileForm(props) { return <form {...props} />; } export { ProfileForm };",
      /ProfileFormClient/,
      "src/app/(protected)/profile/_components/profile-form-client.tsx",
    );
    expectInvalid(
      "function ProfileSection(props) { return <div {...props} />; } export { ProfileSection };",
      /ProfileSectionClient/,
      "src/app/(protected)/profile/_components/profile-section-client.tsx",
    );
  });

  it("rejects mismatched names and default exports", () => {
    expectInvalid(
      "function ProfilePanel() { return <Card />; } export { ProfilePanel };",
      /ProfileCard/,
    );
    expectInvalid(
      "export default function ProfileCard() { return <Card />; }",
      /named/,
    );
  });

  it("rejects incorrect props types and filename casing", () => {
    expectInvalid(
      'type WrongProps = ComponentProps<"div">; function ProfileCard() { return <Card />; } export { ProfileCard };',
      /ProfileCardProps/,
    );
    expectInvalid(
      "function ProfileCard() { return <Card />; } export { ProfileCard };",
      /kebab-case/,
      "src/app/_components/ProfileCard.tsx",
    );
    expectInvalid(
      "function AccountPresentation() { return <div />; } export { AccountPresentation };",
      /Name by semantic role, never by Component\/UI\/Presentation/,
      "src/app/_components/account-presentation.tsx",
    );
    expectInvalid(
      "function AccountScreen() { return <div />; } export { AccountScreen };",
      /must not end with a screen or page term/,
      "src/app/_components/account-screen.tsx",
    );
    expectInvalid(
      "function AccountView() { return <div />; } export { AccountView };",
      /must not end with a screen or page term/,
      "src/app/_components/account-view.tsx",
    );
    expectInvalid(
      "function UserPage() { return <div />; } export { UserPage };",
      /must not end with a screen or page term/,
      "src/app/_components/user-page.tsx",
    );
    expectInvalid(
      "function CheckoutPresentation() { return <div />; } export { CheckoutPresentation };",
      /Name by semantic role, never by Component\/UI\/Presentation/,
      "src/app/_components/checkout-presentation-client.tsx",
    );
    expectInvalid(
      '"use client"; function CheckoutPage() { return <div />; } export { CheckoutPage };',
      /must not end with a screen or page term/,
      "src/app/_components/checkout-page-client.tsx",
    );
    expectInvalid(
      'import "server-only"; function CheckoutPage() { return <div />; } export { CheckoutPage };',
      /must not end with a screen or page term/,
      "src/app/_components/checkout-page-server.tsx",
    );
  });

  it("permits client interaction but rejects server-only imports", () => {
    expectValid(
      compoundCard(
        '"use client"; import { useProfileCard } from "../_hooks/use-profile-card"; function ProfileCard() { const { open } = useProfileCard(); return <Card {...props} />; } export { ProfileCard };',
      ),
    );
    expectInvalid(
      '"use client"; import { cookies } from "next/headers"; function ProfileCard() { return <Card />; } export { ProfileCard };',
      /server-only/,
    );
    expectInvalid(
      '"use client"; import "server-only"; function ProfileCard() { return <Card />; } export { ProfileCard };',
      /server-only/,
    );
  });

  it("requires focused hooks for session decisions, effects and async workflows", () => {
    const path = "src/app/_components/session-panel.tsx";
    const component = (body) =>
      `function SessionPanel() { ${body} return <div />; } export { SessionPanel };`;
    for (const condition of [
      "!profile.authReady || (user && !profile.preferencesReady)",
      "!user && !profile.error",
      "!user || !profile.defaultValues",
    ]) {
      expectInvalid(
        component(`if (${condition}) return null;`),
        /custom hook/,
        path,
      );
    }
    expectInvalid(
      component('const message = profile.error ?? t("profileSaveError");'),
      /custom hook/,
      path,
    );
    expectInvalid(
      component(
        'return <div key={"userId" in status ? status.userId : undefined} />;',
      ),
      /custom hook/,
      path,
    );
    expectInvalid(
      component("return <div key={status ? status.userId : undefined} />;"),
      /custom hook/,
      path,
    );
    expectInvalid(
      component('if ("userId" in status) return <div />; return null;'),
      /custom hook/,
      path,
    );
    expectInvalid(
      component(
        "const loading = !profile.authReady || !profile.preferencesReady;",
      ),
      /custom hook/,
      path,
    );
    expectInvalid(
      'import { useEffect as effect } from "react"; ' +
        component("effect(() => {});"),
      /custom hook/,
      path,
    );
    expectInvalid(
      `import React from "react"; ${component("React.useState(false);")}`,
      /custom hook/,
      path,
    );
    expectInvalid(
      `import { signOut } from "firebase/auth"; ${component("")}`,
      /custom hook/,
      path,
    );
    expectInvalid(
      component("async function handleSubmit() { await save(); }"),
      /custom hook/,
      path,
    );
    expectValid(
      'import { useSessionPanel } from "../_hooks/use-session-panel"; ' +
        component(
          'const { status, message } = useSessionPanel(); if (status === "loading") return <Loading />; if (status === "error") return <p>{message}</p>;',
        ),
      path,
    );
    expectValid(
      "function SessionPanel({ children, disabled }) { return <Button disabled={disabled || pending}>{children ?? label}</Button>; } export { SessionPanel };",
      path,
    );
  });

  it("requires the component-named orchestration hook, including aliased calls", () => {
    const path = "src/app/_components/session-panel.tsx";
    const render = (imports, calls) =>
      `${imports} function SessionPanel() { ${calls} return <div />; } export { SessionPanel };`;
    expectInvalid(
      render(
        'import { useSession, useSessionView } from "../_hooks/session";',
        "const session = useSession(); const view = useSessionView(session);",
      ),
      /useSessionPanel/,
      path,
    );
    expectInvalid(
      render(
        'import { useSession } from "../_hooks/session";',
        "useSession();",
      ),
      /useSessionPanel/,
      path,
    );
    expectInvalid(
      render(
        'import { useSession as readSession } from "../_hooks/session";',
        "readSession();",
      ),
      /useSessionPanel/,
      path,
    );
    expectValid(
      render(
        'import { useSessionPanel } from "../_hooks/use-session-panel"; import { useTranslations } from "next-intl";',
        'useSessionPanel(); useTranslations("Auth");',
      ),
      path,
    );
    expectInvalid(
      render("", "useSessionPanel();"),
      /separate hook module/,
      path,
    );
    expectValid(
      render(
        'import { useSessionPanel as usePanel } from "../_hooks/use-session-panel";',
        "usePanel();",
      ),
      path,
    );
    expectValid(
      render(
        'import { useTranslations } from "next-intl";',
        "type BrowserStore = typeof window.localStorage;",
        'const t = useTranslations("Auth");',
      ),
      path,
    );
  });

  it("bans View and Screen naming in owned components, hooks and aliases", () => {
    const component = "src/app/_components/account-section.tsx";
    const hook = "src/app/_hooks/use-account-status.ts";
    for (const [file, code] of [
      [component, "function AccountView() {}"],
      [component, "function AccountScreen() {}"],
      [component, "function AccountPresentation() {}"],
      [hook, "export function useAccountView() {}"],
      [hook, "const screen = getState();"],
      [hook, "const { view } = useAccount();"],
      [component, 'import { Screen } from "external";'],
      ["src/app/_hooks/use-account-screen.ts", "export const status = 1;"],
    ])
      assert.ok(inspectNaming(code, file).length, code);
    assert.deepEqual(
      inspectNaming(
        'import { AccountScreen as AccountContent } from "external"; function AccountSection() {}',
        component,
      ),
      [],
    );
    assert.deepEqual(
      inspectNaming(
        'import type { Viewport } from "next"; const preview = true;',
        hook,
      ),
      [],
    );
    assert.deepEqual(
      inspectNaming(
        "function AccountScreen() {}",
        "src/components/firebase/account-screen.tsx",
      ),
      [],
    );
    assert.deepEqual(
      inspectNaming(
        "const screen = getScreen();",
        "src/app/_hooks/account.test.ts",
      ),
      [],
    );
  });

  it("rejects banned words in exported aliases and named expressions", () => {
    const file = "src/lib/account.ts";
    for (const code of [
      "export { AccountContent as AccountScreen };",
      'export { AccountContent as AccountView } from "external";',
      'export * as AccountView from "external";',
      "const AccountContent = function AccountScreen() {};",
      "const AccountContent = class AccountView {};",
      "enum AccountScreen { Ready }",
      "type AccountState<Screen> = Screen;",
      "const AccountScreen2 = true;",
      "const view2 = true;",
    ]) {
      const findings = inspectNaming(code, file);
      assert.ok(findings.length, code);
      assert.match(findings[0].message, /Do not use View or Screen/);
      assert.equal(findings[0].line, 1);
      assert.ok(findings[0].column > 0);
    }
    assert.ok(
      inspectNaming("export const status = true;", "src/lib/account-view2.ts")
        .length,
    );
  });

  it("allows external names aliased to semantic names and unrelated words", () => {
    for (const code of [
      'export { AccountScreen as AccountContent } from "external";',
      'import { AccountView as AccountContent } from "external";',
      "const preview2 = true; const viewport = true;",
      'const label = "Screen View"; // Screen and View in prose are allowed.',
    ]) {
      assert.deepEqual(inspectNaming(code, "src/lib/account.ts"), [], code);
    }
  });

  it("rejects inline exported component declarations", () => {
    expectInvalid(
      "export function ProfileCard() { return <Card />; }",
      /locally/,
    );
  });

  it("rejects arrow-function components and imported re-exports", () => {
    expectInvalid(
      "const ProfileCard = () => <Card />; export { ProfileCard };",
      /local named function/,
    );
    expectInvalid(
      'export { ProfileCard } from "./other-component";',
      /local named function/,
    );
  });
  it("matches a field component to its React Hook Form field name", () => {
    expectValid(
      'function ProfileDisplayNameField() { return <Controller name="displayName" control={control} render={() => <Field />} />; } export { ProfileDisplayNameField };',
      "src/app/(protected)/profile/_components/profile-display-name-field.tsx",
    );
    expectValid(
      "function ProfileAvatarField() { return <Avatar />; } export { ProfileAvatarField };",
      "src/app/(protected)/profile/_components/profile-avatar-field.tsx",
    );
    expectInvalid(
      'function ProfileNameField() { return <Controller name="displayName" control={control} render={() => <Field />} />; } export { ProfileNameField };',
      /must match Controller name/,
      "src/app/(protected)/profile/_components/profile-name-field.tsx",
    );
    expectInvalid(
      'function ProfileDisplayNameField() { return <Controller name="email" control={control} render={() => <Field />} />; } export { ProfileDisplayNameField };',
      /must match Controller name/,
      "src/app/(protected)/profile/_components/profile-display-name-field.tsx",
    );
  });

  it("rejects passing the complete profile controller to a child", () => {
    expectInvalid(
      "function ProfileCard() { return <ProfileFormClient profile={profile} />; } export { ProfileCard };",
      /focused field\/form\/button props/,
    );
    expectInvalid(
      "function ProfileCard() { return <ProfileSignOutButton profile={profile} />; } export { ProfileCard };",
      /focused field\/form\/button props/,
    );
    expectValid(
      compoundCard(
        "function ProfileCard() { return <Card {...props} />; } export { ProfileCard };",
      ),
    );
  });

  it("enforces fixed submit and sign-out button types after prop spreads", () => {
    const submit =
      "src/app/(protected)/profile/_components/profile-save-button.tsx";
    const signOut =
      "src/app/(protected)/profile/_components/profile-sign-out-button.tsx";
    expectValid(
      'function ProfileSaveButton() { return <Button {...props} type="submit" disabled={disabled} />; } export { ProfileSaveButton };',
      submit,
    );
    expectInvalid(
      'function ProfileSaveButton() { return <Button type="submit" disabled={disabled} {...props} />; } export { ProfileSaveButton };',
      /enforce type="submit"/,
      submit,
    );
    expectValid(
      'function ProfileSignOutButton() { return <Button {...props} type="button" disabled={disabled} />; } export { ProfileSignOutButton };',
      signOut,
    );
    expectInvalid(
      'function ProfileSignOutButton() { return <Button type="button" disabled={disabled} {...props} />; } export { ProfileSignOutButton };',
      /enforce type="button"/,
      signOut,
    );
    expectInvalid(
      'function ProfileSignOutButton() { return <Button {...props} type="submit" disabled={disabled} />; } export { ProfileSignOutButton };',
      /enforce type="button"/,
      signOut,
    );
  });

  it("keeps ProfileCard a native, composable Card wrapper", () => {
    expectValid(
      compoundCard(
        "function ProfileCard(props) { return <Card {...props} />; } export { ProfileCard };",
      ),
    );
    expectInvalid(
      "function ProfileCard() { return <ProfileForm><Card /></ProfileForm>; } export { ProfileCard };",
      /one native Card as its root/,
    );
    expectInvalid(
      "function ProfileCard() { return <Card><ProfileForm /></Card>; } export { ProfileCard };",
      /accept children/,
    );
  });

  it("keeps ProfileCard compound parts inside ProfileSection", () => {
    const section =
      "src/app/(protected)/profile/_components/profile-section.tsx";
    expectValid(
      "function ProfileSection() { return <ProfileCard><ProfileForm><ProfileCardHeader><ProfileCardTitle /><ProfileCardDescription /></ProfileCardHeader><ProfileCardContent><FieldGroup><ProfileDisplayNameField /></FieldGroup></ProfileCardContent><ProfileCardFooter><ProfileSaveButton /><ProfileSignOutButton /></ProfileCardFooter></ProfileForm></ProfileCard>; } export { ProfileSection };",
      section,
    );
    expectInvalid(
      'function ProfileSection() { return <ProfileCard><ProfileForm><ProfileCardHeader><ProfileCardTitle /><ProfileCardDescription /></ProfileCardHeader><ProfileCardContent><ProfileDisplayNameField /></ProfileCardContent><ProfileCardFooter><ProfileSaveButton type="submit" /><ProfileSignOutButton /></ProfileCardFooter></ProfileForm></ProfileCard>; } export { ProfileSection };',
      /ProfileSaveButton must not accept an override/,
      section,
    );
    expectInvalid(
      "function ProfileSection() { return <ProfileCard><ProfileForm><ProfileCardHeader><ProfileCardTitle /><ProfileCardDescription /></ProfileCardHeader><ProfileCardContent><ProfileDisplayNameField /></ProfileCardContent><form /><ProfileCardFooter><ProfileSaveButton /><ProfileSignOutButton /></ProfileCardFooter></ProfileForm></ProfileCard>; } export { ProfileSection };",
      /delegate native Card and form roots/,
      section,
    );
    expectInvalid(
      "function ProfileSection() { return <ProfileForm><ProfileCard><ProfileCardHeader><ProfileCardTitle /><ProfileCardDescription /></ProfileCardHeader><ProfileCardContent><ProfileDisplayNameField /></ProfileCardContent><ProfileCardFooter><ProfileSaveButton /><ProfileSignOutButton /></ProfileCardFooter></ProfileCard></ProfileForm>; } export { ProfileSection };",
      /ProfileFormClient must be inside ProfileCard/,
      section,
    );
    expectInvalid(
      "function ProfileSection() { return <ProfileCard><ProfileForm><ProfileCardHeader><ProfileCardTitle /><ProfileCardDescription /></ProfileCardHeader><ProfileCardContent><ProfileDisplayNameField /></ProfileCardContent><ProfileSaveButton /><ProfileCardFooter><ProfileSignOutButton /></ProfileCardFooter></ProfileForm></ProfileCard>; } export { ProfileSection };",
      /ProfileSaveButton must be inside ProfileCardFooter/,
      section,
    );
    expectInvalid(
      "function ProfileSection() { return <ProfileCard><ProfileForm><ProfileCardHeader><ProfileCardTitle /><ProfileCardDescription /></ProfileCardHeader><ProfileDisplayNameField /><ProfileCardFooter><ProfileSaveButton /><ProfileSignOutButton /></ProfileCardFooter></ProfileForm></ProfileCard>; } export { ProfileSection };",
      /ProfileDisplayNameField must be inside/,
      section,
    );
  });

  it("rejects wrappers between profile regions and their direct parents", () => {
    const path = "src/app/(protected)/profile/_components/profile-section.tsx";
    const valid =
      "function ProfileSection() { return <ProfileCard><ProfileForm><ProfileCardHeader><ProfileCardTitle /><ProfileCardDescription /></ProfileCardHeader><ProfileCardContent><FieldGroup><ProfileDisplayNameField /></FieldGroup></ProfileCardContent><ProfileCardFooter><ProfileSaveButton /><ProfileSignOutButton /></ProfileCardFooter></ProfileForm></ProfileCard>; } export { ProfileSection };";
    expectValid(valid, path);
    const regions = [
      "<ProfileCardHeader><ProfileCardTitle /><ProfileCardDescription /></ProfileCardHeader>",
      "<ProfileCardContent><FieldGroup><ProfileDisplayNameField /></FieldGroup></ProfileCardContent>",
      "<FieldGroup><ProfileDisplayNameField /></FieldGroup>",
      "<ProfileCardFooter><ProfileSaveButton /><ProfileSignOutButton /></ProfileCardFooter>",
      "<ProfileCardTitle />",
      "<ProfileCardDescription />",
      "<ProfileDisplayNameField />",
      "<ProfileSaveButton />",
      "<ProfileSignOutButton />",
    ];
    for (const region of regions) {
      expectInvalid(
        valid.replace(region, `<div>${region}</div>`),
        /must be inside/,
        path,
      );
    }
  });

  it("keeps the compound Card parts declared and exported together", () => {
    const valid = compoundCard(
      "function ProfileCard(props) { return <Card {...props} />; } export { ProfileCard };",
    );
    expectValid(valid);
    for (const primitive of [
      "CardHeader",
      "CardTitle",
      "CardDescription",
      "CardContent",
      "CardFooter",
    ]) {
      expectInvalid(
        valid.replace(`<${primitive} {...props} />`, "<div />"),
        /must wrap exactly one/,
      );
    }
    expectInvalid(
      valid.replace(
        "ProfileCardDescription, ProfileCardContent, ProfileCardFooter };",
        "ProfileCardContent };",
      ),
      /Export exactly the named components/,
    );
    expectInvalid(
      valid.replace(
        "function ProfileCardTitle(props)",
        "function OtherTitle(props)",
      ),
      /Declare ProfileCardTitle/,
    );
  });

  it("keeps ProfileFormFooter a layout component without nested CardFooter", () => {
    const footer =
      "src/app/(protected)/profile/_components/profile-form-footer.tsx";
    expectValid(
      'function ProfileFormFooter() { return <div className="flex">{children}</div>; } export { ProfileFormFooter };',
      footer,
    );
    expectInvalid(
      "function ProfileFormFooter() { return <CardFooter>{children}</CardFooter>; } export { ProfileFormFooter };",
      /layout div inside ProfileCardFooter/,
      footer,
    );
  });

  it("keeps FieldGroup in ProfileFormContent rather than ProfileForm", () => {
    const form = "src/app/(protected)/profile/_components/profile-form.tsx";
    const content =
      "src/app/(protected)/profile/_components/profile-form-content.tsx";
    expectValid(
      compoundForm(
        "function ProfileForm() { return <FormProvider><form>{children}</form></FormProvider>; } export { ProfileForm };",
      ),
      form,
    );
    expectInvalid(
      "function ProfileForm() { return <FormProvider><form><FieldGroup /></form></FormProvider>; } export { ProfileForm };",
      /delegate fields and actions/,
      form,
    );
    expectValid(
      "function ProfileFormContent() { return <FieldGroup>{children}</FieldGroup>; } export { ProfileFormContent };",
      content,
    );
    expectInvalid(
      "function ProfileFormContent() { return <CardContent><FieldGroup /></CardContent>; } export { ProfileFormContent };",
      /render exactly one FieldGroup without CardContent/,
      content,
    );
  });
  it("validates colocated form parts without accepting nested card primitives", () => {
    const path = "src/app/(protected)/profile/_components/profile-form.tsx";
    const valid = compoundForm(
      "function ProfileForm() { return <FormProvider><form>{children}</form></FormProvider>; } export { ProfileForm };",
    );
    expectValid(valid, path);
    expectInvalid(
      valid.replace(
        "<FieldGroup>{children}</FieldGroup>",
        "<CardContent><FieldGroup>{children}</FieldGroup></CardContent>",
      ),
      /without CardContent/,
      path,
    );
    expectInvalid(
      valid.replace(
        "ProfileForm, ProfileFormContent, ProfileFormFooter",
        "ProfileForm, ProfileFormContent",
      ),
      /Export exactly/,
      path,
    );
  });

  it("forbids a second Card inside ProfileForm", () => {
    const path = "src/app/(protected)/profile/_components/profile-form.tsx";
    expectInvalid(
      "function ProfileForm() { return <FormProvider><form><Card>{children}</Card></form></FormProvider>; } export { ProfileForm };",
      /delegate the Card root to ProfileCard/,
      path,
    );
  });
});

describe("component placement", () => {
  it("rejects standalone and nested shared application files, including Windows paths", () => {
    for (const file of [
      "src/components/loading/loading-indicator.tsx",
      "src/components/loading-indicator.tsx",
      "src/components/loading/loading.test.tsx",
      "src/components/loading/index.ts",
      "src/components/loading/indicator.jsx",
      "src\\components\\loading\\loading-indicator.tsx",
    ]) {
      assert.match(
        inspectComponentPlacement(file)[0]?.message ?? "",
        /ui\/extensions/,
      );
    }
  });

  it("allows extensions, route-private files and existing registry trees", () => {
    for (const file of [
      "src/components/ui/extensions/labeled-spinner.tsx",
      "src/components/ui/extensions/loading.test.tsx",
      "src/app/_components/route-loading.tsx",
      "src/app/(protected)/profile/_components/profile-section.tsx",
      "src/components/ui/spinner.tsx",
      "src/components/firebase/oauth-button.tsx",
      "src/components/ai-elements/message.tsx",
      "src/hooks/use-loading.ts",
    ])
      assert.deepEqual(inspectComponentPlacement(file), []);
  });
});

describe("component integration naming", () => {
  const file = (stem) => `src/components/ui/extensions/${stem}.tsx`;
  const messages = (content, stem, modules) =>
    inspectComponentRuntime(content, file(stem), modules)
      .map((issue) => issue.message)
      .join(" ");

  it("allows presentation with use client, state, form context, and local hooks without suffixes", () => {
    for (const content of [
      '"use client"; import { useState } from "react";',
      '"use client"; import { Controller } from "react-hook-form";',
      '"use client"; import { useField } from "./use-field";',
      'import { useTranslations } from "next-intl";',
      'import type { User } from "firebase/auth";',
      'import type { Controller } from "react-hook-form";',
    ])
      assert.equal(messages(content, "account"), "");
    assert.match(
      messages('"use client"; function Account() {}', "account-client"),
      /Presentation components must not/,
    );
  });

  it("requires client integration naming and a client boundary", () => {
    for (const content of [
      '"use client"; import { signOut } from "firebase/auth";',
      '"use client"; import { ThemeProvider } from "next-themes";',
      '"use client"; import { useRouter as useNavigation } from "next/navigation";',
      '"use client"; localStorage.getItem("theme");',
      '"use client"; globalThis.localStorage.getItem("theme");',
      '"use client"; URL.createObjectURL(file);',
      '"use client"; fetch("https://example.com");',
    ]) {
      assert.match(messages(content, "account"), /-client.tsx/);
      assert.equal(messages(content, "account-client"), "");
    }
    assert.match(
      messages('import { signOut } from "firebase/auth";', "account-client"),
      /declare "use client"/,
    );
    assert.equal(
      messages('import { redirect } from "next/navigation";', "account"),
      "",
    );
  });

  it("recognizes browser navigation hooks, including aliases of useParams", () => {
    for (const hook of [
      "useRouter",
      "useParams",
      "usePathname",
      "useSearchParams",
      "useSelectedLayoutSegment",
      "useSelectedLayoutSegments",
    ]) {
      const content = `"use client"; import { ${hook} as useRoute } from "next/navigation";`;
      assert.match(messages(content, "account"), /-client.tsx/);
      assert.equal(messages(content, "account-client"), "");
    }
    assert.equal(
      messages('import type { useParams } from "next/navigation";', "account"),
      "",
    );
    assert.equal(messages('import type { Stats } from "fs";', "account"), "");
  });

  it("requires server integration naming and server-only protection", () => {
    for (const content of [
      'import { getLocale } from "next-intl/server";',
      'import { readFile } from "node:fs";',
      'import { readFile } from "fs";',
      'import { readFile } from "fs/promises";',
      'import { test } from "node:test";',
      'fetch("https://example.com");',
    ]) {
      assert.match(messages(content, "account"), /-server.tsx/);
      assert.equal(
        messages(`import "server-only";${content}`, "account-server"),
        "",
      );
    }
    assert.match(
      messages("function Account() {}", "account-server"),
      /import "server-only"/,
    );
    assert.match(
      messages('"use client"; import "server-only";', "account-server"),
      /cannot declare/,
    );
  });

  it("follows hook implementations and ignores type imports and component children", () => {
    const modules = new Map([
      [
        "src/components/ui/extensions/use-account.ts",
        'import { load } from "@/lib/account"; export function useAccount() { return load(); }',
      ],
      [
        "src/lib/account.ts",
        'import { onAuthStateChanged } from "firebase/auth";',
      ],
      [
        "src/components/ui/extensions/pure-hook.ts",
        'import type { User } from "firebase/auth";',
      ],
      [
        "src/components/ui/extensions/details-client.tsx",
        '"use client"; localStorage.getItem("x");',
      ],
    ]);
    assert.match(
      messages(
        '"use client"; import { useAccount } from "./use-account";',
        "account",
        modules,
      ),
      /-client.tsx/,
    );
    assert.equal(
      messages(
        '"use client"; import { useAccount } from "./use-account";',
        "account-client",
        modules,
      ),
      "",
    );
    modules.set(
      "src/components/ui/extensions/use-lazy-account.ts",
      'export async function load() { const { load } = await import("@/lib/account"); return load(); }',
    );
    assert.match(
      messages(
        '"use client"; import { load } from "./use-lazy-account";',
        "account",
        modules,
      ),
      /-client.tsx/,
    );
    assert.equal(
      messages(
        '"use client"; import { pure } from "./pure-hook";',
        "account",
        modules,
      ),
      "",
    );
    assert.equal(
      messages(
        'import { Details } from "./details-client";',
        "account",
        modules,
      ),
      "",
    );
  });

  it("handles helper cycles and re-exports, including server integration evidence", () => {
    const modules = new Map([
      [
        "src/components/ui/extensions/use-account.ts",
        'export { load } from "@/lib/account";',
      ],
      [
        "src/lib/account.ts",
        'import "../components/ui/extensions/use-account"; import { readFile } from "fs/promises";',
      ],
    ]);
    assert.match(
      messages('import { load } from "./use-account";', "account", modules),
      /-server.tsx/,
    );
    assert.equal(
      messages(
        'import "server-only"; import { load } from "./use-account";',
        "account-server",
        modules,
      ),
      "",
    );
  });

  it("does not treat Firebase SDK use inside a server-only helper as browser integration", () => {
    const component =
      'import "server-only"; import { requireAccess } from "@/components/_lib/require-access"; function AccountServer() { return <div />; } export { AccountServer };';
    const modules = (helper) =>
      new Map([["src/components/_lib/require-access.ts", helper]]);
    assert.equal(
      messages(
        component,
        "account-server",
        modules(
          'import "server-only"; import { getAuth } from "firebase/auth";',
        ),
      ),
      "",
    );
  });

  it("excludes registry source, framework files and tests", () => {
    for (const path of [
      "src/app/error.tsx",
      "src/components/firebase/oauth-button.tsx",
      "src/components/ui/button.tsx",
      file("account-client.test"),
    ])
      assert.deepEqual(
        inspectComponentRuntime(
          '"use client"; localStorage.getItem("x");',
          path,
        ),
        [],
      );
  });
});

describe("runtime suffixes preserve semantic safety checks", () => {
  it("keeps exact profile form families and field/property matching", () => {
    expectInvalid(
      '"use client"; function ProfileFormClient() { return <FormProvider><form /></FormProvider>; } function ProfileFormClientContent() { return <div />; } export { ProfileFormClient, ProfileFormClientContent };',
      /Export exactly the named components: ProfileFormClient/,
      "src/app/(protected)/profile/_components/profile-form-client.tsx",
    );
    expectInvalid(
      '"use client"; function ProfileEmailFieldClient(props) { return <Controller name="displayName" {...props} />; } export { ProfileEmailFieldClient };',
      /match Controller/,
      "src/app/(protected)/profile/_components/profile-email-field-client.tsx",
    );
  });

  it("rejects imports of local server component files from client boundaries", () => {
    expectInvalid(
      '"use client"; import { AccountServer } from "./account-server"; function DetailsClient(props) { return <div {...props} />; } export { DetailsClient };',
      /server-only/,
      "src/app/_components/details-client.tsx",
    );
  });
});

describe("Node integration client boundary protection", () => {
  it("rejects bare and prefixed built-ins in client boundaries", () => {
    for (const module of ["fs", "fs/promises", "node:fs", "node:test"]) {
      expectInvalid(
        `"use client"; import * as api from "${module}"; function Details(props) { return <div {...props} />; } export { Details };`,
        /server-only/,
        "src/app/_components/details-client.tsx",
      );
    }
  });
});

describe("UI phase flags", () => {
  const file = "src/app/_hooks/use-session.ts";

  it("rejects UI phase status tags in types, values, and branches", () => {
    const findings = inspectUiPhaseStatus(
      'type State = { status: "loading" } | { status: "ready" }; const state: State = { status: "loading" }; if (state.status === "loading") console.log("loading");',
      file,
    );
    assert.equal(findings.length, 4);
    for (const finding of findings)
      assert.match(
        finding.message,
        /use isLoading, isHidden, isError, or isReady/,
      );
  });

  it("allows explicit UI phase flags and unrelated domain statuses", () => {
    assert.deepEqual(
      inspectUiPhaseStatus(
        'type State = { isLoading: boolean; isReady: boolean }; const state: State = { isLoading: true, isReady: false }; const order = { status: "active" };',
        file,
      ),
      [],
    );
  });
});

describe("component filename term matching and parity", () => {
  it("accepts HomeClient with matching filename, props, orchestration hook, and Home composition", () => {
    expectValid(
      `"use client";
       import type { ComponentProps } from "react";
       import { useHomeClient } from "../_hooks/use-home-client";
       import { Home } from "./home";
       type HomeClientProps = ComponentProps<"div">;
       function HomeClient(props: HomeClientProps) {
         const { t } = useHomeClient();
         return <Home {...props} />;
       }
       export { HomeClient };`,
      "src/app/_components/home-client.tsx",
    );
  });

  it("rejects HomeClient when it does not compose Home", () => {
    expectInvalid(
      `"use client";
       import type { ComponentProps } from "react";
       import { useHomeClient } from "../_hooks/use-home-client";
       type HomeClientProps = ComponentProps<"div">;
       function HomeClient(props: HomeClientProps) {
         const { t } = useHomeClient();
         return <div {...props} />;
       }
       export { HomeClient };`,
      /HomeClient must compose Home/i,
      "src/app/_components/home-client.tsx",
    );
  });

  it("rejects Home in home-client.tsx due to missing 'Client' term", () => {
    expectInvalid(
      `"use client";
       import type { ComponentProps } from "react";
       type HomeProps = ComponentProps<"div">;
       function Home(props: HomeProps) { return <div {...props} />; }
       export { Home };`,
      /missing term\(s\): "client"/i,
      "src/app/_components/home-client.tsx",
    );
  });

  it("rejects mismatched terms such as HomeViewClient", () => {
    expectInvalid(
      `"use client";
       function HomeViewClient() { return <div />; }
       export { HomeViewClient };`,
      /unexpected term\(s\): "view"/i,
      "src/app/_components/home-client.tsx",
    );
  });

  it("rejects HomeClient delegating to useHome instead of useHomeClient", () => {
    expectInvalid(
      `"use client";
       import { useHome } from "../_hooks/use-home";
       function HomeClient() {
         useHome();
         return <div />;
       }
       export { HomeClient };`,
      /must delegate hook coordination to useHomeClient/i,
      "src/app/_components/home-client.tsx",
    );
  });

  it("rejects legacy props type naming when component is exact match", () => {
    expectInvalid(
      `"use client";
       type HomeProps = { id: string };
       function HomeClient() { return <div />; }
       export { HomeClient };`,
      /Props type must be named one of: HomeClientProps/i,
      "src/app/_components/home-client.tsx",
    );
  });
});

describe("lib and route _lib module placement", () => {
  it("allows flat src/lib modules, flat src/lib/firebase SDK modules, and route _lib/data.ts", () => {
    for (const validPath of [
      "src/lib/role.ts",
      "src/lib/role.test.ts",
      "src/lib/firebase/client.ts",
      "src/lib/firebase/server.ts",
      "src/lib/firebase/usage.ts",
      "src/app/(protected)/_lib/dal.ts",
      "src/app/(protected)/profile/_lib/data.ts",
    ]) {
      assert.deepEqual(inspectLibPlacement(validPath), []);
    }
  });

  it("rejects nested domain directories in src/lib, nested firestore folders, and standalone _lib/defaults.ts", () => {
    assert.match(
      inspectLibPlacement("src/lib/user/dal.ts")[0]?.message ?? "",
      /Keep domain helpers flat in src\/lib\/\*\.ts/,
    );
    assert.match(
      inspectLibPlacement("src/lib/firebase/firestore/user-preferences.ts")[0]
        ?.message ?? "",
      /Keep domain helpers flat in src\/lib\/\*\.ts/,
    );
    assert.match(
      inspectLibPlacement("src/app/(protected)/profile/_lib/defaults.ts")[0]
        ?.message ?? "",
      /Colocate route data reads and mutations together in _lib\/data\.ts/,
    );
  });
});

describe("data.ts method naming and file size conventions", () => {
  const dataFile = "src/app/(protected)/profile/_lib/data.ts";

  it("accepts exported functions prefixed with canonical data verbs and under 150 non-empty lines", () => {
    assert.deepEqual(
      inspectDataModuleConventions(
        "export async function readUserPreferences() {} export async function writeUserPreferences() {} export async function readProfile() {} export async function saveProfile() {}",
        dataFile,
      ),
      [],
    );
  });

  it("rejects exported data.ts functions without an explicit operation verb prefix", () => {
    const findings = inspectDataModuleConventions(
      "export async function profileDefaults() {} export const userPreferences = async () => {};",
      dataFile,
    );
    assert.equal(findings.length, 2);
    assert.match(findings[0].message, /explicit data operation verb/);
    assert.match(findings[1].message, /explicit data operation verb/);
  });

  it("rejects data.ts modules exceeding 150 non-empty lines", () => {
    const oversized = Array.from(
      { length: 151 },
      (_, index) => `const line${index} = ${index};`,
    ).join("\n");
    const findings = inspectDataModuleConventions(oversized, dataFile);
    assert.equal(findings.length, 1);
    assert.match(findings[0].message, /must not exceed 150 non-empty lines/);
  });
});
