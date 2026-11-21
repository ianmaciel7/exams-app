import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

export const Default = () => (
  <Tabs defaultValue="all" className="w-96">
    <TabsList>
      <TabsTrigger value="all">All Notes</TabsTrigger>
      <TabsTrigger value="favorites">Favorites</TabsTrigger>
      <TabsTrigger value="archived">Archived</TabsTrigger>
    </TabsList>
    <TabsContent value="all" className="rounded-lg border p-4">
      <h3 className="text-sm font-medium">All Notes</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        Viewing all active notes in the workspace.
      </p>
    </TabsContent>
    <TabsContent value="favorites" className="rounded-lg border p-4">
      <h3 className="text-sm font-medium">Favorites</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        Quick access to your starred and pinned notes.
      </p>
    </TabsContent>
    <TabsContent value="archived" className="rounded-lg border p-4">
      <h3 className="text-sm font-medium">Archived</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        Archived notes stored for historical reference.
      </p>
    </TabsContent>
  </Tabs>
);

export const LineVariant = () => (
  <Tabs defaultValue="all" className="w-96">
    <TabsList variant="line">
      <TabsTrigger value="all">All Notes</TabsTrigger>
      <TabsTrigger value="favorites">Favorites</TabsTrigger>
      <TabsTrigger value="archived">Archived</TabsTrigger>
    </TabsList>
    <TabsContent value="all" className="rounded-lg border p-4">
      <p className="text-sm">All Notes content with line indicator style.</p>
    </TabsContent>
    <TabsContent value="favorites" className="rounded-lg border p-4">
      <p className="text-sm">Favorites content with line indicator style.</p>
    </TabsContent>
    <TabsContent value="archived" className="rounded-lg border p-4">
      <p className="text-sm">Archived content with line indicator style.</p>
    </TabsContent>
  </Tabs>
);
