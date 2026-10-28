import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ArtifactAction } from "./artifact";
import {
  AttachmentHoverCard,
  AttachmentHoverCardContent,
  AttachmentHoverCardTrigger,
} from "./attachments";
import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
} from "./chain-of-thought";
import { Commit, CommitContent, CommitHeader } from "./commit";
import { FileTree, FileTreeFile } from "./file-tree";
import { JSXPreview, useJSXPreview } from "./jsx-preview";
import { MessageAction, MessageBranch, MessageBranchContent, MessageBranchNext, MessageBranchPage } from "./message";
import { PromptInputButton } from "./prompt-input";
import { Question, QuestionOption, QuestionOptions } from "./question";
import { TestResults, TestResultsProgress } from "./test-results";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

function ProcessedJsx() {
  const { processedJsx } = useJSXPreview();
  return <output data-testid="processed-jsx">{processedJsx}</output>;
}

describe("reviewed primitive compositions", () => {
  it("preserves the selected keyed message across reordering and same-size replacement", () => {
    const onBranchChange = vi.fn();
    const renderBranches = (order: string[]) => (
      <MessageBranch onBranchChange={onBranchChange}>
        <MessageBranchContent>
          {order.map((key) => <p key={key} data-testid={key}>{key}</p>)}
        </MessageBranchContent>
        <MessageBranchPage />
        <MessageBranchNext />
      </MessageBranch>
    );
    const view = render(renderBranches(["first", "second"]));
    fireEvent.click(screen.getByRole("button", { name: "Next branch" }));
    expect(screen.getByText("2 of 2")).toBeTruthy();
    view.rerender(renderBranches(["second", "first"]));
    expect(screen.getByText("1 of 2")).toBeTruthy();
    expect(screen.getByTestId("second").parentElement?.className).toContain("block");
    view.rerender(renderBranches(["third", "first"]));
    expect(screen.getByText("1 of 2")).toBeTruthy();
    expect(screen.getByTestId("third").parentElement?.className).toContain("block");
    expect(onBranchChange).toHaveBeenCalledTimes(1);
  });


  it.each([
    ["<div>Text<", "<div>Text</div>"],
    ["<div>Text</", "<div>Text</div>"],
    ["<div>{/* don't */}<span>Text</span></div>", "<div>{/* don't */}<span>Text</span></div>"],
    ["<div>{/* don't <Foo /> */}<span>Text</span></div>", "<div>{/* don't <Foo /> */}<span>Text</span></div>"],
    ["<div><span>Text</div>", "<div><span>Text</span></div>"],
    ['<div>{"<Fake>"}</div>', '<div>{"<Fake>"}</div>'],
    ["<div><!-- <Ignored> --><span>Text", "<div><!-- <Ignored> --><span>Text</span></div>"],
    ['<div><span title="incomplete', "<div></div>"],
  ])("repairs streamed JSX without parsing attribute or expression literals", (input, expected) => {
    render(
      <JSXPreview jsx={input} isStreaming>
        <ProcessedJsx />
      </JSXPreview>,
    );
    expect(screen.getByTestId("processed-jsx").textContent).toBe(expected);
  });


  it("renders finite progress when a test suite is empty", () => {
    const view = render(
      <TestResults summary={{ passed: 0, failed: 0, skipped: 0, total: 0 }}>
        <TestResultsProgress />
      </TestResults>,
    );
    expect(screen.getByText("0%")).toBeTruthy();
    expect(view.container.innerHTML).not.toMatch(/NaN|Infinity/);
  });

  it("uses accessible toggle-button semantics instead of unsupported radio navigation", () => {
    render(
      <Question>
        <QuestionOptions>
          <QuestionOption value="first">First option</QuestionOption>
        </QuestionOptions>
      </Question>,
    );
    const option = screen.getByRole("button", { name: "First option" });
    expect(option.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(option);
    expect(option.getAttribute("aria-pressed")).toBe("true");
  });

  it("supports Space and Enter on a file in a button group without scrolling", () => {
    const onSelect = vi.fn();
    render(
      <FileTree onSelect={onSelect}>
        <FileTreeFile name="readme" path="/readme" />
      </FileTree>,
    );
    const item = screen.getByRole("button", { name: "readme" });
    expect(fireEvent.keyDown(item, { key: " ", cancelable: true })).toBe(false);
    fireEvent.keyDown(item, { key: "Enter" });
    expect(onSelect).toHaveBeenCalledTimes(2);
    expect(onSelect).toHaveBeenCalledWith("/readme");
  });

  it.each([
    {
      name: "message",
      renderAction: (onClick: () => void, disabled: boolean) => (
        <MessageAction tooltip="Copy message" onClick={onClick} disabled={disabled}>
          Copy
        </MessageAction>
      ),
    },
    {
      name: "prompt",
      renderAction: (onClick: () => void, disabled: boolean) => (
        <PromptInputButton tooltip="Attach file" onClick={onClick} disabled={disabled}>
          Attach
        </PromptInputButton>
      ),
    },
  ])("$name tooltip trigger renders a single keyboard-actionable button", ({ renderAction }) => {
    const onClick = vi.fn();
    const view = render(renderAction(onClick, false));
    const button = screen.getByRole("button");
    expect(view.container.querySelectorAll("button")).toHaveLength(1);
    expect(button.querySelector("button")).toBeNull();
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
    view.rerender(renderAction(onClick, true));
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("uses one named tooltip action and preserves single activation and disabled state", () => {
    const onClick = vi.fn();
    const view = render(
      <ArtifactAction tooltip="Export artifact" onClick={onClick}>
        Export
      </ArtifactAction>,
    );
    const button = screen.getByRole("button", { name: /Export artifact/ });
    expect(view.container.querySelectorAll("button")).toHaveLength(1);
    expect(button.querySelector("button")).toBeNull();
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
    view.rerender(
      <ArtifactAction tooltip="Export artifact" onClick={onClick} disabled>
        Export
      </ArtifactAction>,
    );
    fireEvent.click(screen.getByRole("button", { name: /Export artifact/ }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("shares panel IDs across each independent chain and preserves controlled state", () => {
    const onOpenChange = vi.fn();
    const view = render(
      <>
        <ChainOfThought defaultOpen>
          <ChainOfThoughtHeader>First reasoning</ChainOfThoughtHeader>
          <ChainOfThoughtContent>First details</ChainOfThoughtContent>
        </ChainOfThought>
        <ChainOfThought open onOpenChange={onOpenChange}>
          <ChainOfThoughtHeader>Second reasoning</ChainOfThoughtHeader>
          <ChainOfThoughtContent>Second details</ChainOfThoughtContent>
        </ChainOfThought>
      </>,
    );
    const first = screen.getByRole("button", { name: "First reasoning" });
    const second = screen.getByRole("button", { name: "Second reasoning" });
    const firstId = first.getAttribute("aria-controls");
    const secondId = second.getAttribute("aria-controls");
    expect(firstId).toBeTruthy();
    expect(secondId).toBeTruthy();
    expect(firstId).not.toBe(secondId);
    expect(document.getElementById(firstId ?? "")?.textContent).toBe(
      "First details",
    );
    expect(document.getElementById(secondId ?? "")?.textContent).toBe(
      "Second details",
    );
    fireEvent.click(first);
    expect(first.getAttribute("aria-expanded")).toBe("false");
    expect(second.getAttribute("aria-expanded")).toBe("true");
    fireEvent.click(second);
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(second.getAttribute("aria-expanded")).toBe("true");
    expect(
      view.container.querySelectorAll('[data-slot="collapsible"]'),
    ).toHaveLength(2);
  });

  it("makes the non-native commit header a keyboard button", () => {
    render(
      <Commit>
        <CommitHeader>Commit details</CommitHeader>
        <CommitContent>Changed files</CommitContent>
      </Commit>,
    );
    const header = screen.getByRole("button", { name: "Commit details" });
    expect(header.tagName).toBe("DIV");
    expect(header.getAttribute("aria-expanded")).toBe("false");
    fireEvent.keyDown(header, { key: "Enter" });
    expect(header.getAttribute("aria-expanded")).toBe("true");
    const panelId = header.getAttribute("aria-controls");
    expect(document.getElementById(panelId ?? "")?.textContent).toBe(
      "Changed files",
    );
    fireEvent.keyDown(header, { key: " " });
    fireEvent.keyUp(header, { key: " " });
    expect(header.getAttribute("aria-expanded")).toBe("false");
  });

  it.each([undefined, 25])(
    "honors root preview delay and trigger override %s",
    async (triggerDelay) => {
      vi.useFakeTimers();
      const onOpenChange = vi.fn();
      render(
        <AttachmentHoverCard
          openDelay={200}
          closeDelay={80}
          onOpenChange={onOpenChange}
        >
          <AttachmentHoverCardTrigger href="#preview" delay={triggerDelay}>
            Preview attachment
          </AttachmentHoverCardTrigger>
          <AttachmentHoverCardContent>
            Preview contents
          </AttachmentHoverCardContent>
        </AttachmentHoverCard>,
      );
      const trigger = screen.getByRole("link", { name: "Preview attachment" });
      fireEvent.focus(trigger);
      const delay = triggerDelay ?? 200;
      await act(() => vi.advanceTimersByTimeAsync(delay - 1));
      expect(onOpenChange).not.toHaveBeenCalled();
      await act(() => vi.advanceTimersByTimeAsync(1));
      expect(onOpenChange.mock.calls.some(([open]) => open === true)).toBe(
        true,
      );
    },
  );
});
