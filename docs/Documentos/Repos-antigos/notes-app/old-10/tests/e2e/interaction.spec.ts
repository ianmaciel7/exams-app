import { expect, test } from "@playwright/test";
import { createObject, createSpace, ensure, signUp, visit } from "./helpers";

// spec.md 5.5 records a real prior defect where focus stayed on an offscreen
// control after a surface closed, and names it a required regression case.
test("closing a transient surface returns focus to its opener", async ({
  page,
}) => {
  await signUp(page);
  await createSpace(page, "Focus");
  await visit(page, "/space");

  const palette = page.getByPlaceholder("Search objects, or jump to a section");
  await page.getByRole("button", { name: "Search space" }).click();
  await expect(palette).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(palette).toBeHidden();
  await expect(
    page.getByRole("button", { name: "Search space" }),
  ).toBeFocused();

  const dialog = page.getByRole("heading", { name: "Add to your Space" });
  await page.getByRole("button", { name: "New object" }).click();
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(page.getByRole("button", { name: "New object" })).toBeFocused();
});

test("the mobile drawer traps then restores focus", async ({ page }) => {
  // Set up at desktop width: at mobile width the sidebar is hidden, so the
  // Space switcher the other helpers drive is not reachable.
  await signUp(page);
  await createSpace(page, "Drawer");
  await page.setViewportSize({ width: 600, height: 900 });
  await page.goto("/space");

  const opener = page.getByRole("button", { name: "Open navigation" });
  const drawer = page.getByRole("complementary", {
    name: "Space navigation",
  });
  await ensure(drawer, () => opener.click());
  await expect(drawer).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(drawer).toBeHidden();
  // Not left on a control that is now offscreen.
  await expect(opener).toBeFocused();
});

test("the desktop sidebar collapses, persists across reload, and answers to [", async ({
  page,
}) => {
  await signUp(page);
  await createSpace(page, "Collapse");
  await visit(page, "/space");

  const nav = page.getByRole("complementary", { name: "Space navigation" });
  const toggle = page.getByRole("button", { name: "Hide navigation" });
  await expect(nav).toBeVisible();
  await expect(toggle).toBeVisible();

  // Click collapses it, and the toggle's own label/expanded state flips.
  await toggle.click();
  await expect(nav).toBeHidden();
  const show = page.getByRole("button", { name: "Show navigation" });
  await expect(show).toBeVisible();
  await expect(show).toHaveAttribute("aria-expanded", "false");

  // Desktop collapse persists across a reload (spec.md §5.4 "Persistence"),
  // unlike the mobile drawer's `navOpen`, which is never durable. This is
  // read server-side (requireSnapshot -> data.sidebarCollapsed), true from
  // SSR HTML alone — no client JS/hydration required for this assertion.
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Show navigation" }),
  ).toBeVisible();
  await expect(nav).toBeHidden();

  // Re-expand through a real click (not the keyboard) first: this is also a
  // hydration probe (`ensure` retries until the click handler actually
  // fires), which a reload needs before any keyboard shortcut can be trusted.
  await ensure(nav, () =>
    page.getByRole("button", { name: "Show navigation" }).click(),
  );
  await expect(
    page.getByRole("button", { name: "Hide navigation" }),
  ).toBeVisible();

  // `[` is the side-aware shortcut for the left (this) sidebar; it must not
  // fire while an editable field has focus.
  await page.keyboard.press("ControlOrMeta+k");
  const palette = page.getByPlaceholder("Search objects, or jump to a section");
  await expect(palette).toBeVisible();
  await palette.press("["); // real keydown, targeted at the query input
  await expect(palette).toHaveValue("[");
  // The open dialog marks the rest of the page inert, so `nav` cannot be
  // queried by role until it closes — close it, then confirm the shortcut
  // was suppressed rather than merely hidden from the a11y tree meanwhile.
  await page.keyboard.press("Escape");
  await expect(palette).toBeHidden();
  await expect(nav).toBeVisible(); // suppressed: focus was in the query input

  await page.keyboard.press("[");
  await expect(nav).toBeHidden();
  await expect(
    page.getByRole("button", { name: "Show navigation" }),
  ).toBeVisible();
});

