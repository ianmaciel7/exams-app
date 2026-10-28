import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
  ProfileCard,
  ProfileCardAction,
  ProfileCardContent,
  ProfileCardDescription,
  ProfileCardFooter,
  ProfileCardHeader,
  ProfileCardTitle,
} from "./profile-card";

describe("ProfileCard", () => {
  afterEach(cleanup);

  it("composes native Card slots and forwards props", () => {
    const header = "Header";
    const content = "Content";
    const footer = "Footer";
    const title = "Title";
    const description = "Description";

    render(
      <ProfileCard
        data-testid="profile-card"
        size="sm"
        className="custom-profile-card"
        aria-label="Profile details"
      >
        <ProfileCardHeader>
          {header}
          <ProfileCardAction aria-label="Profile actions">
            {footer}
          </ProfileCardAction>
          <ProfileCardTitle>{title}</ProfileCardTitle>
          <ProfileCardDescription>{description}</ProfileCardDescription>
        </ProfileCardHeader>
        <ProfileCardContent className="custom-profile-card-content">
          {content}
        </ProfileCardContent>
        <ProfileCardFooter>{footer}</ProfileCardFooter>
      </ProfileCard>,
    );

    const card = screen.getByTestId("profile-card");
    expect(
      card
        .querySelector('[data-slot="card-action"]')
        ?.getAttribute("aria-label"),
    ).toBe("Profile actions");
    expect(card.getAttribute("data-slot")).toBe("card");
    expect(card.getAttribute("data-size")).toBe("sm");
    expect(card.getAttribute("aria-label")).toBe("Profile details");
    expect(card.className).toContain("custom-profile-card");
    expect(card.className).toContain("max-w-sm");
    expect(card.querySelectorAll('[data-slot="card"]')).toHaveLength(0);
    expect(
      card.querySelector('[data-slot="card-header"]')?.textContent,
    ).toContain(header);
    const cardContent = card.querySelector('[data-slot="card-content"]');
    expect(cardContent?.textContent).toBe("Content");
    expect(cardContent?.className).toContain("w-full");
    expect(cardContent?.className).toContain("flex-col");
    expect(cardContent?.className).toContain("gap-4");
    expect(cardContent?.className).toContain("custom-profile-card-content");
    expect(card.querySelector('[data-slot="card-title"]')?.textContent).toBe(
      title,
    );
    expect(
      card.querySelector('[data-slot="card-description"]')?.textContent,
    ).toBe(description);
    const cardFooter = card.querySelector('[data-slot="card-footer"]');
    expect(cardFooter?.textContent).toBe("Footer");
    expect(cardFooter?.className).toContain("w-full");
    expect(cardFooter?.className).toContain("flex-col");
    expect(cardFooter?.className).toContain("gap-4");
  });
});
