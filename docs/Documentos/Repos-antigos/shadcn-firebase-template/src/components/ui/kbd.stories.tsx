import type { Story, StoryDefault } from "@ladle/react";
import { Kbd, KbdGroup } from "./kbd";

export default { title: "UI / Kbd" } satisfies StoryDefault;

export const Single: Story = () => <Kbd>Esc</Kbd>;

export const Shortcut: Story = () => (
  <KbdGroup>
    <Kbd>Ctrl</Kbd>
    <Kbd>K</Kbd>
  </KbdGroup>
);
