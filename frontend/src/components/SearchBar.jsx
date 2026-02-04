"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command"
import {
    LayoutDashboardIcon,
    UsersIcon,
    GraduationCapIcon,
    BookOpenIcon,
    BookOpenTextIcon,
} from "lucide-react"

export default function SearchBar() {
    const [open, setOpen] = React.useState(false)

    React.useEffect(() => {
        const down = (e) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }
        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    return (
        <div className="flex flex-col gap-4">
            <Button onClick={() => setOpen(true)} variant="outline" className="w-full justify-between text-muted-foreground">
                <span>Type a command or search...</span>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </Button>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <Command>
                    <CommandInput placeholder="Type a command or search..." />
                    <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup heading="Main">
                            <CommandItem>
                                <LayoutDashboardIcon className="mr-2 h-4 w-4" />
                                <span>Dashboard</span>
                            </CommandItem>
                            <CommandItem>
                                <UsersIcon className="mr-2 h-4 w-4" />
                                <span>Students</span>
                            </CommandItem>
                            <CommandItem>
                                <GraduationCapIcon className="mr-2 h-4 w-4" />
                                <span>Teachers</span>
                            </CommandItem>
                            <CommandItem>
                                <BookOpenIcon className="mr-2 h-4 w-4" />
                                <span>Classes</span>
                            </CommandItem>
                        </CommandGroup>
                        <CommandSeparator />
                        <CommandGroup heading="Academic">
                            <CommandItem>
                                <BookOpenTextIcon className="mr-2 h-4 w-4" />
                                <span>Subjects</span>
                            </CommandItem>
                        </CommandGroup>
                    </CommandList>
                </Command>
            </CommandDialog>
        </div>
    )
}
