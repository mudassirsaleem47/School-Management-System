import * as React from "react"
import { IconSelector, IconCheck, IconBuildingSkyscraper, IconSchool, IconPlus } from "@tabler/icons-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useNavigate } from "react-router-dom"
import { useCampus } from "../context/CampusContext"

export function TeamSwitcher() {
  const { isMobile } = useSidebar()
  const navigate = useNavigate()
  const { campuses, selectedCampus, changeCampus } = useCampus()

  // Helper to get display name
  const activeCampusName = selectedCampus ? selectedCampus.campusName : "All Campuses"
  
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <div
                className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <IconSchool className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {activeCampusName}
                </span>
                <span className="truncate text-xs">
                  {selectedCampus ? (selectedCampus.isMain ? "Main Campus" : "Branch") : "Overview"}
                </span>
              </div>
              <IconSelector className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}>
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Select Campus
            </DropdownMenuLabel>
            
            {/* All Campuses Option */}
             <DropdownMenuItem onClick={() => changeCampus(null)} className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-sm border">
                 <IconSchool className="size-4 shrink-0" />
              </div>
              All Campuses
              {!selectedCampus && <IconCheck className="ml-auto size-4" />}
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />

            {campuses.length === 0 ? (
              <div className="p-2 text-xs text-muted-foreground text-center">No campuses found</div>
            ) : (
              campuses.map((campus) => (
                <DropdownMenuItem
                  key={campus._id}
                  onSelect={() => changeCampus(campus)}
                  className="gap-2 p-2 cursor-pointer"
                >
                  <div className="flex size-6 items-center justify-center rounded-sm border">
                    <IconBuildingSkyscraper className="size-4 shrink-0" />
                  </div>
                  {campus.campusName}
                  {selectedCampus?._id === campus._id && <IconCheck className="ml-auto size-4" />}
                </DropdownMenuItem>
                ))
            )}
            
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 p-2 cursor-pointer bg-muted/50 focus:bg-muted"
              onSelect={() => {
                navigate('/admin/campuses?action=new');
              }}
            >
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <IconPlus className="size-4" />
              </div>
              <div className="font-medium">Add Campus</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
