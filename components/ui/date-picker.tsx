'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { hr } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

export interface DatePickerProps {
    date?: Date;
    setDate: (date: Date) => void;
    placeholder?: string;
    className?: string;
}

export function DatePicker({ date, setDate, placeholder = "Odaberi datum", className }: DatePickerProps) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-full justify-start text-left font-medium h-10 bg-background/50",
                        !date && "text-muted-foreground",
                        className
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                    {date ? format(date, "dd.MM.yyyy.") : <span>{placeholder}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-2xl shadow-premium border-none" align="start">
                <Calendar
                    selected={date}
                    onSelect={(d) => {
                        setDate(d);
                    }}
                />
            </PopoverContent>
        </Popover>
    );
}
