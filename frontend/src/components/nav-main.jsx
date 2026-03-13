"use client"

import { IconChevronRight } from "@tabler/icons-react";
import { useLocation, Link } from "react-router-dom";
import { useState } from "react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items
}) {
  const [openItem, setOpenItem] = useState(null);
  const location = useLocation();

  const handleToggle = (itemTitle) => {
    setOpenItem(openItem === itemTitle ? null : itemTitle);
  };

  const isActive = (url) => {
    return location.pathname === url || location.pathname.startsWith(url + '/');
  };

  const isAnyChildActive = (itemItems) => {
    if (!itemItems) return false;
    return itemItems.some(subItem => isActive(subItem.url));
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Menu</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const hasActiveChild = isAnyChildActive(item.items);
          return item.items && item.items.length > 0 ? (
            <Collapsible
              key={item.title}
              asChild
              open={openItem === item.title || hasActiveChild}
              onOpenChange={() => handleToggle(item.title)}
              className="group/collapsible">
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    className={hasActiveChild ? "bg-accent/40 text-accent-foreground font-medium" : ""}
                  >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <IconChevronRight
                      className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton
                          asChild
                          className={isActive(subItem.url)
                            ? "bg-primary text-primary-foreground font-semibold shadow-sm hover:text-primary-foreground hover:bg-primary/90"
                            : "hover:bg-accent/50"}
                        >
                          <Link to={subItem.url}>
                            <span>{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          ) : (
            <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  className={isActive(item.url)
                    ? "bg-primary text-primary-foreground font-semibold shadow-sm hover:bg-primary/90"
                    : "hover:bg-accent/50"}
                >
                <Link to={item.url}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

