'use client';

import { useState, useEffect } from 'react';
import { BetonaraProductionRecord, BetonaraMaterial } from '@/types/betonara';
import { getProductionRecords, getActiveMaterials } from '@/lib/actions/betonara';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay } from 'date-fns';
import { Loader2, Download, Table as TableIcon, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileSpreadsheet, FileText } from 'lucide-react';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

export function BetonaraReportsClient() {
    const now = new Date();
    const [records, setRecords] = useState<BetonaraProductionRecord[]>([]);
    const [materials, setMaterials] = useState<BetonaraMaterial[]>([]);
    const [loading, setLoading] = useState(true);
    const [plant, setPlant] = useState('all');
    const [month, setMonth] = useState((now.getMonth() + 1).toString());
    const [year, setYear] = useState(now.getFullYear().toString());
    const [view, setView] = useState('table');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 50;

    const months = [
        { value: '1', label: 'Januar' },
        { value: '2', label: 'Februar' },
        { value: '3', label: 'Mart' },
        { value: '4', label: 'April' },
        { value: '5', label: 'Maj' },
        { value: '6', label: 'Juni' },
        { value: '7', label: 'Juli' },
        { value: '8', label: 'August' },
        { value: '9', label: 'Septembar' },
        { value: '10', label: 'Oktobar' },
        { value: '11', label: 'Novembar' },
        { value: '12', label: 'Decembar' },
    ];

    const currentYear = now.getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => (currentYear - 2 + i).toString());

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const fromDate = new Date(parseInt(year), parseInt(month) - 1, 1).toISOString();
                const toDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59).toISOString();

                const [recordsData, materialsData] = await Promise.all([
                    getProductionRecords({ from: fromDate, to: toDate, plant }),
                    getActiveMaterials()
                ]);

                // @ts-ignore
                setRecords(recordsData.map(r => ({ ...r, date: new Date(r.date) })));
                setMaterials(materialsData);
                setCurrentPage(1); // Reset page on filter change
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [plant, month, year]);

    // Totals remain calculated from FULL records array
    const totals = records.reduce((acc, r) => {
        materials.forEach(m => {
            acc[m.code] = (acc[m.code] || 0) + (r.materials[m.code] || 0);
        });
        acc.water = (acc.water || 0) + (r.water || 0);
        acc.total = (acc.total || 0) + (r.total_quantity || 0);
        return acc;
    }, {} as Record<string, number>);

    // Pagination helper
    const totalPages = Math.ceil(records.length / itemsPerPage);
    const paginatedRecords = records.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Calendar helper
    const selectedMonthDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const daysInMonth = eachDayOfInterval({
        start: startOfMonth(selectedMonthDate),
        end: endOfMonth(selectedMonthDate)
    });

    // Production days heatmap
    const productionByDay = records.reduce((acc, r) => {
        const dayKey = format(r.date, 'yyyy-MM-dd');
        acc[dayKey] = (acc[dayKey] || 0) + r.total_quantity;
        return acc;
    }, {} as Record<string, number>);

    const handleExportExcel = () => {
        const exportData = records.map(r => {
            const row: any = {
                'Radni nalog': r.work_order_number,
                'Datum': format(r.date, 'dd.MM.yyyy HH:mm'),
                'Receptura': r.recipe_number,
            };
            materials.forEach(m => {
                row[m.name] = r.materials[m.code] || 0;
            });
            row['Voda'] = r.water;
            row['Ukupno m3'] = r.total_quantity;
            row['Izdatnica'] = r.issuance_number;
            return row;
        });

        // Add Totals row
        const totalsRow: any = {
            'Radni nalog': 'UKUPNO',
            'Datum': '',
            'Receptura': '',
        };
        materials.forEach(m => {
            totalsRow[m.name] = totals[m.code] || 0;
        });
        totalsRow['Voda'] = totals.water;
        totalsRow['Ukupno m3'] = totals.total;
        totalsRow['Izdatnica'] = '';
        exportData.push(totalsRow);

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Izvještaj");
        XLSX.writeFile(wb, `Betonara_Izvjestaj_${month}_${year}.xlsx`);
    };

    const handleExportPDF = () => {
        const doc = new jsPDF('l', 'mm', 'a4');
        const title = `Izvjestaj proizvodnje - ${months.find(m => m.value === month)?.label} ${year}`;

        doc.setFontSize(16);
        doc.text(title, 14, 15);
        doc.setFontSize(10);
        doc.text(`Betonara: ${plant === 'all' ? 'Sve' : plant}`, 14, 22);

        const headers = [
            ['R. Nalog', 'Datum', 'Recept', ...materials.map(m => m.name), 'Voda', 'm3', 'Izdatnica']
        ];

        const data = records.map(r => [
            r.work_order_number || '-',
            format(r.date, 'dd.MM.yyyy'),
            r.recipe_number,
            ...materials.map(m => (r.materials[m.code] || 0).toFixed(2)),
            r.water.toFixed(2),
            r.total_quantity.toFixed(2),
            r.issuance_number || '-'
        ]);

        // Add Totals row to PDF
        data.push([
            'UKUPNO', '', '',
            ...materials.map(m => (totals[m.code] || 0).toFixed(2)),
            (totals.water || 0).toFixed(2),
            (totals.total || 0).toFixed(2),
            ''
        ]);

        autoTable(doc, {
            startY: 28,
            head: headers,
            body: data,
            theme: 'striped',
            headStyles: { fillColor: [41, 128, 185], textColor: 255 },
            styles: { fontSize: 7, cellPadding: 2 },
            columnStyles: {
                0: { cellWidth: 20 },
                1: { cellWidth: 20 },
            }
        });

        doc.save(`Betonara_Izvjestaj_${month}_${year}.pdf`);
    };

    return (
        <div className="space-y-6 w-full max-w-full p-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                    <Select value={month} onValueChange={setMonth}>
                        <SelectTrigger className="w-[140px] bg-card">
                            <SelectValue placeholder="Mjesec" />
                        </SelectTrigger>
                        <SelectContent>
                            {months.map(m => (
                                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={year} onValueChange={setYear}>
                        <SelectTrigger className="w-[100px] bg-card">
                            <SelectValue placeholder="Godina" />
                        </SelectTrigger>
                        <SelectContent>
                            {years.map(y => (
                                <SelectItem key={y} value={y}>{y}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={plant} onValueChange={setPlant}>
                        <SelectTrigger className="w-[180px] bg-card">
                            <SelectValue placeholder="Betonara" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Sve betonare</SelectItem>
                            <SelectItem value="Betonara 1">Betonara 1</SelectItem>
                            <SelectItem value="Betonara 2">Betonara 2</SelectItem>
                        </SelectContent>
                    </Select>

                    <div className="flex items-center gap-1 border rounded-lg p-1 bg-card">
                        <Button
                            variant={view === 'table' ? 'secondary' : 'ghost'}
                            size="sm"
                            className="h-8 px-3"
                            onClick={() => setView('table')}
                        >
                            <TableIcon className="h-4 w-4 mr-2" />
                            Tabela
                        </Button>
                        <Button
                            variant={view === 'calendar' ? 'secondary' : 'ghost'}
                            size="sm"
                            className="h-8 px-3"
                            onClick={() => setView('calendar')}
                        >
                            <CalendarIcon className="h-4 w-4 mr-2" />
                            Kalendar
                        </Button>
                    </div>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="bg-card w-full sm:w-auto">
                            <Download className="mr-2 h-4 w-4" />
                            Izvezi izvještaj
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[200px]">
                        <DropdownMenuItem onClick={handleExportExcel} className="cursor-pointer">
                            <FileSpreadsheet className="mr-2 h-4 w-4 text-emerald-600" />
                            <span>Izvezi u Excel (.xlsx)</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleExportPDF} className="cursor-pointer">
                            <FileText className="mr-2 h-4 w-4 text-red-600" />
                            <span>Izvezi u PDF (.pdf)</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {view === 'table' ? (
                <div className="grid grid-cols-1 min-w-0">
                    <Card className="border-none shadow-premium bg-card/50 backdrop-blur overflow-hidden">
                        <div className="overflow-x-auto w-full scrollbar-thin max-h-[75vh]">
                            <Table className="w-full border-separate border-spacing-0">
                                <TableHeader className="bg-muted/90 backdrop-blur-md sticky top-0 z-20 shadow-sm">
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="w-[120px] whitespace-nowrap bg-muted/50 border-b">Radni nalog</TableHead>
                                        <TableHead className="w-[100px] whitespace-nowrap bg-muted/50 border-b">Datum</TableHead>
                                        <TableHead className="whitespace-nowrap bg-muted/50 border-b">Receptura</TableHead>
                                        {materials.map(m => (
                                            <TableHead key={m.code} className="text-right whitespace-nowrap bg-muted/50 border-b">
                                                <div className="text-[10px] text-muted-foreground">{m.code}</div>
                                                <div>{m.name}</div>
                                            </TableHead>
                                        ))}
                                        <TableHead className="text-right whitespace-nowrap bg-muted/50 border-b">Voda</TableHead>
                                        <TableHead className="text-right font-bold whitespace-nowrap bg-muted/50 border-b">m³</TableHead>
                                        <TableHead className="w-[120px] whitespace-nowrap text-right bg-muted/50 border-b">Izdatnica</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={materials.length + 5} className="h-64 text-center">
                                                <div className="flex flex-col items-center gap-2">
                                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                                    <p className="text-sm text-muted-foreground">Učitavam izvještaje...</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : records.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={materials.length + 5} className="h-64 text-center text-muted-foreground font-medium">
                                                Nema pronađenih zapisa za odabrani period.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        <>
                                            {paginatedRecords.map((r) => (
                                                <TableRow key={r.id} className="hover:bg-muted/10 transition-colors">
                                                    <TableCell className="font-mono text-[11px] text-muted-foreground">{r.work_order_number || '-'}</TableCell>
                                                    <TableCell className="whitespace-nowrap text-xs font-medium">{format(r.date, 'dd.MM.yyyy')}</TableCell>
                                                    <TableCell className="whitespace-nowrap text-xs">
                                                        <Badge variant="outline" className="font-semibold text-primary/80">{r.recipe_number}</Badge>
                                                    </TableCell>
                                                    {materials.map(m => (
                                                        <TableCell key={m.code} className="text-right font-mono text-[11px]">
                                                            {(r.materials[m.code] || 0) > 0 ? r.materials[m.code].toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                                                        </TableCell>
                                                    ))}
                                                    <TableCell className="text-right font-mono text-xs text-blue-600/70">{r.water.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                                                    <TableCell className="text-right font-bold font-mono text-xs">{r.total_quantity.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                                                    <TableCell className="text-right text-[11px] text-muted-foreground">{r.issuance_number || '-'}</TableCell>
                                                </TableRow>
                                            ))}
                                            <TableRow className="bg-primary/5 hover:bg-primary/5 font-bold border-t-2">
                                                <TableCell colSpan={3} className="text-primary tracking-wider">UKUPNO ZA CIJELI MJESEC:</TableCell>
                                                {materials.map(m => (
                                                    <TableCell key={m.code} className="text-right font-mono text-emerald-600">
                                                        {totals[m.code]?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
                                                    </TableCell>
                                                ))}
                                                <TableCell className="text-right font-mono text-blue-600">{totals.water?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell>
                                                <TableCell className="text-right font-mono font-black text-emerald-600 text-sm">
                                                    {totals.total?.toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-[10px]">m³</span>
                                                </TableCell>
                                                <TableCell />
                                            </TableRow>
                                        </>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </Card>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-2">
                            <p className="text-xs text-muted-foreground">
                                Prikazujem {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, records.length)} od {records.length} zapisa
                            </p>
                            <Pagination className="w-auto ml-0">
                                <PaginationContent>
                                    <PaginationItem>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            disabled={currentPage === 1}
                                            onClick={() => setCurrentPage(prev => prev - 1)}
                                        >
                                            <ChevronLeft className="h-4 w-4 mr-1" /> Prethodna
                                        </Button>
                                    </PaginationItem>
                                    <PaginationItem>
                                        <span className="px-4 text-xs font-semibold">
                                            Stranica {currentPage} od {totalPages}
                                        </span>
                                    </PaginationItem>
                                    <PaginationItem>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            disabled={currentPage === totalPages}
                                            onClick={() => setCurrentPage(prev => prev + 1)}
                                        >
                                            Sljedeća <ChevronRight className="h-4 w-4 ml-1" />
                                        </Button>
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}
                </div>
            ) : (
                <Card className="p-0 border-none shadow-premium bg-card/50 backdrop-blur">
                    <div className="grid grid-cols-7 gap-px rounded-xl overflow-hidden border bg-muted/20">
                        {['Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub', 'Ned'].map(day => (
                            <div key={day} className="bg-muted/10 p-3 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                {day}
                            </div>
                        ))}
                        {Array.from({ length: (getDay(daysInMonth[0]) + 6) % 7 }).map((_, i) => (
                            <div key={`empty-${i}`} className="min-h-[120px] bg-card/20" />
                        ))}
                        {daysInMonth.map(day => {
                            const dateKey = format(day, 'yyyy-MM-dd');
                            const totalOnDay = productionByDay[dateKey];
                            const isToday = isSameDay(day, now);

                            return (
                                <div
                                    key={dateKey}
                                    className={cn(
                                        "min-h-[120px] bg-card p-3 border-t border-r flex flex-col gap-2 transition-all hover:bg-muted/5",
                                        isToday && "ring-1 ring-inset ring-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.2)]"
                                    )}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className={cn(
                                            "text-sm font-semibold",
                                            isToday ? "text-primary bg-primary/10 px-1.5 py-0.5 rounded-full" : "text-card-foreground"
                                        )}>
                                            {format(day, 'd')}
                                        </span>
                                        {totalOnDay && (
                                            <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600 text-[10px] h-5">
                                                {totalOnDay.toFixed(1)} m³
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        {totalOnDay && (
                                            <div className="flex flex-col gap-1">
                                                <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                                                    Broj unosa: {records.filter(r => isSameDay(r.date, day)).length}
                                                </div>
                                                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden mt-1">
                                                    <div
                                                        className="h-full bg-emerald-500 opacity-60"
                                                        style={{ width: `${Math.min(100, (totalOnDay / 50) * 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            )}
        </div>
    );
}
