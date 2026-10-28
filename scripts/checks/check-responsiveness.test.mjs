import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  hasResponsiveBreakpoint,
  inspectResponsivenessSource,
  isOwnedComponent,
  isRouteFile,
} from "./check-responsiveness.mjs";

const check = (source, path = "src/components/ui/extensions/sample.tsx") =>
  inspectResponsivenessSource(source, path).map(
    (violation) => violation.message,
  );

function expectValid(source, path) {
  assert.deepEqual(check(source, path), []);
}

function expectRejected(source, reason, path) {
  const messages = check(source, path).join(" ");
  assert.match(messages, reason);
}

describe("responsiveness guard", () => {
  describe("path classifiers and breakpoint helper", () => {
    it("classifies responsive prefixes correctly", () => {
      assert.equal(hasResponsiveBreakpoint("sm:w-[400px]"), true);
      assert.equal(hasResponsiveBreakpoint("md:w-[500px]"), true);
      assert.equal(hasResponsiveBreakpoint("lg:w-[600px]"), true);
      assert.equal(hasResponsiveBreakpoint("xl:w-[700px]"), true);
      assert.equal(hasResponsiveBreakpoint("2xl:w-[800px]"), true);
      assert.equal(hasResponsiveBreakpoint("max-sm:w-[400px]"), false);
      assert.equal(hasResponsiveBreakpoint("@container:w-[400px]"), false);
      assert.equal(hasResponsiveBreakpoint("@md:w-[500px]"), true);
      assert.equal(hasResponsiveBreakpoint("hover:w-[400px]"), false);
      assert.equal(hasResponsiveBreakpoint("max-md:w-[500px]"), false);
      assert.equal(hasResponsiveBreakpoint("dark:w-[400px]"), false);
      assert.equal(hasResponsiveBreakpoint("w-[400px]"), false);
    });

    it("distinguishes owned components from third-party vendor code", () => {
      assert.equal(
        isOwnedComponent("src/components/ui/extensions/labeled-spinner.tsx"),
        true,
      );
      assert.equal(isOwnedComponent("src/app/_components/home-hero.tsx"), true);
      assert.equal(
        isOwnedComponent(
          "src/app/(protected)/profile/_components/profile-card.tsx",
        ),
        true,
      );
      assert.equal(isOwnedComponent("src/components/ui/button.tsx"), false);
      assert.equal(
        isOwnedComponent("src/components/ai-elements/agent.tsx"),
        false,
      );
      assert.equal(
        isOwnedComponent("src/components/firebase/policies.tsx"),
        false,
      );
      assert.equal(
        isOwnedComponent("src/components/ui/extensions/sample.test.tsx"),
        false,
      );
    });

    it("identifies Next.js App Router entrypoints", () => {
      assert.equal(isRouteFile("src/app/layout.tsx"), true);
      assert.equal(isRouteFile("src/app/page.tsx"), true);
      assert.equal(isRouteFile("src/app/(public)/layout.tsx"), true);
      assert.equal(isRouteFile("src/app/loading.tsx"), true);
      assert.equal(isRouteFile("src/app/not-found.tsx"), true);
      assert.equal(isRouteFile("src/app/page.test.tsx"), false);
    });
  });

  describe("viewport accessibility rules (WCAG 1.4.4)", () => {
    const rootLayout = "src/app/layout.tsx";

    it("accepts valid viewport configuration on root layout", () => {
      expectValid(
        `
        export const viewport = {
          width: "device-width",
          initialScale: 1,
        };
        export default function Layout({ children }) {
          return <html><body>{children}</body></html>;
        }
        `,
        rootLayout,
      );
    });

    it("accepts valid generateViewport function on root layout", () => {
      expectValid(
        `
        export function generateViewport() {
          return {
            width: "device-width",
            initialScale: 1,
          };
        }
        export default function Layout({ children }) {
          return <html><body>{children}</body></html>;
        }
        `,
        rootLayout,
      );
    });

    it("requires root layout to export viewport configuration", () => {
      expectRejected(
        `
        export default function Layout({ children }) {
          return <html><body>{children}</body></html>;
        }
        `,
        /Root layout must export a viewport configuration/,
        rootLayout,
      );
    });

    it("rejects viewport without width: 'device-width'", () => {
      expectRejected(
        `
        export const viewport = {
          width: "1024px",
          initialScale: 1,
        };
        `,
        /Viewport width must be 'device-width'/,
        rootLayout,
      );
    });

    it("rejects viewport missing initialScale: 1", () => {
      expectRejected(
        `
        export const viewport = {
          width: "device-width",
          initialScale: 0.8,
        };
        `,
        /Viewport initialScale must be 1/,
        rootLayout,
      );
    });

    it("strictly forbids userScalable: false", () => {
      expectRejected(
        `
        export const viewport = {
          width: "device-width",
          initialScale: 1,
          userScalable: false,
        };
        `,
        /Disabling user zoom \(userScalable: false\) is strictly forbidden/,
        rootLayout,
      );
    });

    it("strictly forbids maximumScale: 1", () => {
      expectRejected(
        `
        export const viewport = {
          width: "device-width",
          initialScale: 1,
          maximumScale: 1,
        };
        `,
        /Restricting maximumScale to 1 is strictly forbidden/,
        rootLayout,
      );
    });

    it("strictly forbids user-scalable=no in string options", () => {
      expectRejected(
        `
        export const viewport = {
          width: "device-width",
          initialScale: 1,
          raw: "user-scalable=no",
        };
        `,
        /Disabling user zoom \('user-scalable=no'\) is strictly forbidden/,
        rootLayout,
      );
    });

    it("rejects JSX meta tag disabling user zoom", () => {
      expectRejected(
        `
        export const viewport = { width: "device-width", initialScale: 1 };
        export default function Layout({ children }) {
          return (
            <html>
              <head>
                <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
              </head>
              <body>{children}</body>
            </html>
          );
        }
        `,
        /Disabling user zoom \('user-scalable=no'\) is strictly forbidden/,
        rootLayout,
      );
    });
  });

  describe("rigid pixel width rules (> 320px without responsive/fluid modifiers)", () => {
    it("allows widths <= 320px", () => {
      expectValid(
        'export function Card() { return <div className="w-[320px] w-[100px] w-64" />; }',
      );
    });

    it("rejects rigid width > 320px without responsive prefix", () => {
      expectRejected(
        'export function Card() { return <div className="w-[400px]" />; }',
        /Rigid non-responsive width 'w-\[400px\]' exceeds 320px/,
      );
    });

    it("rejects rigid min-width > 320px without responsive prefix", () => {
      expectRejected(
        'export function Card() { return <div className="min-w-[500px]" />; }',
        /Rigid non-responsive width 'min-w-\[500px\]' exceeds 320px/,
      );
    });

    it("rejects max-width variants that activate at 320px", () => {
      expectRejected(
        'export function Card() { return <div className="max-sm:w-[400px]" />; }',
        /Rigid non-responsive width 'max-sm:/,
      );
    });

    it("allows rigid width > 320px when guarded by responsive prefix", () => {
      expectValid(
        'export function Card() { return <div className="sm:w-[400px] md:w-[600px] @md:w-[500px]" />; }',
      );
    });

    it("rejects pseudo-class prefixes that are not responsive breakpoints", () => {
      expectRejected(
        'export function Card() { return <div className="hover:w-[450px]" />; }',
        /Rigid non-responsive width 'hover:w-\[450px\]' exceeds 320px/,
      );
      expectRejected(
        'export function Card() { return <div className="dark:w-[450px]" />; }',
        /Rigid non-responsive width 'dark:w-\[450px\]' exceeds 320px/,
      );
    });

    it("allows rigid width > 320px when accompanied by fluid wrapper constraint", () => {
      expectValid(
        'export function Card() { return <div className="w-[500px] max-w-full" />; }',
      );
      expectValid(
        'export function Card() { return <div className="min-w-[400px] max-w-screen" />; }',
      );
    });

    it("allows max-w-[...px] without flagging since max-width shrinks fluidly", () => {
      expectValid(
        'export function Card() { return <div className="max-w-[600px] w-full" />; }',
      );
    });

    it("detects rigid inline style widths without fluid maxWidth", () => {
      expectRejected(
        "export function Card() { return <div style={{ width: 450 }} />; }",
        /Rigid non-responsive inline style width \(450px\) exceeds 320px/,
      );
      expectRejected(
        'export function Card() { return <div style={{ minWidth: "500px" }} />; }',
        /Rigid non-responsive inline style width \(500px\) exceeds 320px/,
      );
    });

    it("allows inline style width when fluid maxWidth is provided", () => {
      expectValid(
        'export function Card() { return <div style={{ width: 450, maxWidth: "100%" }} />; }',
      );
    });

    it("detects rigid width in standalone class constants", () => {
      expectRejected(
        'const cardClasses = "flex p-4 w-[420px]"; export function Card() { return <div className={cardClasses} />; }',
        /Rigid non-responsive width 'w-\[420px\]' exceeds 320px/,
      );
    });
  });

  describe("WCAG 2.2 SC 2.5.8 Touch Target rules (minimum 24x24px)", () => {
    it("allows interactive elements with standard sizing (>= 24x24px)", () => {
      expectValid(
        'export function Actions() { return <button className="h-10 px-4" onClick={() => {}}>Save</button>; }',
      );
      expectValid(
        'export function Actions() { return <Button className="size-9">Submit</Button>; }',
      );
      expectValid(
        'export function Actions() { return <a href="/terms" className="text-sm underline">Terms</a>; }',
      );
    });

    it("rejects interactive elements with tiny dimensions without hit-area padding", () => {
      expectRejected(
        'export function Close() { return <button className="size-4" onClick={() => {}} />; }',
        /Interactive element <button> has tiny dimension 'size-4' violating WCAG 2.2 SC 2.5.8 Touch Target/,
      );
      expectRejected(
        'export function Action() { return <Button className="h-4 w-4" />; }',
        /Interactive element <Button> has tiny dimension 'h-4' violating WCAG 2.2 SC 2.5.8 Touch Target/,
      );
      expectRejected(
        'export function LinkIcon() { return <a href="#" className="size-3" />; }',
        /Interactive element <a> has tiny dimension 'size-3' violating WCAG 2.2 SC 2.5.8 Touch Target/,
      );
      expectRejected(
        'export function RoleButton() { return <div role="button" className="size-4" onClick={() => {}} />; }',
        /Interactive element <div> has tiny dimension 'size-4' violating WCAG 2.2 SC 2.5.8 Touch Target/,
      );
    });

    it("requires both axes of small interactive targets to be expanded", () => {
      expectRejected(
        'export function Close() { return <button className="h-4 px-4" />; }',
        /Interactive element <button> has tiny dimension/,
      );
      expectRejected(
        'export function Close() { return <button className="size-4 min-w-6" />; }',
        /Interactive element <button> has tiny dimension/,
      );
      expectValid(
        'export function Close() { return <button className="h-4 py-2" />; }',
      );
    });

    it("allows tiny interactive elements with adequate hit-area padding", () => {
      expectValid(
        'export function Close() { return <button className="size-4 p-2" onClick={() => {}} />; }',
      );
      expectValid(
        'export function Close() { return <button className="size-3 py-2 px-3" onClick={() => {}} />; }',
      );
    });

    it("allows tiny interactive elements with pseudo-element touch expanders", () => {
      expectValid(
        'export function Close() { return <button className="size-4 after:absolute after:-inset-2" onClick={() => {}} />; }',
      );
    });

    it("allows tiny interactive elements with explicit minimum dimension constraints", () => {
      expectValid(
        'export function Close() { return <button className="size-4 min-h-6 min-w-6" onClick={() => {}} />; }',
      );
      expectValid(
        'export function Close() { return <button className="size-4 min-h-[24px] min-w-[24px]" onClick={() => {}} />; }',
      );
    });

    it("does not flag child icons inside buttons", () => {
      expectValid(
        'export function IconButton() { return <Button className="h-9 w-9"><SearchIcon className="size-4" /></Button>; }',
      );
    });

    it("does not flag non-interactive elements with small dimensions", () => {
      expectValid(
        'export function Badge() { return <span className="size-4 rounded-full bg-blue-500" />; }',
      );
      expectValid(
        'export function Indicator() { return <div className="h-2 w-2 rounded-full" />; }',
      );
    });
  });
});
