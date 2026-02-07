'use client';

import { useState, useEffect, useCallback } from 'react';
import { BetonaraImportHistory } from '@/types/betonara';
import { getImportHistory } from '@/lib/actions/betonara';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';
import { 
    History, 
    FileSpreadsheet, 
    User, 
    Calendar, 
    Loader2, 
    ChevronLeft, 
    ChevronRight,
    Search,
    RotateCcw
} from 'lucide-react';
import { format, startOfDay, endOfDay } from 'date-fns';
import { hr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function ImportHistory() {
    const [history, setHistory] = useState<BetonaraImportHistory[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    
    // Filters & Pagination
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const limit = 10;

    const fetchHistory = useCallback(async () => {
        setLoading(true);
        try {
            const filters: any = { page, limit };
            if (dateFrom) filters.from = startOfDay(new Date(dateFrom)).toISOString();
            if (dateTo) filters.to = endOfDay(new Date(dateTo)).toISOString();
            
            const { data, count } = await getImportHistory(filters);
            setHistory(data);
            setTotalCount(count);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [page, dateFrom, dateTo]);

    useEffect(() => {
        if (open) {
            fetchHistory();
        }
    }, [open, fetchHistory]);

    const handleReset = () => {
        setDateFrom('');
        setDateTo('');
        setPage(1);
    };

    const totalPages = Math.ceil(totalCount / limit);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 shadow-sm hover:bg-muted/50">
                    <History className="h-4 w-4 text-primary" />
                    Historija importa
                </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-[500px] md:max-w-[600px] lg:max-w-[700px] flex flex-col h-full p-0">
                <SheetHeader className="p-6 border-b">
                    <div className="flex items-center gap-3">
                        <div className="rounded-full bg-primary/10 p-2">
                            <History className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <SheetTitle className="text-xl">Historija importa</SheetTitle>
                            <SheetDescription>
                                Pregled i filtriranje prethodnih uvoza podataka.
                            </SheetDescription>
                        </div>
                    </div>
                </SheetHeader>

                {/* Filters Section */}
                <div className="p-6 bg-muted/20 border-b space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="dateFrom" className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Od datuma</Label>
                            <Input 
                                id="dateFrom"
                                type="date" 
                                value={dateFrom} 
                                onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                                className="h-9 bg-card"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dateTo" className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Do datuma</Label>
                            <Input 
                                id="dateTo"
                                type="date" 
                                value={dateTo} 
                                onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                                className="h-9 bg-card"
                            />
                        </div>
                    </div>
                    <div className="flex justify-between items-center">
                        <p className="text-xs text-muted-foreground italic">
                            {totalCount > 0 ? `Pronađeno ${totalCount} zapisa` : 'Nema zapisa'}
                        </p>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={handleReset}
                            className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-primary"
                        >
                            <RotateCcw className="h-3 w-3" />
                            Poništi filtere
                        </Button>
                    </div>
                </div>

                {/* History List */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
                    {loading ? (
                        <div className="flex h-full flex-col items-center justify-center gap-3">
                            <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
                            <p className="text-sm text-muted-foreground animate-pulse">Učitavam historiju...</p>
                        </div>
                    ) : history.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground py-12">
                            <div className="rounded-full bg-muted p-4">
                                <Search className="h-8 w-8 opacity-20" />
                            </div>
                            <div className="text-center">
                                <p className="font-medium text-foreground">Nema pronađenih zapisa</p>
                                <p className="text-sm">Pokušajte promijeniti filtere ili uraditi novi import.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {history.map((item) => (
                                <div key={item.id} className="group relative flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm transition-all hover:shadow-md hover:border-primary/20">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3 min-w-0">
                                            <div className="rounded-lg bg-emerald-500/10 p-2.5 text-emerald-600 shrink-0 group-hover:scale-110 transition-transform">
                                                <FileSpreadsheet className="h-5 w-5" />
                                            </div>
                                            <div className="min-w-0 space-y-1">
                                                <p className="text-sm font-bold truncate leading-none text-foreground">{item.filename}</p>
                                                <div className="flex flex-col gap-1.5 mt-2">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="secondary" className="text-[10px] h-4.5 py-0 font-black uppercase tracking-tighter bg-muted group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                            {item.plant}
                                                        </Badge>
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-[10px] text-emerald-600 font-black tracking-tight">
                                                                +{item.added_count} NOVIH
                                                            </span>
                                                            <span className="text-[10px] text-muted-foreground">/</span>
                                                            <span className="text-[10px] text-orange-600 font-bold tracking-tight">
                                                                {item.skipped_count} DUPLIKATA
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {(item.start_date && item.end_date) && (
                                                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground bg-muted/30 px-2 py-0.5 rounded-md w-fit font-medium">
                                                            <Calendar className="h-3 w-3" />
                                                            Period: {format(new Date(item.start_date), 'dd.MM')} - {format(new Date(item.end_date), 'dd.MM.yyyy')}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-2 flex items-center justify-between border-t pt-3 text-[11px] text-muted-foreground group-hover:text-foreground transition-colors">
                                        <div className="flex items-center gap-1.5">
                                            <div className="rounded-full bg-muted p-1">
                                                <User className="h-3 w-3" />
                                            </div>
                                            <span className="font-medium">
                                                {(() => {
                                                    const profiles = item.profiles as any;
                                                    if (Array.isArray(profiles)) return profiles[0]?.full_name || 'Sistem';
                                                    return profiles?.full_name || 'Sistem';
                                                })()}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 italic">
                                            <span>{format(new Date(item.import_date), 'dd.MM.yyyy HH:mm', { locale: hr })}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Pagination Footer */}
                {totalPages > 1 && (
                    <div className="p-4 border-t bg-muted/10 flex items-center justify-between">
                        <p className="text-xs text-muted-foreground font-medium">
                            Stranica {page} od {totalPages}
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page === 1 || loading}
                                onClick={() => setPage(prev => prev - 1)}
                                className="h-8 gap-1"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Prethodna
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page === totalPages || loading}
                                onClick={() => setPage(prev => prev + 1)}
                                className="h-8 gap-1"
                            >
                                Sljedeća
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
