import { Input } from "./input";

export const Default = () => (
  <div className="flex max-w-sm flex-col gap-4 p-4">
    <Input placeholder="Enter note title..." />
  </div>
);

export const States = () => (
  <div className="flex max-w-sm flex-col gap-4 p-4">
    <div>
      <span className="text-xs text-muted-foreground">Default</span>
      <Input placeholder="Standard input" />
    </div>
    <div>
      <span className="text-xs text-muted-foreground">Disabled</span>
      <Input disabled value="Read only value" />
    </div>
    <div>
      <span className="text-xs text-muted-foreground">Invalid</span>
      <Input aria-invalid="true" defaultValue="Invalid text" />
    </div>
  </div>
);
