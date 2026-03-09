import * as React from "react";
import { format, getMonth, getYear, setMonth, setYear } from "date-fns";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

/**
 * MonthPicker component for selecting Month and Year.
 * 
 * @param {string} value        - Current value as "YYYY-MM" string (e.g., "2024-03")
 * @param {function} onChange   - Callback: returns "YYYY-MM" string
 * @param {string} placeholder  - Placeholder text
 * @param {string} className    - Extra className for trigger button
 */
const MonthPicker = ({
    value,
    onChange,
    placeholder = "Pick a month",
    className,
}) => {
    const [open, setOpen] = React.useState(false);

    // Get current date or parsed value
    const date = React.useMemo(() => {
        if (!value) return new Date();
        const [y, m] = value.split("-");
        return new Date(parseInt(y), parseInt(m) - 1, 1);
    }, [value]);

    const currentYear = getYear(date);
    const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const handleMonthClick = (monthIndex) => {
        const newDate = setMonth(date, monthIndex);
        onChange(format(newDate, "yyyy-MM"));
        setOpen(false);
    };

    const handleYearChange = (offset) => {
        const newDate = setYear(date, currentYear + offset);
        // We don't close the popover when changing years
        // But we update the parent state if needed, or just keep it local?
        // Let's update it immediately so the UI reflects the change
        onChange(format(newDate, "yyyy-MM"));
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !value && "text-muted-foreground",
                        className
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {value ? format(date, "MMMM yyyy") : <span>{placeholder}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3" align="start">
                <div className="flex items-center justify-between mb-4 px-1">
                    <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-7 w-7" 
                        onClick={(e) => { e.preventDefault(); handleYearChange(-1); }}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="font-bold text-sm">
                        {currentYear}
                    </div>
                    <Button 
                        variant="outline" 
                        size="icon" 
                        className="h-7 w-7" 
                        onClick={(e) => { e.preventDefault(); handleYearChange(1); }}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    {months.map((month, index) => {
                        const isSelected = value && getMonth(date) === index;
                        return (
                            <Button
                                key={month}
                                variant={isSelected ? "default" : "ghost"}
                                size="sm"
                                className={cn(
                                    "h-9 w-full font-normal",
                                    isSelected && "bg-primary text-primary-foreground hover:bg-primary/90"
                                )}
                                onClick={() => handleMonthClick(index)}
                            >
                                {month}
                            </Button>
                        );
                    })}
                </div>
            </PopoverContent>
        </Popover>
    );
};

export { MonthPicker };
