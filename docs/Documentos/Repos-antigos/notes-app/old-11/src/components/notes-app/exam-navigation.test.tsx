import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SidebarProvider } from "@/components/ui/sidebar";
import type { UseExamNavigationResult } from "@/hooks/use-exam-navigation";
import { ExamNavigation } from "./exam-navigation";

const mockUseExamNavigation = vi.fn<() => UseExamNavigationResult>();

vi.mock("@/hooks/use-exam-navigation", () => ({
  useExamNavigation: () => mockUseExamNavigation(),
}));
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

function renderNavigation() {
  return render(
    <SidebarProvider>
      <ExamNavigation spaceId="space-1" />
    </SidebarProvider>
  );
}

describe("ExamNavigation", () => {
  beforeEach(() => {
    mockUseExamNavigation.mockReturnValue({
      exams: [],
      loading: false,
      error: null,
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("links each exam to its space-scoped feed route", () => {
    mockUseExamNavigation.mockReturnValue({
      exams: [
        { id: "exam-1", title: "Cloud Fundamentals" },
        { id: "exam-2", title: "Security" },
      ],
      loading: false,
      error: null,
    });
    renderNavigation();

    expect(screen.getByText("navLabel")).toBeDefined();
    const link = screen.getByRole("link", { name: "Cloud Fundamentals" });
    expect(link.getAttribute("href")).toBe("/space-1/exams/exam-1");
    expect(
      screen.getByRole("link", { name: "Security" }).getAttribute("href")
    ).toBe("/space-1/exams/exam-2");
  });

  it("shows an empty message when the space has no exams", () => {
    renderNavigation();
    expect(screen.getByText("navEmpty")).toBeDefined();
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("shows an alert when exams fail to load", () => {
    mockUseExamNavigation.mockReturnValue({
      exams: [],
      loading: false,
      error: new Error("offline"),
    });
    renderNavigation();
    expect(screen.getByRole("alert").textContent).toBe("navError");
  });

  it("hides the empty message while loading", () => {
    mockUseExamNavigation.mockReturnValue({
      exams: [],
      loading: true,
      error: null,
    });
    renderNavigation();
    expect(screen.queryByText("navEmpty")).toBeNull();
  });
});
