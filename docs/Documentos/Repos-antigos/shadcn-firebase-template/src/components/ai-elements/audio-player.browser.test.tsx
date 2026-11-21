import { expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import {
  AudioPlayerPlayButton,
  AudioPlayerSeekBackwardButton,
  AudioPlayerSeekForwardButton,
} from "./audio-player";

const controls = [
  {
    name: "play",
    component: AudioPlayerPlayButton,
    event: "mediapauserequest",
  },
  {
    name: "backward",
    component: AudioPlayerSeekBackwardButton,
    event: "mediaseekrequest",
  },
  {
    name: "forward",
    component: AudioPlayerSeekForwardButton,
    event: "mediaseekrequest",
  },
] as const;

for (const { name, component: Control, event } of controls) {
  test(`${name} emits exactly one media request for each pointer or keyboard activation`, async () => {
    const screen = await render(
      <Control data-testid="control" className="consumer-class" />,
    );
    const locator = screen.getByTestId("control");
    const element = locator.element();
    const requested = vi.fn();
    element.addEventListener(event, requested);

    await expect.element(locator).toHaveAttribute("role", "button");
    expect(element.tagName.toLowerCase()).toMatch(/^media-/);
    expect(element.classList.contains("consumer-class")).toBe(true);
    expect(element.classList.contains("border")).toBe(true);
    expect(element.getAttribute("data-slot")).toBe(
      `audio-player-${name === "play" ? "play" : `seek-${name}`}-button`,
    );

    await locator.click();
    expect(requested).toHaveBeenCalledTimes(1);
    element.focus();
    await expect.element(locator).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(requested).toHaveBeenCalledTimes(2);
    await userEvent.keyboard(" ");
    expect(requested).toHaveBeenCalledTimes(3);
  });
}

test("seek controls preserve offsets and suppress requests when disabled", async () => {
  const screen = await render(
    <>
      <AudioPlayerSeekBackwardButton
        data-testid="back"
        seekOffset={15}
        mediaCurrentTime={50}
      />
      <AudioPlayerSeekForwardButton
        data-testid="forward"
        seekOffset={20}
        mediaCurrentTime={50}
      />
      <AudioPlayerPlayButton data-testid="disabled" disabled />
    </>,
  );
  for (const [id, expected] of [
    ["back", 35],
    ["forward", 70],
  ] as const) {
    const control = screen.getByTestId(id);
    const requested = vi.fn();
    control.element().addEventListener("mediaseekrequest", requested);
    await control.click();
    expect(requested).toHaveBeenCalledTimes(1);
    expect(requested.mock.calls[0][0].detail).toBe(expected);
  }
  const disabled = screen.getByTestId("disabled");
  const requested = vi.fn();
  disabled.element().addEventListener("mediapauserequest", requested);
  await disabled.click({ force: true });
  expect(requested).not.toHaveBeenCalled();
  expect(disabled.element().tabIndex).toBe(-1);
});
