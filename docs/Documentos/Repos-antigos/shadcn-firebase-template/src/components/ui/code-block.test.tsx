import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CodeBlockCopyButton } from "./code-block";

afterEach(cleanup);

describe("CodeBlockCopyButton", () => {
  it("does not become a submit button inside a form", () => {
    render(
      <form>
        <CodeBlockCopyButton value="sample code" />
      </form>,
    );
    expect(screen.getByRole("button", { name: "Copy" }).getAttribute("type")).toBe("button");
  });
});
