import { act, renderHook } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useIsMobile } from "./use-mobile";

type MediaQueryListener = (event: MediaQueryListEvent) => void;

const listeners = new Set<MediaQueryListener>();

function setViewportWidth(width: number) {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    value: width,
  });

  for (const listener of listeners) {
    listener(new Event("change") as MediaQueryListEvent);
  }
}

beforeEach(() => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation(
      (query: string): MediaQueryList => ({
        addEventListener: (
          _type: string,
          listener: EventListenerOrEventListenerObject | null,
        ) => {
          if (typeof listener === "function") {
            listeners.add(listener as unknown as MediaQueryListener);
          }
        },
        addListener: vi.fn(),
        dispatchEvent: vi.fn(),
        matches: false,
        media: query,
        onchange: null,
        removeEventListener: (
          _type: string,
          listener: EventListenerOrEventListenerObject | null,
        ) => {
          if (typeof listener === "function") {
            listeners.delete(listener as unknown as MediaQueryListener);
          }
        },
        removeListener: vi.fn(),
      }),
    ),
  );
});

afterEach(() => {
  listeners.clear();
  vi.unstubAllGlobals();
});

describe("useIsMobile", () => {
  it("reflects the viewport width and updates after a media-query change", () => {
    setViewportWidth(767);
    const { result } = renderHook(() => useIsMobile());

    expect(result.current).toBe(true);

    act(() => {
      setViewportWidth(768);
    });

    expect(result.current).toBe(false);
  });

  it("queries the media list just below the 768px breakpoint", () => {
    renderHook(() => useIsMobile());

    expect(window.matchMedia).toHaveBeenCalledWith("(max-width: 767px)");
  });

  it("stops listening for changes when it unmounts", () => {
    const { unmount } = renderHook(() => useIsMobile());

    expect(listeners.size).toBe(1);

    unmount();

    expect(listeners.size).toBe(0);
  });

  it("renders the desktop layout on the server, which has no viewport", () => {
    function Probe() {
      return <span>{String(useIsMobile())}</span>;
    }

    setViewportWidth(500);

    expect(renderToString(<Probe />)).toContain("false");
  });
});
