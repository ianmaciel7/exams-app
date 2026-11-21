import { Button } from "./button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import { Input } from "./input";

export const Default = () => (
  <Dialog>
    <DialogTrigger render={<Button>Open Dialog</Button>} />
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edit Note</DialogTitle>
        <DialogDescription>
          Make changes to your note here. Click save when you're done.
        </DialogDescription>
      </DialogHeader>
      <div className="flex flex-col gap-2 py-2">
        <label htmlFor="title" className="text-sm font-medium">
          Title
        </label>
        <Input id="title" defaultValue="Weekly Sprint Notes" />
      </div>
      <DialogFooter>
        <DialogClose render={<Button variant="outline">Cancel</Button>} />
        <Button type="button">Save changes</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export const ExplicitPortalAndOverlay = () => (
  <Dialog>
    <DialogTrigger
      render={<Button variant="secondary">Open Custom Portal Dialog</Button>}
    />
    <DialogPortal>
      <DialogOverlay />
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Custom Portal Dialog</DialogTitle>
          <DialogDescription>
            This story explicitly uses DialogPortal and DialogOverlay.
          </DialogDescription>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Explicit portal and overlay composition for advanced dialog layouts.
        </p>
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Close</Button>} />
        </DialogFooter>
      </DialogContent>
    </DialogPortal>
  </Dialog>
);
