import { Button } from "./button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";

export const Default = () => (
  <Card className="w-80">
    <CardHeader>
      <CardTitle>Note Title</CardTitle>
      <CardDescription>Created just now</CardDescription>
    </CardHeader>
    <CardContent>
      <p>This is the content of the note within the Card component.</p>
    </CardContent>
    <CardFooter>
      <Button variant="outline" size="sm">
        Edit
      </Button>
    </CardFooter>
  </Card>
);

export const WithAction = () => (
  <Card className="w-80">
    <CardHeader>
      <CardTitle>Project Planning</CardTitle>
      <CardDescription>Shared with team</CardDescription>
      <CardAction>
        <Button variant="ghost" size="xs">
          Settings
        </Button>
      </CardAction>
    </CardHeader>
    <CardContent>
      <p>Discussion on architecture, roadmaps, and sprint priorities.</p>
    </CardContent>
  </Card>
);
