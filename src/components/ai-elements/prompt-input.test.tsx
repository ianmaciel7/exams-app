import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  PromptInput,
  PromptInputProvider,
  usePromptInputAttachments,
  usePromptInputController,
  usePromptInputReferencedSources,
} from "./prompt-input";

function DraftEditor() {
  const { textInput } = usePromptInputController();
  return (
    <input
      aria-label="Draft"
      value={textInput.value}
      onChange={(event) => textInput.setInput(event.target.value)}
    />
  );
}

function AttachmentNames() {
  const { files } = usePromptInputAttachments();
  return (
    <output aria-label="Attachments">
      {files.map((file) => file.filename).join(",")}
    </output>
  );
}

function SourcesEditor() {
  const { add, sources } = usePromptInputReferencedSources();
  return (
    <>
      {(["old", "new"] as const).map((name) => (
        <button
          key={name}
          type="button"
          onClick={() =>
            add({
              type: "source-document",
              sourceId: name,
              mediaType: "text/plain",
              title: name,
            })
          }
        >
          {`Add ${name} source`}
        </button>
      ))}
      <output aria-label="Sources">
        {sources.map((source) => source.title).join(",")}
      </output>
    </>
  );
}

function getForm() {
  const form = screen.getByLabelText("Draft").closest("form");
  if (!form) throw new Error("Draft must belong to a form");
  return form;
}

beforeEach(() => {
  vi.stubGlobal(
    "URL",
    class extends URL {
      static createObjectURL = (file: File) => `blob:${file.name}`;
      static revokeObjectURL = vi.fn();
    },
  );
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({ blob: async () => new Blob(["file"]) })),
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("PromptInput submission ownership", () => {
  it("accepts extension-based file filters regardless of MIME detection", () => {
    render(
      <PromptInput accept=".pdf" onSubmit={async () => {}}>
        <input aria-label="Draft" name="message" defaultValue="" />
        <AttachmentNames />
      </PromptInput>,
    );
    fireEvent.change(screen.getByLabelText("Upload files"), {
      target: { files: [new File(["pdf"], "report.PDF", { type: "" })] },
    });
    expect(screen.getByLabelText("Attachments").textContent).toBe("report.PDF");
  });

  it.each(["next message", "first message"])(
    "keeps a newer provider draft (%s) and attachments",
    async (next) => {
      let finish: () => void = () => {};
      const onSubmit = vi.fn(
        () =>
          new Promise<void>((resolve) => {
            finish = resolve;
          }),
      );
      render(
        <PromptInputProvider initialInput="first message">
          <PromptInput onSubmit={onSubmit}>
            <DraftEditor />
            <AttachmentNames />
          </PromptInput>
        </PromptInputProvider>,
      );
      fireEvent.change(screen.getByLabelText("Upload files"), {
        target: { files: [new File(["old"], "old.txt")] },
      });
      fireEvent.submit(getForm());
      await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
      fireEvent.change(screen.getByLabelText("Draft"), {
        target: { value: "edited" },
      });
      fireEvent.change(screen.getByLabelText("Draft"), {
        target: { value: next },
      });
      fireEvent.change(screen.getByLabelText("Upload files"), {
        target: { files: [new File(["new"], "new.txt")] },
      });
      await act(async () => finish());
      expect((screen.getByLabelText("Draft") as HTMLInputElement).value).toBe(
        next,
      );
      expect(screen.getByLabelText("Attachments").textContent).toBe("new.txt");
    },
  );

  it("clears an unchanged provider draft after success", async () => {
    render(
      <PromptInputProvider initialInput="first message">
        <PromptInput onSubmit={async () => {}}>
          <DraftEditor />
        </PromptInput>
      </PromptInputProvider>,
    );
    await act(async () => fireEvent.submit(getForm()));
    expect((screen.getByLabelText("Draft") as HTMLInputElement).value).toBe("");
  });

  it.each([true, false])(
    "keeps the draft on submission failure (provider: %s)",
    async (provider) => {
      const onSubmit = vi.fn(async () => {
        throw new Error("offline");
      });
      const input = (
        <PromptInput onSubmit={onSubmit}>
          {provider ? (
            <DraftEditor />
          ) : (
            <input
              aria-label="Draft"
              name="message"
              defaultValue="first message"
            />
          )}
          <AttachmentNames />
        </PromptInput>
      );
      render(
        provider ? (
          <PromptInputProvider initialInput="first message">
            {input}
          </PromptInputProvider>
        ) : (
          input
        ),
      );
      fireEvent.change(screen.getByLabelText("Upload files"), {
        target: { files: [new File(["retry"], "retry.txt")] },
      });
      await act(async () => fireEvent.submit(getForm()));
      await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
      expect((screen.getByLabelText("Draft") as HTMLInputElement).value).toBe(
        "first message",
      );
      expect(screen.getByLabelText("Attachments").textContent).toBe(
        "retry.txt",
      );
      expect(URL.revokeObjectURL).not.toHaveBeenCalled();
    },
  );

  it("preserves edits in the uncontrolled editor during a pending submission", async () => {
    let finish: () => void = () => {};
    const onSubmit = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );
    render(
      <PromptInput onSubmit={onSubmit}>
        <input aria-label="Draft" name="message" defaultValue="" />
      </PromptInput>,
    );
    fireEvent.input(screen.getByLabelText("Draft"), {
      target: { value: "first message" },
    });
    fireEvent.submit(getForm());
    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    fireEvent.input(screen.getByLabelText("Draft"), {
      target: { value: "next message" },
    });
    await act(async () => finish());
    expect((screen.getByLabelText("Draft") as HTMLInputElement).value).toBe(
      "next message",
    );
  });

  it("clears only submitted local attachments and referenced sources", async () => {
    let finish: () => void = () => {};
    const onSubmit = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );
    render(
      <PromptInput onSubmit={onSubmit}>
        <input aria-label="Draft" name="message" defaultValue="" />
        <AttachmentNames />
        <SourcesEditor />
      </PromptInput>,
    );
    fireEvent.input(screen.getByLabelText("Draft"), {
      target: { value: "submitted message" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add old source" }));
    fireEvent.change(screen.getByLabelText("Upload files"), {
      target: { files: [new File(["old"], "old.txt")] },
    });
    fireEvent.submit(getForm());
    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    fireEvent.click(screen.getByRole("button", { name: "Add new source" }));
    fireEvent.change(screen.getByLabelText("Upload files"), {
      target: { files: [new File(["new"], "new.txt")] },
    });
    await act(async () => finish());
    expect(screen.getByLabelText("Attachments").textContent).toBe("new.txt");
    expect(screen.getByLabelText("Sources").textContent).toBe("new");
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:old.txt");
    expect(URL.revokeObjectURL).not.toHaveBeenCalledWith("blob:new.txt");
    expect((screen.getByLabelText("Draft") as HTMLInputElement).value).toBe("");
  });
});
