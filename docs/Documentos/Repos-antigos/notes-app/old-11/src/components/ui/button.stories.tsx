import { Button } from "./button";

export const Default = () => <Button>Button</Button>;

export const Variants = () => (
  <div className="flex flex-wrap items-center gap-3 p-6">
    <Button>Default</Button>

    <Button variant="secondary">Secondary</Button>

    <Button variant="outline">Outline</Button>

    <Button variant="ghost">Ghost</Button>

    <Button variant="destructive">Destructive</Button>

    <Button variant="link">Link</Button>
  </div>
);
