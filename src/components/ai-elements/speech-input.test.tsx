import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import type { ComponentProps } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SpeechInput } from "./speech-input";

vi.mock("@/components/ui/button", () => ({
  Button: (props: ComponentProps<"button">) => (
    <button type="button" {...props} />
  ),
}));

class TestRecorder extends EventTarget {
  static instances: TestRecorder[] = [];
  static failure: "constructor" | "start" | null = null;
  state: RecordingState = "inactive";
  constructor() {
    super();
    if (TestRecorder.failure === "constructor") throw new Error("unsupported");
    TestRecorder.instances.push(this);
  }
  start() {
    if (TestRecorder.failure === "start") throw new Error("cannot start");
    this.state = "recording";
  }
  stop() {
    this.state = "inactive";
    this.dispatchEvent(new Event("stop"));
  }
}

const getUserMedia = vi.fn();

beforeEach(() => {
  getUserMedia.mockReset();
  TestRecorder.instances = [];
  TestRecorder.failure = null;
  vi.stubGlobal("MediaRecorder", TestRecorder);
  vi.stubGlobal(
    "navigator",
    Object.assign(Object.create(navigator), { mediaDevices: { getUserMedia } }),
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("SpeechInput recording lifetime", () => {
  it("names the recording control without caller-provided labels", () => {
    render(<SpeechInput onAudioRecorded={async () => ""} />);
    expect(screen.getByRole("button", { name: "Start recording" })).toBeTruthy();
  });
  it("releases a permission result that arrives after unmount", async () => {
    let grant: (stream: unknown) => void = () => {};
    const stop = vi.fn();
    getUserMedia.mockReturnValue(
      new Promise((resolve) => {
        grant = resolve;
      }),
    );
    const { unmount } = render(
      <SpeechInput onAudioRecorded={async () => ""} />,
    );
    fireEvent.click(screen.getByRole("button"));
    unmount();
    await act(async () => grant({ getTracks: () => [{ stop }] }));
    expect(stop).toHaveBeenCalledOnce();
    expect(TestRecorder.instances).toHaveLength(0);
  });

  it.each(["constructor", "start"] as const)(
    "releases tracks if recorder %s fails",
    async (failure) => {
      const stop = vi.fn();
      getUserMedia.mockResolvedValue({ getTracks: () => [{ stop }] });
      TestRecorder.failure = failure;
      render(<SpeechInput onAudioRecorded={async () => ""} />);
      await act(async () => fireEvent.click(screen.getByRole("button")));
      expect(stop).toHaveBeenCalled();
    },
  );

  it("does not start multiple permission requests while one is pending", () => {
    getUserMedia.mockReturnValue(new Promise(() => {}));
    render(<SpeechInput onAudioRecorded={async () => ""} />);
    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByRole("button"));
    expect(getUserMedia).toHaveBeenCalledOnce();
  });

  it("stops an active recording on unmount without submitting its audio", async () => {
    const stop = vi.fn();
    const onAudioRecorded = vi.fn(async () => "transcript");
    getUserMedia.mockResolvedValue({ getTracks: () => [{ stop }] });
    const { unmount } = render(
      <SpeechInput onAudioRecorded={onAudioRecorded} />,
    );
    await act(async () => fireEvent.click(screen.getByRole("button")));
    const recorder = TestRecorder.instances[0];
    const event = new Event("dataavailable");
    Object.defineProperty(event, "data", { value: new Blob(["audio"]) });
    recorder.dispatchEvent(event);

    unmount();

    expect(recorder.state).toBe("inactive");
    expect(stop).toHaveBeenCalled();
    expect(onAudioRecorded).not.toHaveBeenCalled();
  });

  it("allows retry after microphone permission is rejected", async () => {
    const stop = vi.fn();
    getUserMedia
      .mockRejectedValueOnce(new Error("Permission denied"))
      .mockResolvedValueOnce({ getTracks: () => [{ stop }] });
    render(<SpeechInput onAudioRecorded={async () => ""} />);

    await act(async () => fireEvent.click(screen.getByRole("button")));
    expect(TestRecorder.instances).toHaveLength(0);
    await act(async () => fireEvent.click(screen.getByRole("button")));

    expect(getUserMedia).toHaveBeenCalledTimes(2);
    expect(TestRecorder.instances[0].state).toBe("recording");
  });

  it("delivers a current recording's transcription and releases its tracks", async () => {
    const stop = vi.fn();
    const onTranscriptionChange = vi.fn();
    const onAudioRecorded = vi.fn(async () => "current transcript");
    getUserMedia.mockResolvedValue({ getTracks: () => [{ stop }] });
    render(
      <SpeechInput
        onAudioRecorded={onAudioRecorded}
        onTranscriptionChange={onTranscriptionChange}
      />,
    );
    await act(async () => fireEvent.click(screen.getByRole("button")));
    const recorder = TestRecorder.instances[0];
    const event = new Event("dataavailable");
    Object.defineProperty(event, "data", { value: new Blob(["audio"]) });
    recorder.dispatchEvent(event);

    await act(async () => fireEvent.click(screen.getByRole("button")));

    expect(onAudioRecorded).toHaveBeenCalledOnce();
    expect(onTranscriptionChange).toHaveBeenCalledWith("current transcript");
    expect(stop).toHaveBeenCalled();
    expect((screen.getByRole("button") as HTMLButtonElement).disabled).toBe(
      false,
    );
  });

  it("ignores a late transcription after unmount", async () => {
    const stop = vi.fn();
    let finish: (value: string) => void = () => {};
    const onTranscriptionChange = vi.fn();
    const onAudioRecorded = vi.fn(
      () =>
        new Promise<string>((resolve) => {
          finish = resolve;
        }),
    );
    getUserMedia.mockResolvedValue({ getTracks: () => [{ stop }] });
    const { unmount } = render(
      <SpeechInput
        onAudioRecorded={onAudioRecorded}
        onTranscriptionChange={onTranscriptionChange}
      />,
    );
    await act(async () => fireEvent.click(screen.getByRole("button")));
    const recorder = TestRecorder.instances[0];
    const event = new Event("dataavailable");
    Object.defineProperty(event, "data", { value: new Blob(["audio"]) });
    recorder.dispatchEvent(event);
    await act(async () => fireEvent.click(screen.getByRole("button")));
    expect(onAudioRecorded).toHaveBeenCalledOnce();
    expect(stop).toHaveBeenCalled();
    unmount();
    await act(async () => finish("obsolete transcript"));
    expect(onTranscriptionChange).not.toHaveBeenCalled();
  });
});