// spec.md §5.4 "Sections and nesting": group labels can collapse, nested
// groups own their own highlight scope, and disclosure is keyboard-operable
// with a stateful aria-expanded — independently of any other group's state
// or of which row inside is currently active.
test("sidebar nav sections collapse independently with stateful aria-expanded", async ({
  page,
}) => {
  await signUp(page);
  await createSpace(page, "Sections");
  await visit(page, "/space");

  const workspaceGroup = page.getByRole("button", { name: "Workspace" });
  const practiceGroup = page.getByRole("button", { name: "Practice" });
  await expect(workspaceGroup).toHaveAttribute("aria-expanded", "true");
  await expect(practiceGroup).toHaveAttribute("aria-expanded", "true");

  // Exact: the Overview page also has a "Start a study session" link, whose
  // accessible name would otherwise substring-match "Study session".
  const overview = page.getByRole("link", { name: "Overview", exact: true });
  const study = page.getByRole("link", {
    name: "Study session",
    exact: true,
  });
  await expect(overview).toBeVisible();
  await expect(overview).toHaveAttribute("aria-current", "page");
  await expect(study).toBeVisible();

  // Collapsing one section never touches the other's expanded state, and the
  // active row's aria-current survives the round trip.
  await workspaceGroup.click();
  await expect(workspaceGroup).toHaveAttribute("aria-expanded", "false");
  await expect(overview).toBeHidden();
  await expect(practiceGroup).toHaveAttribute("aria-expanded", "true");
  await expect(study).toBeVisible();

  await workspaceGroup.click();
  await expect(workspaceGroup).toHaveAttribute("aria-expanded", "true");
  await expect(overview).toBeVisible();
  await expect(overview).toHaveAttribute("aria-current", "page");
});

// spec.md §5.4 "Resize limits": bounded 160-360px, dragging past the minimum
// collapses, and there is a keyboard-accessible alternative to dragging.
test("the sidebar rail drags to resize within bounds, collapses past the minimum, and answers to arrow keys", async ({
  page,
}) => {
  await signUp(page);
  await createSpace(page, "Resize");
  await visit(page, "/space");

  const nav = page.getByRole("complementary", { name: "Space navigation" });
  const handle = page.getByRole("separator", {
    name: "Resize navigation width",
  });
  await expect(handle).toHaveAttribute("aria-valuenow", "240");

  // Dragging right is bounded at the documented 360px maximum.
  let box = await handle.boundingBox();
  if (!box) throw new Error("resize handle has no bounding box");
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + 400, box.y + box.height / 2, { steps: 10 });
  await page.mouse.up();
  await expect(handle).toHaveAttribute("aria-valuenow", "360");
  const widened = await nav.boundingBox();
  expect(widened?.width).toBeGreaterThan(300);

  // The dragged width persists across a reload, the same way the desktop
  // collapse cookie does (spec.md §5.4 "Persistence") — read server-side via
  // requireSnapshot() -> data.sidebarWidth, so first paint already reflects
  // it (true from SSR HTML alone, like the collapse cookie above) rather
  // than resetting to the 240px default.
  const cookieAfterDrag = await page.evaluate(() => document.cookie);
  expect(cookieAfterDrag).toContain("sidebar_width=360");
  await page.reload();
  await expect(handle).toHaveAttribute("aria-valuenow", "360");
  const reloadedWidth = await nav.boundingBox();
  expect(reloadedWidth?.width).toBeGreaterThan(300);

  // Dragging past the documented 160px minimum collapses the rail instead of
  // clamping at the floor.
  box = await handle.boundingBox();
  if (!box) throw new Error("resize handle has no bounding box");
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x - 400, box.y + box.height / 2, { steps: 10 });
  await page.mouse.up();
  await expect(nav).toBeHidden();
  const show = page.getByRole("button", { name: "Show navigation" });
  await expect(show).toBeVisible();

  // Re-expand, then use the keyboard-accessible alternative to dragging.
  await show.click();
  await expect(nav).toBeVisible();
  await handle.focus();
  await expect(handle).toBeFocused();
  await page.keyboard.press("Home");
  await expect(handle).toHaveAttribute("aria-valuenow", "160");
  await page.keyboard.press("ArrowRight");
  await expect(handle).toHaveAttribute("aria-valuenow", "176");
  await page.keyboard.press("End");
  await expect(handle).toHaveAttribute("aria-valuenow", "360");

  // Arrow keys back down to a distinct, non-default width, and that also
  // persists — the keyboard alternative writes the same cookie as dragging.
  await page.keyboard.press("ArrowLeft");
  await expect(handle).toHaveAttribute("aria-valuenow", "344");
  const cookieAfterKeyboard = await page.evaluate(() => document.cookie);
  expect(cookieAfterKeyboard).toContain("sidebar_width=344");
  await page.reload();
  await expect(handle).toHaveAttribute("aria-valuenow", "344");
});

