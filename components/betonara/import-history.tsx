'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { BetonaraImportHistory } from '@/types/betonara';
import { getImportHistory } from '@/lib/actions/betonara';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { 
    History, 
    FileSpreadsheet, 
    User, 
    Calendar as CalendarIcon, 
    Loader2, 
    ChevronLeft, 
    ChevronRight,
    Search,
    RotateCcw,
    Clock,
    PlusCircle,
    Copy
} from 'lucide-react';
import { 
    format, 
    startOfMonth, 
    endOfMonth, 
    startOfWeek, 
    endOfWeek, 
    eachDayOfInterval, 
    isSameMonth, 
    isSameDay, 
    addMonths, 
    subMonths,
    isToday,
    parseISO,
    startOfDay,
    endOfDay
} from 'date-fns';
import { hr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function ImportHistory() {
    const [history, setHistory] = useState<BetonaraImportHistory[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    
    // Calendar State
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState<string | null>(null);

    const fetchHistory = useCallback(async () => {
        setLoading(true);
        try {
            const fromDate = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
            const toDate = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
            
            const { data } = await getImportHistory({ 
                from: fromDate.toISOString(), 
                to: toDate.toISOString(),
                limit: 200 // Increase limit for calendar
            });
            setHistory(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [currentMonth]);

    useEffect(() => {
        if (open) {
            fetchHistory();
        } else {
            setSelectedDay(null); // Reset when closing
        }
    }, [open, fetchHistory]);

    // Calendar Calculations
    const days = useMemo(() => {
        const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
        const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
        return eachDayOfInterval({ start, end });
    }, [currentMonth]);

    const groupedHistory = useMemo(() => {
        const groups: Record<string, BetonaraImportHistory[]> = {};
        
        history.forEach(item => {
            const dateStart = item.start_date ? parseISO(item.start_date) : parseISO(item.import_date);
            const dateEnd = item.end_date ? parseISO(item.end_date) : parseISO(item.import_date);
            
            try {
                const interval = eachDayOfInterval({ 
                    start: startOfDay(dateStart), 
                    end: startOfDay(dateEnd) 
                });

                interval.forEach(day => {
                    const dayKey = format(day, 'yyyy-MM-dd');
                    if (!groups[dayKey]) groups[dayKey] = [];
                    if (!groups[dayKey].find(g => g.id === item.id)) {
                        groups[dayKey].push(item);
                    }
                });
            } catch (e) {
                const dayKey = format(startOfDay(dateStart), 'yyyy-MM-dd');
                if (!groups[dayKey]) groups[dayKey] = [];
                groups[dayKey].push(item);
            }
        });
        return groups;
    }, [history]);

    const selectedDayHistory = useMemo(() => {
        if (!selectedDay) return [];
        return groupedHistory[selectedDay] || [];
    }, [selectedDay, groupedHistory]);

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const goToToday = () => {
        setCurrentMonth(new Date());
        setSelectedDay(null);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 shadow-sm hover:bg-muted/50 border-border">
                    <History className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    Historija importa
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] lg:max-w-5xl h-[90vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl bg-background">
                <DialogHeader className="p-6 bg-background border-b shrink-0 border-border">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="rounded-2xl bg-emerald-500/10 p-3 ring-1 ring-emerald-500/20">
                                <History className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-black tracking-tighter text-foreground">
                                    {selectedDay ? `Detalji za ${format(parseISO(selectedDay), 'dd. MMMM yyyy.', { locale: hr })}` : 'Historija importa'}
                                </DialogTitle>
                                <DialogDescription className="text-sm font-medium text-muted-foreground">
                                    {selectedDay ? 'Pregled svih fajlova i importa za odabrani period.' : 'Kalendarski pregled uvoza podataka po danima.'}
                                </DialogDescription>
                            </div>
                        </div>

                        {!selectedDay ? (
                            <div className="flex items-center bg-muted/50 p-1 rounded-xl border border-border">
                                <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8 hover:bg-background hover:shadow-sm transition-all rounded-lg">
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <span className="px-4 text-sm font-bold min-w-[120px] text-center capitalize underline decoration-emerald-500/30 underline-offset-4 text-foreground">
                                    {format(currentMonth, 'MMMM yyyy', { locale: hr })}
                                </span>
                                <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8 hover:bg-background hover:shadow-sm transition-all rounded-lg">
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                                <div className="mx-2 w-px h-4 bg-border" />
                                <Button variant="ghost" size="sm" onClick={goToToday} className="h-8 px-3 text-[10px] font-black uppercase tracking-tighter hover:bg-background hover:shadow-sm rounded-lg text-foreground">
                                    Danas
                                </Button>
                            </div>
                        ) : (
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setSelectedDay(null)}
                                className="gap-2 h-9 px-4 rounded-xl border-emerald-500/20 hover:bg-emerald-500/5 hover:text-emerald-600 transition-all font-bold uppercase tracking-tighter text-[10px]"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Nazad na kalendar
                            </Button>
                        )}
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-hidden bg-background p-0">
                    {loading ? (
                        <div className="flex h-full flex-col items-center justify-center gap-4">
                            <div className="relative">
                                <Loader2 className="h-12 w-12 animate-spin text-emerald-600 dark:text-emerald-400 opacity-20" />
                                <History className="h-6 w-6 text-emerald-600 dark:text-emerald-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                            </div>
                            <p className="text-sm font-bold text-muted-foreground animate-pulse tracking-tight">Učitavam...</p>
                        </div>
                    ) : selectedDay ? (
                        <div className="h-full p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/20">
                            <div className="max-w-3xl mx-auto space-y-4">
                                {selectedDayHistory.length === 0 ? (
                                    <div className="text-center py-20 opacity-50">Nema zapisa za ovaj dan.</div>
                                ) : (
                                    selectedDayHistory.map((item) => (
                                        <div key={item.id} className="group flex flex-col gap-4 p-5 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md hover:border-emerald-500/30 transition-all">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="rounded-xl bg-emerald-500/10 p-3 ring-1 ring-emerald-500/20">
                                                        <FileSpreadsheet className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-lg font-black tracking-tight text-foreground">{item.filename}</p>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/5 text-emerald-600 border-emerald-500/20">
                                                                {item.plant}
                                                            </Badge>
                                                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
                                                                <Clock className="h-3.5 w-3.5" />
                                                                Uvezeno: {format(parseISO(item.import_date), 'dd.MM.yyyy HH:mm')}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-6">
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Novi zapisi</p>
                                                        <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">+{item.added_count}</span>
                                                    </div>
                                                    <div className="w-px h-10 bg-border" />
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Duplikati</p>
                                                        <span className="text-2xl font-black text-orange-600 dark:text-orange-400">{item.skipped_count}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-4 border-t border-border mt-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center font-black text-[10px] text-emerald-700 dark:text-emerald-400">
                                                        {item.profiles?.full_name?.charAt(0) || 'S'}
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Importovao</p>
                                                        <p className="text-sm font-bold text-foreground">{item.profiles?.full_name || 'Sistem'}</p>
                                                    </div>
                                                </div>

                                                {item.start_date && item.end_date && (
                                                    <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-xl border border-border">
                                                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-[11px] font-black text-muted-foreground">
                                                            PERIOD: {format(parseISO(item.start_date), 'dd.MM')} - {format(parseISO(item.end_date), 'dd.MM.yyyy')}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col border border-border rounded-2xl bg-background shadow-sm overflow-hidden">
                            <div className="grid grid-cols-7 border-b border-border bg-muted/30">
                                {['Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub', 'Ned'].map(day => (
                                    <div key={day} className="py-3 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground border-r border-border last:border-r-0">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            <div className="flex-1 grid grid-cols-7 auto-rows-fr overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/20">
                                {days.map((day, i) => {
                                    const dayKey = format(day, 'yyyy-MM-dd');
                                    const dayImports = groupedHistory[dayKey] || [];
                                    const isCurrentMonth = isSameMonth(day, currentMonth);

                                    // Calculate summaries
                                    const uniquePlants = Array.from(new Set(dayImports.map(i => i.plant)));
                                    const totalAdded = dayImports.reduce((acc, curr) => acc + curr.added_count, 0);

                                    return (
                                        <div 
                                            key={day.toString()} 
                                            onClick={() => dayImports.length > 0 && setSelectedDay(dayKey)}
                                            className={cn(
                                                "min-h-[120px] p-2 border-r border-b border-border group relative transition-all overflow-hidden cursor-default",
                                                !isCurrentMonth && "bg-muted/10 opacity-40 grayscale-[0.5]",
                                                isToday(day) && "bg-emerald-500/5 dark:bg-emerald-500/10",
                                                dayImports.length > 0 && "cursor-pointer hover:bg-emerald-500/5 dark:hover:bg-emerald-500/10 active:scale-[0.98]",
                                                (i + 1) % 7 === 0 && "border-r-0"
                                            )}
                                        >
                                            <div className="flex justify-between items-center mb-3">
                                                <span className={cn(
                                                    "text-sm font-black transition-all",
                                                    isToday(day) ? "bg-emerald-600 dark:bg-emerald-500 text-white h-7 w-7 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20" : "text-muted-foreground group-hover:text-foreground"
                                                )}>
                                                    {format(day, 'd')}
                                                </span>
                                                {totalAdded > 0 && (
                                                    <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600 dark:text-emerald-400">
                                                        <PlusCircle className="h-3 w-3" />
                                                        <span>{totalAdded} ZAPISA</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                {uniquePlants.map(plant => (
                                                    <div key={plant} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                        <span className="text-[9px] font-black uppercase tracking-tighter truncate">
                                                            {plant}
                                                        </span>
                                                    </div>
                                                ))}
                                                
                                                {dayImports.length > 0 && (
                                                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <div className="rounded-full bg-emerald-500 p-1 shadow-lg">
                                                            <ChevronRight className="h-3 w-3 text-white" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
                
                <style jsx global>{`
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 3px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: rgb(var(--muted-foreground) / 0.2);
                        border-radius: 10px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: rgb(var(--muted-foreground) / 0.4);
                    }
                `}</style>
            </DialogContent>
        </Dialog>
    );
}
