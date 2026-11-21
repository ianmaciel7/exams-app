import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BACKEND_UNREACHABLE_EVENT } from "@/lib/error-capture/firebase-logs";
import { reconnectFirestore } from "@/lib/firebase/firestore";
import { ConnectionAlert } from "./connection-alert";

vi.mock("@/components/ui/spinner", () => ({
  Spinner: (props: React.ComponentProps<"svg">) => (
    <svg data-testid="spinner" aria-label="Loading" {...props} />
  ),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => `connection.${key}`,
}));
vi.mock("@/lib/firebase/firestore", () => ({
  reconnectFirestore: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@/lib/error-capture/firebase-logs", () => ({
  BACKEND_UNREACHABLE_EVENT: "app:backend-unreachable",
}));

describe("ConnectionAlert", () => {
  function renderConnectionAlert() {
    return render(<ConnectionAlert />);
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("is not rendered when the connection is healthy", () => {
    renderConnectionAlert();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("shows a persistent alert when the backend is unreachable", () => {
    renderConnectionAlert();

    act(() => {
      window.dispatchEvent(new Event(BACKEND_UNREACHABLE_EVENT));
    });

    expect(screen.queryByRole("alert")).not.toBeNull();
    expect(screen.queryByText("connection.title")).not.toBeNull();
    expect(screen.queryByText("connection.description")).not.toBeNull();
    expect(
      screen.queryByRole("button", { name: "connection.retry" })
    ).not.toBeNull();
  });

  it("forwards className and props to the alert root", () => {
    render(<ConnectionAlert className="custom-class" data-testid="alert" />);

    act(() => {
      window.dispatchEvent(new Event(BACKEND_UNREACHABLE_EVENT));
    });

    const alert = screen.getByTestId("alert");
    expect(alert.className).toContain("custom-class");
    expect(alert.getAttribute("data-slot")).toBe("connection-alert");
  });

  it("calls reconnectFirestore when retry is clicked", async () => {
    renderConnectionAlert();

    act(() => {
      window.dispatchEvent(new Event(BACKEND_UNREACHABLE_EVENT));
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "connection.retry" }));
    });

    expect(reconnectFirestore).toHaveBeenCalledOnce();
  });

  it("shows the retrying state while reconnecting", async () => {
    let resolveReconnect: (() => void) | undefined;
    const reconnectPromise = new Promise<void>((resolve) => {
      resolveReconnect = resolve;
    });
    vi.mocked(reconnectFirestore).mockReturnValueOnce(reconnectPromise);

    renderConnectionAlert();

    act(() => {
      window.dispatchEvent(new Event(BACKEND_UNREACHABLE_EVENT));
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "connection.retry" }));
    });

    const retryButton = screen.getByRole("button", {
      name: /connection\.retrying/,
    });
    expect(retryButton.getAttribute("disabled")).toBe("");
    expect(screen.getByTestId("spinner")).toBeDefined();

    await act(async () => {
      resolveReconnect?.();
      await reconnectPromise;
    });

    expect(
      screen
        .getByRole("button", { name: "connection.retry" })
        .getAttribute("disabled")
    ).toBeNull();
  });

  it("dismisses the alert when the browser comes back online", () => {
    renderConnectionAlert();

    act(() => {
      window.dispatchEvent(new Event(BACKEND_UNREACHABLE_EVENT));
    });
    expect(screen.queryByRole("alert")).not.toBeNull();

    act(() => {
      window.dispatchEvent(new Event("online"));
    });
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("cleans up event listeners on unmount", () => {
    const removeSpy = vi.spyOn(window, "removeEventListener");
    const { unmount } = renderConnectionAlert();

    unmount();

    expect(removeSpy).toHaveBeenCalledWith(
      BACKEND_UNREACHABLE_EVENT,
      expect.any(Function)
    );
    expect(removeSpy).toHaveBeenCalledWith("online", expect.any(Function));
  });
});