// spec.md §5.4 "Collapse and peek": peek is a floating overlay, separate from
// the durable `open` state, dismissed by Escape or an outside press, and it
// must never write the persistence cookie.
test("hovering the collapsed toggle peeks the sidebar without persisting it, and Escape dismisses the peek", async ({
  page,
}) => {
  await signUp(page);
  await createSpace(page, "Peek");
  await visit(page, "/space");

  const nav = page.getByRole("complementary", { name: "Space navigation" });
  await page.getByRole("button", { name: "Hide navigation" }).click();
  await expect(nav).toBeHidden();
  const show = page.getByRole("button", { name: "Show navigation" });
  await expect(show).toBeVisible();
  await expect(show).toHaveAttribute("aria-expanded", "false");

  const cookieBefore = await page.evaluate(() => document.cookie);
  expect(cookieBefore).toContain("sidebar_state=true");

  await show.hover();
  await expect(nav).toBeVisible();
  await expect(show).toHaveAttribute("aria-expanded", "true");

  // A peek is transient view state; it never pins or writes the cookie.
  const cookieDuringPeek = await page.evaluate(() => document.cookie);
  expect(cookieDuringPeek).toContain("sidebar_state=true");

  await page.keyboard.press("Escape");
  await expect(nav).toBeHidden();
  await expect(show).toBeFocused();

  // A reload proves the peek never became durable state.
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Show navigation" }),
  ).toBeVisible();
  await expect(nav).toBeHidden();
});

// spec.md 5.3 / globals.css: reduced motion keeps the final state and drops
// the transition rather than disabling the interaction.
test("the sidebar collapse stays functionally correct under prefers-reduced-motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await signUp(page);
  await createSpace(page, "Motion");
  await visit(page, "/space");

  const nav = page.getByRole("complementary", { name: "Space navigation" });
  await page.getByRole("button", { name: "Hide navigation" }).click();
  await expect(nav).toBeHidden();
  await expect(
    page.getByRole("button", { name: "Show navigation" }),
  ).toBeVisible();

  // getComputedStyle always serializes CSS time values in seconds (e.g.
  // "1e-05s" for the 0.01ms override), unlike the author-written unit — parse
  // it numerically rather than matching a unit-specific string.
  const duration = await page.evaluate(() => {
    const shell = document.querySelector<HTMLElement>('[style*="--sidebar-w"]');
    return shell ? getComputedStyle(shell).transitionDuration : null;
  });
  expect(duration).not.toBeNull();
  expect(Number.parseFloat(duration ?? "1")).toBeLessThan(0.001);
});

test("the context panel answers to the side-aware ] shortcut", async ({
  page,
}) => {
  await signUp(page);
  await createSpace(page, "Bracket");
  // createObject already leaves the page on /question/<noteId>, hydrated
  // (it just drove several real clicks to get there) — no extra navigation
  // needed, which would reopen the hydration race the sidebar test above
  // works around explicitly.
  await createObject(page, {
    kind: "note",
    title: "Bracket note",
    text: "Toggled by keyboard.",
  });

  const tabs = page.getByRole("tablist", { name: "Context panel" });
  await expect(tabs).toBeVisible();

  await page.keyboard.press("]");
  await expect(tabs).toBeHidden();
  const restore = page.getByRole("button", { name: "Show context panel" });
  await expect(restore).toBeFocused();

  await page.keyboard.press("]");
  await expect(tabs).toBeVisible();
});

test("Mod+P opens the same command dialog as Mod+K", async ({ page }) => {
  await signUp(page);
  await createSpace(page, "Shortcuts");
  await visit(page, "/space");

  const palette = page.getByPlaceholder("Search objects, or jump to a section");
  await page.keyboard.press("ControlOrMeta+p");
  await expect(palette).toBeVisible();
  // One dialog, centered — never a second competing surface (spec.md 5.5).
  await expect(page.getByRole("dialog")).toHaveCount(1);
  await page.keyboard.press("Escape");
  await expect(palette).toBeHidden();

  await page.keyboard.press("ControlOrMeta+k");
  await expect(palette).toBeVisible();
});

test("the palette moves through results with the keyboard alone", async ({
  page,
}) => {
  await signUp(page);
  await createSpace(page, "Keyboard");
  const noteId = await createObject(page, {
    kind: "note",
    title: "Keyboard reachable note",
    text: "Reachable without a pointer.",
  });
  await visit(page, "/space");

  await page.keyboard.press("ControlOrMeta+k");
  await page
    .getByPlaceholder("Search objects, or jump to a section")
    .fill("Keyboard reachable");
  await expect(page.getByRole("option")).toHaveCount(1);
  await page.keyboard.press("Enter");
  await page.waitForURL(`**/question/${noteId}`);
});

