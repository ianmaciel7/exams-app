import assert from "node:assert/strict";
import test from "node:test";
import { checkFile } from "./guard-notes-app-pattern.mjs";

test("accepts a simple visual component composed from ui", () => {
  const source = `
    import { Alert } from "@/components/ui/alert";
    function ExampleAlert({ className, ...props }) {
      return <Alert {...props} data-slot="example-alert" className={className} />;
    }
  `;

  assert.deepEqual(checkFile("example-alert.tsx", source), []);
});

test("rejects visual components without a ui primitive", () => {
  const violations = checkFile(
    "example-card.tsx",
    'function ExampleCard() { return <div data-slot="example-card" />; }'
  );

  assert.ok(violations.some((item) => item.rule === "notes-app-requires-ui"));
});

test("rejects raw interactive controls", () => {
  const violations = checkFile(
    "example-form.tsx",
    `import { Field } from "@/components/ui/field";
     function ExampleForm() { return <form data-slot="example-form"><input /></form>; }`
  );

  assert.ok(
    violations.some((item) => item.rule === "notes-app-no-raw-controls")
  );
});

test("allows semantic form roles over FieldGroup composition", () => {
  const source = `
    import { FieldGroup } from "@/components/ui/field";
    function SettingsForm() {
      return <FieldGroup data-slot="settings-form"><span /></FieldGroup>;
    }
  `;

  assert.deepEqual(checkFile("settings-form.tsx", source), []);
});

test("accepts a simple dialog wrapper without custom compound parts", () => {
  const source = `
    import { Dialog, DialogContent } from "@/components/ui/dialog";
    function ExampleDialog({ children }) {
      return (
        <Dialog>
          <DialogContent data-slot="example-dialog">{children}</DialogContent>
        </Dialog>
      );
    }
  `;

  assert.deepEqual(checkFile("example-dialog.tsx", source), []);
});

test("rejects className before props spread", () => {
  const violations = checkFile(
    "example-card.tsx",
    `import { Card } from "@/components/ui/card";
     function ExampleCard({ className, ...props }) {
       return <Card data-slot="example-card" className={className} {...props} />;
     }`
  );

  assert.ok(
    violations.some((item) => item.rule === "notes-app-props-before-layout")
  );
});

test("allows explicitly non-visual infrastructure files", () => {
  assert.deepEqual(
    checkFile("auth-provider.tsx", "function AuthProvider() { return null; }"),
    []
  );
});

test("rejects raw forwarded layout wrappers", () => {
  const violations = checkFile(
    "example-form.tsx",
    `import { FieldGroup } from "@/components/ui/field";
     function ExampleForm({ ...props }) {
       return <div {...props} className={cn(className)} />;
     }`
  );

  assert.ok(
    violations.some((item) => item.rule === "notes-app-no-raw-layout-wrapper")
  );
});

test("rejects subcomponents without a role suffix", () => {
  const violations = checkFile(
    "example-dialog.tsx",
    `import { Dialog, DialogContent } from "@/components/ui/dialog";
     function ExampleDialog({ children }) {
       return <Dialog><DialogContent data-slot="example-dialog">{children}</DialogContent></Dialog>;
     }
     function ExamplePart() {
       return <DialogContent data-slot="example-part" />;
     }`
  );

  assert.ok(
    violations.some((item) => item.rule === "notes-app-component-role-suffix")
  );
});

test("requires the canonical component name to match the file", () => {
  const violations = checkFile(
    "space-switcher.tsx",
    `import { Select } from "@/components/ui/select";
     function SpaceSwitcherMenu() { return <Select data-slot="space-switcher" />; }`
  );

  assert.ok(
    violations.some(
      (item) => item.rule === "notes-app-canonical-component-name"
    )
  );
});

test("preserves canonical acronyms in component names", () => {
  const source = `
    import { Card } from "@/components/ui/card";
    function OAuthCard() {
      return <Card data-slot="oauth-card" />;
    }
  `;

  assert.deepEqual(checkFile("oauth-card.tsx", source), []);
});

test("requires data-slot on visual components", () => {
  const violations = checkFile(
    "example-dialog.tsx",
    `import { Dialog, DialogContent } from "@/components/ui/dialog";
     function ExampleDialog({ children }) {
       return <Dialog><DialogContent>{children}</DialogContent></Dialog>;
     }`
  );

  assert.ok(
    violations.some((item) => item.rule === "notes-app-component-data-slot")
  );
});

test("dedicated component hooks own React state and effects", () => {
  const violations = checkFile(
    "space-shell.tsx",
    `import { useState } from "react";
     import { useSpaceShell } from "@/hooks/use-space-shell";
     import { SidebarProvider } from "@/components/ui/sidebar";
     function SpaceShell({ children }) {
       useSpaceShell({});
       const [open] = useState(false);
       return <SidebarProvider data-slot="space-shell" className={cn("x")}>{children}{open}</SidebarProvider>;
     }`
  );

  assert.ok(
    violations.some(
      (item) => item.rule === "notes-app-dedicated-hook-owns-state"
    )
  );
});

