import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import test from "node:test";
import ts from "typescript";
import {
  checkAlertProps,
  checkInlinePropsTypes,
  checkLoginCardProps,
  checkPrimaryExportMatchesFilename,
  checkPropsInFile,
  checkSingleComponentFile,
  checkStandaloneSurfaceComponents,
} from "./guard-component-props.mjs";

function parseTsx(code, filename = "dummy.tsx") {
  return ts.createSourceFile(
    filename,
    code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
}

test("guard-component-props passes on current clean codebase", () => {
  const output = execFileSync(
    "node",
    ["scripts/guards/guard-component-props.mjs"],
    {
      encoding: "utf8",
    }
  );
  assert.match(
    output,
    /all application component props in src\/components\/ \(outside ui\/ and firebase\/\) adhere to standard inheritance/
  );
});

test("checkPropsInFile detects closed interface without extends", () => {
  const sample = `
    interface ClosedButtonProps {
      onClick: () => void;
    }
  `;
  const violations = checkPropsInFile("dummy.tsx", sample);
  assert.equal(violations.length, 1);
  assert.equal(violations[0].propName, "ClosedButtonProps");
  assert.match(violations[0].message, /closed interface with no 'extends'/);
});

test("checkPropsInFile detects closed type alias with object literal", () => {
  const sample = `
    export type ClosedCardProps = {
      title: string;
    };
  `;
  const violations = checkPropsInFile("dummy.tsx", sample);
  assert.equal(violations.length, 1);
  assert.equal(violations[0].propName, "ClosedCardProps");
  assert.match(violations[0].message, /closed object type literal/);
});

test("checkPropsInFile allows ComponentProps, PropsWithChildren, and HTMLAttributes", () => {
  const sample = `
    export interface FormProps extends ComponentProps<"form"> {}
    export interface WrapperProps extends PropsWithChildren<{ title?: string }> {}
    export type DivProps = HTMLAttributes<HTMLDivElement> & { custom?: boolean };
    export type ChildProps = PropsWithChildren<{ id: string }>;
  `;
  const violations = checkPropsInFile("dummy.tsx", sample);
  assert.equal(violations.length, 0);
});

test("checkPropsInFile allows canonical library props", () => {
  const sample = `
    import type { PhoneAuthFormProps } from "@firebase-oss/ui-react";
    export interface CustomPhoneAuthProps extends PhoneAuthFormProps {}
    export type WrappedPhoneAuthProps = PhoneAuthFormProps & { extra?: string };
  `;
  const violations = checkPropsInFile("dummy.tsx", sample);
  assert.equal(violations.length, 0);
});

test("checkAlertProps accepts a canonical props type alias", () => {
  const typeAlias = checkAlertProps(
    parseTsx(
      'import type * as React from "react"; type ConnectionAlertProps = React.ComponentProps<"div">; function ConnectionAlert() { return null; }; export { ConnectionAlert, type ConnectionAlertProps };'
    ),
    "connection-alert.tsx"
  );
  assert.equal(typeAlias, null);

  const notExported = checkAlertProps(
    parseTsx(
      'import type * as React from "react"; type ConnectionAlertProps = React.ComponentProps<"div">; function ConnectionAlert() { return null; }; export { ConnectionAlert };'
    ),
    "connection-alert.tsx"
  );
  assert.ok(notExported !== null);
  assert.match(notExported.message, /canonical props type/);
});

test("checkAlertProps requires the canonical alert props type", () => {
  const missing = checkAlertProps(
    parseTsx("export function ConnectionAlert() { return null; }"),
    "connection-alert.tsx"
  );
  assert.ok(missing !== null);
  assert.equal(missing.propName, "ConnectionAlertProps");
  assert.match(missing.message, /must export 'ConnectionAlertProps'/);

  const notExported = checkAlertProps(
    parseTsx(
      'import type { ComponentProps } from "react"; interface ConnectionAlertProps extends ComponentProps<"div"> {}'
    ),
    "connection-alert.tsx"
  );
  assert.ok(notExported !== null);

  const valid = checkAlertProps(
    parseTsx(
      'import type * as React from "react"; interface ConnectionAlertProps extends React.ComponentProps<"div"> {}; function ConnectionAlert() { return null; }; export { ConnectionAlert, type ConnectionAlertProps };'
    ),
    "connection-alert.tsx"
  );
  assert.equal(valid, null);
});

test("checkSingleComponentFile rejects compound components in one file", () => {
  const compound = `
    function ConnectionAlert() { return <div />; }
    function ConnectionAlertTitle() { return <div />; }
    function ConnectionAlertAction() { return <div />; }
    export { ConnectionAlert, ConnectionAlertTitle, ConnectionAlertAction };
  `;
  const violations = checkSingleComponentFile(
    parseTsx(compound, "connection-alert.tsx"),
    "connection-alert.tsx"
  );
  assert.equal(violations.length, 1);
  assert.match(violations[0].message, /declares 3 components/);
});

test("checkSingleComponentFile counts arrow components and ignores hooks and helpers", () => {
  const arrows = `
    const A = () => <div />;
    const B = () => <div />;
  `;
  assert.equal(
    checkSingleComponentFile(parseTsx(arrows, "a-card.tsx"), "a-card.tsx")
      .length,
    1
  );

  const single = `
    function useThing() { return 1; }
    function helper() { return 2; }
    function ThingCard() { return <div />; }
  `;
  assert.deepEqual(
    checkSingleComponentFile(
      parseTsx(single, "thing-card.tsx"),
      "thing-card.tsx"
    ),
    []
  );
});

test("checkSingleComponentFile rejects createContext and Object.assign parts", () => {
  const context = `
    import { createContext } from "react";
    const Ctx = createContext(null);
    function ThingCard() { return <div />; }
  `;
  const contextViolations = checkSingleComponentFile(
    parseTsx(context, "thing-card.tsx"),
    "thing-card.tsx"
  );
  assert.equal(contextViolations.length, 1);
  assert.match(contextViolations[0].message, /createContext/);

  const assign = `
    function ThingCard() { return <div />; }
    export const X = Object.assign(ThingCard, { Part: ThingCard });
  `;
  const assignViolations = checkSingleComponentFile(
    parseTsx(assign, "thing-card.tsx"),
    "thing-card.tsx"
  );
  assert.equal(assignViolations.length, 1);
  assert.match(assignViolations[0].message, /Object\.assign/);
});

test("checkSingleComponentFile skips test files", () => {
  const two =
    "function A() { return <div />; } function B() { return <div />; }";
  assert.deepEqual(
    checkSingleComponentFile(
      parseTsx(two, "a-card.test.tsx"),
      "a-card.test.tsx"
    ),
    []
  );
});

test("checkPropsInFile detects missing card component export in -card.tsx", () => {
  const sample = `
    export function RandomScreen() { return null; }
  `;
  const violations = checkPropsInFile("dummy-card.tsx", sample);
  // Two violations: card-export check + primary-export-matches-filename check
  assert.equal(violations.length, 2);
  const cardViolation = violations.find((v) =>
    v.message.includes("must export 'DummyCard'")
  );
  const primaryViolation = violations.find((v) =>
    v.message.includes("Primary export")
  );
  assert.ok(cardViolation, "expected card export violation");
  assert.equal(cardViolation.propName, "DummyCard");
  assert.ok(primaryViolation, "expected primary export violation");
});

test("checkPropsInFile permits card export via named alias in -card.tsx", () => {
  const sample = `
    function InternalScreen() { return null; }
    export { InternalScreen as DummyCard };
  `;
  const violations = checkPropsInFile("dummy-card.tsx", sample);
  assert.equal(violations.length, 0);
});

// ─── checkPrimaryExportMatchesFilename ─────────────────────────────────────

test("checkPrimaryExportMatchesFilename passes when fn name matches filename", () => {
  const sample = `export function LoginCard({ className }) { return null; }`;
  const sf = parseTsx(sample, "login-card.tsx");
  const result = checkPrimaryExportMatchesFilename(sf, "login-card.tsx");
  assert.equal(result, null);
});

test("checkPrimaryExportMatchesFilename fails when fn name does not match filename", () => {
  const sample = `
    export function SignInAuthScreen({ className }) { return null; }
    export { SignInAuthScreen as LoginCard };
  `;
  const sf = parseTsx(sample, "login-card.tsx");
  const result = checkPrimaryExportMatchesFilename(sf, "login-card.tsx");
  assert.ok(result !== null, "expected a violation");
  assert.equal(result.propName, "LoginCard");
  assert.match(
    result.message,
    /Primary export in 'login-card.tsx' is 'SignInAuthScreen'/
  );
});

test("checkPrimaryExportMatchesFilename passes when one of multiple fns matches filename", () => {
  // files with multiple exported helpers are OK as long as one matches
  const sample = `
    export function HelperForm() { return null; }
    export function LoginCard() { return null; }
  `;
  const sf = parseTsx(sample, "login-card.tsx");
  const result = checkPrimaryExportMatchesFilename(sf, "login-card.tsx");
  assert.equal(result, null);
});

test("checkPrimaryExportMatchesFilename is skipped for test files", () => {
  const sample = `export function SignInAuthScreen() { return null; }`;
  const sf = parseTsx(sample, "login-card.test.tsx");
  const result = checkPrimaryExportMatchesFilename(sf, "login-card.test.tsx");
  assert.equal(result, null);
});

test("checkPrimaryExportMatchesFilename is skipped when no PascalCase fn is exported", () => {
  // e.g. a pure-context file
  const sample = `export const authContext = createContext(null);`;
  const sf = parseTsx(sample, "auth-context.tsx");
  const result = checkPrimaryExportMatchesFilename(sf, "auth-context.tsx");
  assert.equal(result, null);
});

test("checkPropsInFile catches primary export mismatch via integration", () => {
  const sample = `
    export function SignInAuthScreen({ className }) { return null; }
    export { SignInAuthScreen as LoginCard };
  `;
  const violations = checkPropsInFile("login-card.tsx", sample);
  const exportViolation = violations.find((v) =>
    v.message.includes("Primary export")
  );
  assert.ok(exportViolation, "expected a primary-export violation");
  assert.match(exportViolation.message, /SignInAuthScreen/);
});

// ─── checkLoginCardProps ───────────────────────────────────────────────────

test("checkLoginCardProps passes when LoginCardProps is declared canonically", () => {
  const sample = `
    export interface LoginCardProps extends ComponentProps<"div"> {}
    export function LoginCard(props: LoginCardProps) { return null; }
    export { LoginCard as SignInAuthScreen, type LoginCardProps as SignInAuthScreenProps };
  `;
  const sf = parseTsx(sample, "login-card.tsx");
  const result = checkLoginCardProps(sf, "login-card.tsx");
  assert.equal(result, null);
});

test("checkLoginCardProps fails when SignInAuthScreenProps is declared instead of LoginCardProps", () => {
  const sample = `
    export interface SignInAuthScreenProps extends ComponentProps<"div"> {}
    export function LoginCard(props: SignInAuthScreenProps) { return null; }
    export { LoginCard as SignInAuthScreen, type SignInAuthScreenProps as LoginCardProps };
  `;
  const sf = parseTsx(sample, "login-card.tsx");
  const result = checkLoginCardProps(sf, "login-card.tsx");
  assert.ok(result !== null);
  assert.equal(result.propName, "SignInAuthScreenProps");
  assert.match(
    result.message,
    /must declare 'LoginCardProps' as its canonical props type/
  );
});

test("checkLoginCardProps fails when LoginCardProps is missing", () => {
  const sample = `
    export function LoginCard() { return null; }
  `;
  const sf = parseTsx(sample, "login-card.tsx");
  const result = checkLoginCardProps(sf, "login-card.tsx");
  assert.ok(result !== null);
  assert.equal(result.propName, "LoginCardProps");
  assert.match(result.message, /must declare 'LoginCardProps'/);
});

test("checkLoginCardProps ignores other files", () => {
  const sample = `
    export interface SignInAuthScreenProps extends ComponentProps<"div"> {}
  `;
  const sf = parseTsx(sample, "other-component.tsx");
  const result = checkLoginCardProps(sf, "other-component.tsx");
  assert.equal(result, null);
});

test("checkInlinePropsTypes flags an inline object type on a function component", () => {
  const sample = `
    function SpaceIcon({ iconKey, className }: { iconKey?: string; className?: string }) {
      return null;
    }
  `;
  const violations = checkInlinePropsTypes(parseTsx(sample), "dummy.tsx");
  assert.equal(violations.length, 1);
  assert.equal(violations[0].propName, "SpaceIcon");
  assert.match(violations[0].message, /inline object type literal/);
  assert.match(violations[0].message, /Declare 'type SpaceIconProps = /);
  assert.doesNotMatch(violations[0].message, /interface/);
});

test("checkInlinePropsTypes flags an inline object type on an arrow component", () => {
  const sample = `
    export const UserBadge = ({ name }: { name: string }) => null;
  `;
  const violations = checkInlinePropsTypes(parseTsx(sample), "dummy.tsx");
  assert.equal(violations.length, 1);
  assert.equal(violations[0].propName, "UserBadge");
});

test("checkInlinePropsTypes allows named props and non-component helpers", () => {
  const sample = `
    interface SpaceIconProps extends ComponentProps<"svg"> { iconKey?: string }
    function SpaceIcon({ iconKey }: SpaceIconProps) { return null; }
    function formatName({ first }: { first: string }) { return first; }
  `;
  assert.deepEqual(checkInlinePropsTypes(parseTsx(sample), "dummy.tsx"), []);
});

test("checkPropsInFile reports inline props types", () => {
  const sample = `function Foo({ a }: { a: string }) { return null; }`;
  const violations = checkPropsInFile("dummy.tsx", sample);
  assert.equal(violations.length, 1);
  assert.equal(violations[0].propName, "Foo");
});

// ─── checkStandaloneSurfaceComponents ──────────────────────────────────────

test("checkStandaloneSurfaceComponents flags a dialog declared in another component file", () => {
  const sample = `
    function CreateSpaceDialog() { return null; }
    export function SpaceSidebar() { return <CreateSpaceDialog />; }
  `;
  const violations = checkStandaloneSurfaceComponents(
    parseTsx(sample, "space-sidebar.tsx"),
    "space-sidebar.tsx"
  );
  assert.equal(violations.length, 1);
  assert.equal(violations[0].propName, "CreateSpaceDialog");
  assert.match(violations[0].message, /standalone dialog/);
  assert.match(violations[0].message, /create-space-dialog\.tsx/);
});

test("checkStandaloneSurfaceComponents flags arrow-function surfaces", () => {
  const sample = `const RenameSpaceSheet = () => null;`;
  const violations = checkStandaloneSurfaceComponents(
    parseTsx(sample, "space-sidebar.tsx"),
    "space-sidebar.tsx"
  );
  assert.equal(violations.length, 1);
  assert.equal(violations[0].propName, "RenameSpaceSheet");
});

test("checkStandaloneSurfaceComponents allows the file's own component and compound parts", () => {
  const sample = `
    function CreateSpaceDialog() { return null; }
    function CreateSpaceDialogForm() { return null; }
  `;
  assert.deepEqual(
    checkStandaloneSurfaceComponents(
      parseTsx(sample, "create-space-dialog.tsx"),
      "create-space-dialog.tsx"
    ),
    []
  );
});

test("checkStandaloneSurfaceComponents ignores non-surface components and tests", () => {
  const sample = `
    function SpaceSwitcherMenu() { return null; }
    function CreateSpaceDialog() { return null; }
  `;
  assert.deepEqual(
    checkStandaloneSurfaceComponents(
      parseTsx(sample, "space-sidebar.tsx"),
      "space-sidebar.tsx"
    ).map((v) => v.propName),
    ["CreateSpaceDialog"]
  );
  assert.deepEqual(
    checkStandaloneSurfaceComponents(
      parseTsx(sample, "space-sidebar.test.tsx"),
      "space-sidebar.test.tsx"
    ),
    []
  );
});

test("checkPropsInFile reports standalone surface components via integration", () => {
  const sample = `function CreateSpaceDialog() { return null; }`;
  const violations = checkPropsInFile("space-sidebar.tsx", sample);
  assert.ok(violations.some((v) => v.propName === "CreateSpaceDialog"));
});
