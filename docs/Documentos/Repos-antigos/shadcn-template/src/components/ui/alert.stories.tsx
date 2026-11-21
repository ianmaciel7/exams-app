import type { Story, StoryDefault } from "@ladle/react";
import { Alert, AlertDescription, AlertTitle } from "./alert";

export default { title: "UI / Alert" } satisfies StoryDefault;

export const Default: Story = () => (
  <Alert>
    <AlertTitle>Heads up</AlertTitle>
    <AlertDescription>
      You can add components to your app with the shadcn CLI.
    </AlertDescription>
  </Alert>
);

export const Destructive: Story = () => (
  <Alert variant="destructive">
    <AlertTitle>Something went wrong</AlertTitle>
    <AlertDescription>
      Your session has expired. Sign in again to continue.
    </AlertDescription>
  </Alert>
);