test("allows stateful primitives inside the co-located dedicated hook", () => {
  const source = `
    import { useTransition } from "react";
    import { Select } from "@/components/ui/select";
    function LanguageSelect() {
      const { isPending } = useLanguageSelect();
      return <Select data-slot="language-select" disabled={isPending} />;
    }
    function useLanguageSelect() {
      const [isPending] = useTransition();
      return { isPending };
    }
  `;

  assert.ok(
    !checkFile("language-select.tsx", source).some(
      (item) => item.rule === "notes-app-dedicated-hook-owns-state"
    )
  );
});

test("allows a component to render from its dedicated hook without local state", () => {
  const source = `
    import { useSpaceShell } from "@/hooks/use-space-shell";
    import { SidebarProvider } from "@/components/ui/sidebar";
    function SpaceShell({ children }) {
      useSpaceShell({});
      return <SidebarProvider data-slot="space-shell" className={cn("x")}>{children}</SidebarProvider>;
    }
  `;

  assert.ok(
    !checkFile("space-shell.tsx", source).some(
      (item) => item.rule === "notes-app-dedicated-hook-owns-state"
    )
  );
});

test("enforces the SpaceShell wrapper contract", () => {
  const violations = checkFile(
    "space-shell.tsx",
    `import { SidebarProvider } from "@/components/ui/sidebar";
     type Props = { children?: ReactNode };
     function SpaceShell({ children }: Props) {
       return <SidebarProvider>{children}</SidebarProvider>;
     }`
  );

  assert.ok(
    violations.some((item) => item.rule === "notes-app-space-shell-contract")
  );
});

test("rejects visible NativeSelect without sr-only", () => {
  const source = `
    import { NativeSelect } from "@/components/ui/native-select";
    function CustomSelect() {
      return (
        <NativeSelect data-slot="custom-select" className="w-full">
          <option value="1">1</option>
        </NativeSelect>
      );
    }
  `;

  const violations = checkFile("custom-select.tsx", source);
  assert.ok(
    violations.some(
      (item) => item.rule === "notes-app-no-visible-native-select"
    )
  );
});

test("allows NativeSelect when used as accessible sr-only alternative", () => {
  const source = `
    import { NativeSelect } from "@/components/ui/native-select";
    function DropSlotSelect() {
      return (
        <NativeSelect
          data-slot="drop-slot-select"
          className="sr-only focus:not-sr-only focus:h-7"
        >
          <option value="1">1</option>
        </NativeSelect>
      );
    }
  `;

  assert.deepEqual(
    checkFile("drop-slot-select.tsx", source).filter(
      (item) => item.rule === "notes-app-no-visible-native-select"
    ),
    []
  );
});

test("rejects block elements (<div|ul|ol|p>) inside FieldDescription to prevent hydration error", () => {
  const source = `
    import { FieldDescription } from "@/components/ui/field";
    function TestFieldDescription() {
      return (
        <FieldDescription data-slot="test-field-description">
          <div className="text-sm">Cannot be inside p</div>
        </FieldDescription>
      );
    }
  `;

  const violations = checkFile("test-field-description.tsx", source);
  assert.ok(
    violations.some(
      (item) => item.rule === "notes-app-no-block-in-field-description"
    )
  );
});

test("enforces primitive role alignment for FieldContent, Toggle, FieldSet, FieldGroup, and Field", () => {
  const fieldContentMismatch = `
    import { FieldContent } from "@/components/ui/field";
    function QuestionExplanationFieldDescription() {
      return (
        <FieldContent data-slot="question-explanation-field-description">
          <div>Explanation</div>
        </FieldContent>
      );
    }
  `;

  const violations1 = checkFile(
    "question-explanation-field-description.tsx",
    fieldContentMismatch
  );
  assert.ok(
    violations1.some(
      (item) => item.rule === "notes-app-primitive-role-alignment"
    )
  );

  const toggleMismatch = `
    import { Toggle } from "@/components/ui/toggle";
    function QuestionHotspotButton() {
      return <Toggle data-slot="question-hotspot-button" />;
    }
  `;

  const violations2 = checkFile("question-hotspot-button.tsx", toggleMismatch);
  assert.ok(
    violations2.some(
      (item) => item.rule === "notes-app-primitive-role-alignment"
    )
  );

  const fieldSetMismatch = `
    import { FieldSet } from "@/components/ui/field";
    function QuestionCaseStudyItem() {
      return <FieldSet data-slot="question-case-study-item" />;
    }
  `;

  const violations3 = checkFile(
    "question-case-study-field-item.tsx",
    fieldSetMismatch
  );
  assert.ok(
    violations3.some(
      (item) => item.rule === "notes-app-primitive-role-alignment"
    )
  );

  const fieldGroupMismatch = `
    import { FieldGroup } from "@/components/ui/field";
    function QuestionDropdownFieldSet() {
      return <FieldGroup data-slot="question-dropdown-field-set" />;
    }
  `;

  const violations4 = checkFile(
    "question-dropdown-field-set.tsx",
    fieldGroupMismatch
  );
  assert.ok(
    violations4.some(
      (item) => item.rule === "notes-app-primitive-role-alignment"
    )
  );

  const fieldMismatch = `
    import { Field } from "@/components/ui/field";
    function QuestionMatchingButton() {
      return <Field data-slot="question-matching-button" />;
    }
  `;

  const violations5 = checkFile("question-matching-button.tsx", fieldMismatch);
  assert.ok(
    violations5.some(
      (item) => item.rule === "notes-app-primitive-role-alignment"
    )
  );
});
