'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { 
    format, 
    addMonths, 
    subMonths, 
    startOfMonth, 
    endOfMonth, 
    startOfWeek, 
    endOfWeek, 
    isSameMonth, 
    isSameDay, 
    addDays, 
    eachDayOfInterval,
    isToday
} from 'date-fns';
import { hr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface CalendarProps {
    selected?: Date;
    onSelect?: (date: Date) => void;
    className?: string;
}

export function Calendar({ selected, onSelect, className }: CalendarProps) {
    const [currentMonth, setCurrentMonth] = React.useState(selected || new Date());

    const days = React.useMemo(() => {
        const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
        const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
        return eachDayOfInterval({ start, end });
    }, [currentMonth]);

    return (
        <div className={cn("p-3 w-[280px]", className)}>
            <div className="flex items-center justify-between mb-4">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-sm font-bold uppercase tracking-tight">
                    {format(currentMonth, 'MMMM yyyy', { locale: hr })}
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
                {['P', 'U', 'S', 'Č', 'P', 'S', 'N'].map((day) => (
                    <div key={day} className="text-center text-[10px] font-black text-muted-foreground uppercase">
                        {day}
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {days.map((day) => {
                    const isSelected = selected && isSameDay(day, selected);
                    const isCurrentMonth = isSameMonth(day, currentMonth);
                    
                    return (
                        <button
                            key={day.toString()}
                            onClick={() => onSelect?.(day)}
                            className={cn(
                                "h-8 w-8 text-xs rounded-lg transition-all flex items-center justify-center font-medium",
                                !isCurrentMonth && "text-muted-foreground/30",
                                isSelected ? "bg-primary text-primary-foreground font-bold shadow-lg scale-110" : 
                                isToday(day) ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" :
                                "hover:bg-muted"
                            )}
                        >
                            {format(day, 'd')}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
