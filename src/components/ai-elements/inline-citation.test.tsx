import { cleanup, render, screen } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/components/ui/hover-card", () => ({
  HoverCard: ({ children }: PropsWithChildren) => <div>{children}</div>,
  HoverCardContent: ({ children }: PropsWithChildren) => <div>{children}</div>,
  HoverCardTrigger: ({ children }: PropsWithChildren) => <span>{children}</span>,
}));

import { InlineCitationCardTrigger } from "./inline-citation";

afterEach(cleanup);

describe("InlineCitationCardTrigger", () => {
  it.each([
    ["https://example.test/article", "example.test"],
    ["/relative/path", "unknown"],
    ["not a valid URL", "unknown"],
    ["", "unknown"],
  ])("renders a safe label for %s", (url, label) => {
    render(<InlineCitationCardTrigger sources={[url]} />);
    expect(screen.getByText(label)).toBeTruthy();
  });
});
