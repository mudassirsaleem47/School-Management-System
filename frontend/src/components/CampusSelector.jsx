import React, { useState } from 'react';
import { useCampus } from '../context/CampusContext';
import {
    Check,
    ChevronsUpDown,
    Building2,
    Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useNavigate } from 'react-router-dom';

const CampusSelector = () => {
    const { campuses, selectedCampus, changeCampus, clearCampusSelection, loading } = useCampus();
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    // Show placeholder if loading
    if (loading) {
        return (
            <Button variant="outline" className="w-[200px] justify-between text-muted-foreground animate-pulse" disabled>
                Loading...
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
        );
    }

    const handleAddClick = () => {
        setOpen(false);
        navigate('/admin/campuses?action=new');
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[220px] justify-between shadow-sm bg-background hover:bg-accent/50 transition-all border-dashed hover:border-solid"
                >
                    <div className="flex items-center gap-2 truncate">
                        <Building2 className="h-4 w-4 text-primary" />
                        <span className="truncate">
                            {selectedCampus
                                ? selectedCampus.campusName
                                : "All Campuses"}
                        </span>
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[220px] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Search campus..." />
                    <CommandList>
                        <CommandEmpty>No campus found.</CommandEmpty>
                        <CommandGroup heading="Select Campus">
                            <CommandItem
                                onSelect={() => {
                                    clearCampusSelection();
                                    setOpen(false);
                                }}
                                className="cursor-pointer"
                            >
                                <Check
                                    className={cn(
                                        "mr-2 h-4 w-4",
                                        !selectedCampus ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                <span>All Campuses</span>
                            </CommandItem>
                            {campuses.map((campus) => (
                                <CommandItem
                                    key={campus._id}
                                    onSelect={() => {
                                        changeCampus(campus);
                                        setOpen(false);
                                    }}
                                    className="cursor-pointer"
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            selectedCampus?._id === campus._id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <div className="flex flex-col">
                                        <span>{campus.campusName}</span>
                                        {campus.isMain && <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Main Campus</span>}
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                        <CommandSeparator />
                        <CommandGroup>
                            <CommandItem onSelect={handleAddClick} className="cursor-pointer text-primary font-medium hover:bg-primary/10 hover:text-primary transition-colors">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Campus
                            </CommandItem>
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

export default CampusSelector;
