import type { Story, StoryDefault } from "@ladle/react";
import { Button } from "./button";

export default { title: "UI / Button" } satisfies StoryDefault;

const variants = [
  "default",
  "outline",
  "secondary",
  "ghost",
  "destructive",
  "link",
] as const;

const sizes = ["xs", "sm", "default", "lg"] as const;

export const Variants: Story = () => (
  <div className="flex flex-wrap items-center gap-2">
    {variants.map((variant) => (
      <Button key={variant} variant={variant}>
        {variant}
      </Button>
    ))}
  </div>
);

export const Sizes: Story = () => (
  <div className="flex flex-wrap items-center gap-2">
    {sizes.map((size) => (
      <Button key={size} size={size}>
        {size}
      </Button>
    ))}
  </div>
);

export const Disabled: Story = () => (
  <div className="flex flex-wrap items-center gap-2">
    {variants.map((variant) => (
      <Button key={variant} variant={variant} disabled>
        {variant}
      </Button>
    ))}
  </div>
);

export const Playground: Story<{
  label: string;
  variant: (typeof variants)[number];
  size: (typeof sizes)[number];
  disabled: boolean;
}> = ({ label, variant, size, disabled }) => (
  <Button variant={variant} size={size} disabled={disabled}>
    {label}
  </Button>
);

Playground.args = { label: "Button", disabled: false };
Playground.argTypes = {
  variant: { options: [...variants], control: { type: "select" } },
  size: { options: [...sizes], control: { type: "select" } },
};
