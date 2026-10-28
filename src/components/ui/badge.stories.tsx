import type { Story, StoryDefault } from "@ladle/react";
import { Badge } from "./badge";

export default { title: "UI / Badge" } satisfies StoryDefault;

const variants = [
  "default",
  "secondary",
  "destructive",
  "outline",
  "ghost",
  "link",
] as const;

export const Variants: Story = () => (
  <div className="flex flex-wrap items-center gap-2">
    {variants.map((variant) => (
      <Badge key={variant} variant={variant}>
        {variant}
      </Badge>
    ))}
  </div>
);