test("the context panel is a semantic tablist and collapses reversibly", async ({
  page,
}) => {
  await signUp(page);
  await createSpace(page, "Context");
  const noteId = await createObject(page, {
    kind: "note",
    title: "Target note",
    text: "Linked from a question.",
  });
  await createObject(page, {
    kind: "question",
    title: "Which note?",
    text: "Points at the note.",
    options: "a\nb",
    answers: "a",
    links: [noteId],
  });
  await page.goto(`/question/${noteId}`);

  const tabs = page.getByRole("tablist", { name: "Context panel" });
  await expect(tabs).toBeVisible();
  await expect(page.getByRole("tab")).toHaveCount(3);
  await expect(page.getByRole("tab", { name: /Links/ })).toHaveAttribute(
    "aria-selected",
    "true",
  );

  // Arrow keys move within the tablist, Enter activates (spec.md 5.5).
  await page.getByRole("tab", { name: /Links/ }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: /Backlinks/ })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("tabpanel").getByRole("link", { name: "Which note?" }),
  ).toBeVisible();

  // Selecting a tab is view state: the object is untouched.
  await page.reload();
  await expect(page.getByRole("tab", { name: /Links/ })).toHaveAttribute(
    "aria-selected",
    "true",
  );

  const hide = page.getByRole("button", { name: "Hide context panel" });
  await hide.click();
  await expect(tabs).toBeHidden();
  const restore = page.getByRole("button", { name: "Show context panel" });
  await expect(restore).toBeFocused();
  await restore.click();
  await expect(tabs).toBeVisible();
});

test("open object views persist, restore on reload, and close without deleting", async ({
  page,
}) => {
  await signUp(page);
  await createSpace(page, "Tabs");
  const first = await createObject(page, {
    kind: "note",
    title: "First note",
    text: "One.",
  });
  const second = await createObject(page, {
    kind: "note",
    title: "Second note",
    text: "Two.",
  });

  const strip = page.getByLabel("Open objects");
  await expect(
    strip.getByRole("button", { name: "First note", exact: true }),
  ).toBeVisible();
  await expect(
    strip.getByRole("button", { name: "Second note", exact: true }),
  ).toBeVisible();

  // A restored tab reopens the same object identity (spec.md 5.5).
  await page.reload();
  await expect(
    strip.getByRole("button", { name: "First note", exact: true }),
  ).toBeVisible();
  await strip
    .getByRole("button", { name: "First note", exact: true })
    .first()
    .click();
  await page.waitForURL(`**/question/${first}`);

  // Closing the active tab selects a successor deterministically.
  await strip.getByRole("button", { name: "Close First note" }).click();
  await page.waitForURL(`**/question/${second}`);
  await expect(
    strip.getByRole("button", { name: "First note", exact: true }),
  ).toHaveCount(0);

  // The object itself is untouched by closing its view.
  await visit(page, "/question");
  await expect(page.getByRole("link", { name: "First note" })).toBeVisible();
  await page.goto(`/question/${first}`);
  await expect(page.getByRole("heading", { name: "First note" })).toBeVisible();
});

// spec.md §5.4 "Row actions": "Actions reveal on the row's own hover/focus...
// and do not appear because a child button is hovered." The open-tabs strip
// is this contract's one existing row-action; prove the gutter is reserved
// (opacity, not display) and scoped per row rather than shared.
test("a tab's close action reveals on its own row's hover/focus, not a sibling's", async ({
  page,
}) => {
  await signUp(page);
  await createSpace(page, "RowActions");
  await createObject(page, { kind: "note", title: "Row A", text: "A." });
  await createObject(page, { kind: "note", title: "Row B", text: "B." });

  const strip = page.getByLabel("Open objects");
  const closeA = strip.getByRole("button", { name: "Close Row A" });
  const closeB = strip.getByRole("button", { name: "Close Row B" });

  // Hidden via opacity (the gutter stays reserved), not unmounted.
  await expect(closeA).toHaveCSS("opacity", "0");
  await expect(closeB).toHaveCSS("opacity", "0");

  await strip.getByRole("button", { name: "Row B", exact: true }).hover();
  await expect(closeB).toHaveCSS("opacity", "1");
  await expect(closeA).toHaveCSS("opacity", "0"); // not cross-triggered

  // A real Tab keypress (not a programmatic .focus(), which Chromium may not
  // treat as keyboard modality right after a mouse hover) proves the
  // :focus-visible reveal.
  await strip.getByRole("button", { name: "Row A", exact: true }).focus();
  await page.keyboard.press("Tab");
  await expect(closeA).toBeFocused();
  await expect(closeA).toHaveCSS("opacity", "1");
});
