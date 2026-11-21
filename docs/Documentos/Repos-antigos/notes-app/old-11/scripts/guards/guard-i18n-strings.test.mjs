import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import test from "node:test";
import { findI18nViolationsInSource } from "./guard-i18n-strings.mjs";

test("findI18nViolationsInSource detects forbidden phrases like 'Retry Connection'", () => {
  const badContent = `
    import { Button } from "@/components/ui/button";
    export function ErrorBox() {
      return <Button>Retry Connection</Button>;
    }
  `;
  const violations = findI18nViolationsInSource(badContent, "error-box.tsx");
  assert.ok(violations.length >= 1);
  assert.ok(
    violations.some((v) => v.snippet.includes("Retry Connection")),
    "Should identify 'Retry Connection'"
  );
});

test("findI18nViolationsInSource detects forbidden phrases inside string literals", () => {
  const badLiteral = `
    const msg = "Retry Connection";
  `;
  const violations = findI18nViolationsInSource(badLiteral, "literal.ts");
  assert.ok(violations.length >= 1);
  assert.ok(
    violations.some((v) => v.snippet.includes("Retry Connection")),
    "Should flag literal phrase"
  );
});

test("findI18nViolationsInSource detects raw hardcoded text inside interactive elements", () => {
  const rawButtonContent = `
    import { Button } from "@/components/ui/button";
    export function SubmitBox() {
      return <Button>Save Note</Button>;
    }
  `;
  const violations = findI18nViolationsInSource(
    rawButtonContent,
    "submit-box.tsx"
  );
  assert.ok(violations.length >= 1);
  assert.ok(
    violations.some((v) => v.snippet === "Save Note"),
    "Should flag hardcoded 'Save Note' button label"
  );
});

test("findI18nViolationsInSource detects hardcoded text in generic JSX containers", () => {
  const badContent = `
    export function Status() {
      return <span>Loading spaces</span>;
    }
  `;
  const violations = findI18nViolationsInSource(badContent, "status.tsx");
  assert.ok(violations.some((v) => v.snippet === "Loading spaces"));
});

test("findI18nViolationsInSource detects hardcoded accessibility attributes", () => {
  const badContent = `
    export function QrCode() {
      return <img src="/qr.png" alt="TOTP QR Code" />;
    }
  `;
  const violations = findI18nViolationsInSource(badContent, "qr-code.tsx");
  assert.ok(violations.some((v) => v.snippet === "TOTP QR Code"));
});

test("findI18nViolationsInSource permits proper i18n usage", () => {
  const validContent = `
    import { useTranslations } from "next-intl";
    import { Button } from "@/components/ui/button";

    export function LocalizedBox() {
      const t = useTranslations("spaces");
      return <Button>{t("retryConnection")}</Button>;
    }
  `;
  const violations = findI18nViolationsInSource(
    validContent,
    "localized-box.tsx"
  );
  assert.equal(violations.length, 0);
});

test("guard-i18n-strings script passes on current repository codebase", () => {
  const output = execFileSync(
    "node",
    ["scripts/guards/guard-i18n-strings.mjs"],
    { encoding: "utf8" }
  );
  assert.match(
    output,
    /Zero hardcoded i18n violations found in application UI/
  );
});
