"use client";

import { Check, ChevronsUpDown, Plus, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { type ComponentProps, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Empty, EmptyDescription, EmptyHeader } from "@/components/ui/empty";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { SpaceIcon } from "@/lib/space-icons";
import type { Space } from "@/types/space";

type SpaceSwitcherProps = Omit<
  ComponentProps<typeof SidebarMenu>,
  "onSelect"
> & {
  activeSpace?: Space;
  onCreate: () => void;
  onSelect: (spaceId: string) => void;
  spaces: Space[];
};

function SpaceSwitcher({
  activeSpace,
  onCreate,
  onSelect,
  spaces,
  ...props
}: SpaceSwitcherProps) {
  const t = useTranslations("spaces");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const visibleSpaces = spaces.filter((space) =>
    space.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())
  );

  return (
    <SidebarGroup data-slot="space-switcher">
      <SidebarGroupContent>
        <SidebarMenu {...props} aria-label={t("workspace")}>
          <SidebarMenuItem>
            {spaces.length > 0 ? (
              <DropdownMenu
                open={open}
                onOpenChange={(nextOpen) => {
                  setOpen(nextOpen);
                  if (!nextOpen) {
                    setQuery("");
                  }
                }}
              >
                <DropdownMenuTrigger
                  render={
                    <SidebarMenuButton
                      data-testid="space-switcher-trigger"
                      aria-label={t("switchSpace")}
                    >
                      <SpaceIcon iconKey={activeSpace?.icon} />
                      <span className="min-w-0 truncate text-sm">
                        {activeSpace?.name ?? t("selectSpace")}
                      </span>
                      <ChevronsUpDown className="ml-auto" />
                    </SidebarMenuButton>
                  }
                />
                <DropdownMenuContent
                  align="start"
                  sideOffset={4}
                  className="min-w-60"
                >
                  <InputGroup className="mb-1">
                    <InputGroupAddon>
                      <Search aria-hidden="true" />
                    </InputGroupAddon>
                    <InputGroupInput
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      onKeyDown={(event) => event.stopPropagation()}
                      placeholder={t("searchPlaceholder")}
                      aria-label={t("searchPlaceholder")}
                      data-testid="space-switcher-search"
                    />
                  </InputGroup>
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>{t("workspace")}</DropdownMenuLabel>
                    {visibleSpaces.length > 0 ? (
                      visibleSpaces.map((space) => (
                        <DropdownMenuItem
                          key={space.id}
                          onClick={() => onSelect(space.id)}
                          data-testid={`space-switcher-item-${space.id}`}
                        >
                          <SpaceIcon iconKey={space.icon} />
                          <span className="min-w-0 flex-1 truncate">
                            {space.name}
                          </span>
                          {space.id === activeSpace?.id && <Check />}
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <Empty className="min-h-20 p-3">
                        <EmptyHeader>
                          <EmptyDescription>
                            {t("noSearchResults")}
                          </EmptyDescription>
                        </EmptyHeader>
                      </Empty>
                    )}
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={onCreate}>
                      <Plus />
                      {t("createSpace")}
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <SidebarMenuButton
                data-testid="space-switcher-create-trigger"
                onClick={onCreate}
              >
                <Plus />
                <span>{t("createFirstSpace")}</span>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
          {spaces.length > 0 && (
            <SidebarMenuItem>
              <SidebarMenuButton onClick={onCreate}>
                <Plus />
                <span>{t("newSpace")}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export { SpaceSwitcher, type SpaceSwitcherProps };
