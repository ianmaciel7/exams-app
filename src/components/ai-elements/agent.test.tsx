import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { jsonSchema, type Tool } from "ai";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AgentTool, AgentTools } from "./agent";

// Schema conversion is tested against the real AI SDK; syntax rendering has
// its own integration tests and must receive a string at every render.
vi.mock("./code-block", () => ({
  CodeBlock: ({ code }: { code: string }) => <pre>{code.slice(0)}</pre>,
}));

afterEach(cleanup);

function ToolDetails({ tool }: { tool: Tool }) {
  return (
    <AgentTools defaultValue={["schema"]}>
      <AgentTool value="schema" tool={tool} />
    </AgentTools>
  );
}

function deferredSchema() {
  let resolve: (value: { type: "object"; title: string }) => void = () => {};
  let reject: (reason: Error) => void = () => {};
  const promise = new Promise<{ type: "object"; title: string }>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}

describe("AgentTool schema presentation", () => {
  it("resolves a lazy input schema through the supported SDK adapter", async () => {
    const lazy = vi.fn(() => jsonSchema({ type: "object", title: "Lazy input" }));
    render(<ToolDetails tool={{ inputSchema: lazy }} />);
    await waitFor(() => expect(screen.getByText(/"title": "Lazy input"/)).toBeTruthy());
    expect(lazy).toHaveBeenCalled();
  });

  it("keeps a string fallback while an asynchronous JSON schema is loading", async () => {
    const pending = deferredSchema();
    render(<ToolDetails tool={{ inputSchema: jsonSchema(pending.promise) }} />);
    expect(screen.getByText("Loading schema…")).toBeTruthy();
    await act(async () => pending.resolve({ type: "object", title: "Async input" }));
    expect(screen.getByText(/"title": "Async input"/)).toBeTruthy();
  });

  it("renders a safe string when JSON schema conversion rejects", async () => {
    const pending = deferredSchema();
    render(<ToolDetails tool={{ inputSchema: jsonSchema(pending.promise) }} />);
    await act(async () => pending.reject(new Error("Conversion failed")));
    expect(screen.getByText("Schema unavailable")).toBeTruthy();
  });

  it("does not let an obsolete asynchronous schema overwrite a replacement", async () => {
    const old = deferredSchema();
    const { rerender } = render(<ToolDetails tool={{ inputSchema: jsonSchema(old.promise) }} />);
    const current = { inputSchema: jsonSchema({ type: "object", title: "Current input" }) };
    rerender(<ToolDetails tool={current} />);
    await waitFor(() => expect(screen.getByText(/"title": "Current input"/)).toBeTruthy());
    await act(async () => old.resolve({ type: "object", title: "Obsolete input" }));
    expect(screen.queryByText(/Obsolete input/)).toBeNull();
    expect(screen.getByText(/"title": "Current input"/)).toBeTruthy();
  });
});
