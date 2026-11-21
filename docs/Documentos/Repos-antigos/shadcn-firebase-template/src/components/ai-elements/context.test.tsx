import { cleanup, render, screen, within } from "@testing-library/react";
import type { LanguageModelUsage } from "ai";
import { afterEach, describe, expect, it } from "vitest";
import {
  Context,
  ContextCacheUsage,
  ContextContentFooter,
  ContextContentHeader,
  ContextInputUsage,
  ContextOutputUsage,
  ContextReasoningUsage,
} from "./context";

function usage(
  input: Partial<LanguageModelUsage> & {
    inputTokenDetails?: LanguageModelUsage["inputTokenDetails"];
  } = {},
): LanguageModelUsage {
  return {
    inputTokens: 1_000_000,
    outputTokens: 0,
    totalTokens: 1_000_000,
    inputTokenDetails: {
      noCacheTokens: undefined,
      cacheReadTokens: undefined,
      cacheWriteTokens: undefined,
    },
    outputTokenDetails: { textTokens: undefined, reasoningTokens: undefined },
    ...input,
  };
}

function renderCosts(value: LanguageModelUsage, modelId = "gpt-4o") {
  render(
    <Context
      maxTokens={2_000_000}
      modelId={modelId}
      usage={value}
      usedTokens={1_000_000}
    >
      <ContextContentFooter />
      <ContextInputUsage />
      <ContextOutputUsage />
      <ContextCacheUsage />
      <ContextReasoningUsage />
    </Context>,
  );
}

function expectRowCost(label: string, cost: string) {
  const row = screen.getByText(label).parentElement;
  expect(row).not.toBeNull();
  if (row) expect(within(row).getByText(`• ${cost}`)).toBeDefined();
}

afterEach(cleanup);

describe("context usage pricing", () => {
  it("prices uncached input at the regular rate", () => {
    renderCosts(usage());
    expect(screen.getByText("$2.50")).toBeDefined();
    expectRowCost("Input (uncached)", "$2.50");
    expect(screen.queryByText("Cache")).toBeNull();
  });

  it("prices fully cached input once at the cache read rate", () => {
    renderCosts(
      usage({
        inputTokenDetails: {
          noCacheTokens: 0,
          cacheReadTokens: 1_000_000,
          cacheWriteTokens: 0,
        },
      }),
    );
    expect(screen.getByText("$1.25")).toBeDefined();
    expectRowCost("Cache", "$1.25");
    expect(screen.queryByText("Input (uncached)")).toBeNull();
    expect(screen.queryByText("$2.50")).toBeNull();
  });

  it("includes cache writes at their distinct provider rate", () => {
    renderCosts(
      usage({
        inputTokenDetails: {
          noCacheTokens: 0,
          cacheReadTokens: 0,
          cacheWriteTokens: 1_000_000,
        },
      }),
      "claude-3-5-sonnet-20241022",
    );
    expect(screen.getByText("$3.75")).toBeDefined();
    expectRowCost("Cache", "$3.75");
    expect(screen.queryByText("Input (uncached)")).toBeNull();
  });

  it("derives uncached input when providers omit that detail", () => {
    renderCosts(
      usage({
        inputTokenDetails: {
          noCacheTokens: undefined,
          cacheReadTokens: 500_000,
          cacheWriteTokens: 0,
        },
      }),
    );
    expect(screen.getByText("$1.88")).toBeDefined();
    expectRowCost("Input (uncached)", "$1.25");
    expectRowCost("Cache", "$0.63");
  });

  it("keeps mixed costs consistent and reasoning included in output", () => {
    renderCosts(
      usage({
        inputTokenDetails: {
          noCacheTokens: 500_000,
          cacheReadTokens: 250_000,
          cacheWriteTokens: 250_000,
        },
        outputTokens: 100_000,
        outputTokenDetails: { textTokens: 50_000, reasoningTokens: 50_000 },
        totalTokens: 1_100_000,
      }),
      "claude-3-5-sonnet-20241022",
    );
    expect(screen.getByText("$4.01")).toBeDefined();
    expectRowCost("Input (uncached)", "$1.50");
    expectRowCost("Output", "$1.50");
    expectRowCost("Cache", "$1.01");
    expectRowCost("Reasoning (included in output)", "$0.75");
  });
});

describe("context progress accessibility", () => {
  it("names its default progress bar", () => {
    render(
      <Context maxTokens={100} usedTokens={25}>
        <ContextContentHeader />
      </Context>,
    );
    const progress = screen.getByRole("progressbar", {
      name: "Model context usage",
    });
    expect(progress.getAttribute("aria-valuenow")).toBe("25");
  });

  it("allows independently localized progress names", () => {
    render(
      <>
        <Context maxTokens={100} usedTokens={25}>
          <ContextContentHeader progressLabel="Uso do contexto" />
        </Context>
        <Context maxTokens={100} usedTokens={50}>
          <ContextContentHeader progressLabel="Uso del contexto" />
        </Context>
      </>,
    );
    expect(
      screen
        .getByRole("progressbar", { name: "Uso do contexto" })
        .getAttribute("aria-valuenow"),
    ).toBe("25");
    expect(
      screen
        .getByRole("progressbar", { name: "Uso del contexto" })
        .getAttribute("aria-valuenow"),
    ).toBe("50");
  });
});
