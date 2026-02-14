'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, getDay } from 'date-fns';
import {
    Loader2, ChevronLeft, ChevronRight, MoreHorizontal, ChevronRight as ChevronRightIcon,
    Download, FileSpreadsheet, FileText
} from 'lucide-react';
import { BetonaraProductionRecord, BetonaraMaterial } from '@/types/betonara';
import { getActiveMaterials } from '@/lib/actions/betonara';
import { getUnifiedProductionRecords } from '@/lib/actions/betonara-v2';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn, formatNumber } from '@/lib/utils';
import { BetonaraRecordDialog } from './record-dialog';
import { ReportsFilters } from './reports-filters';
import {
    exportToExcel,
    exportToPDF,
    exportImelToExcel,
    exportImelToPDF
} from '@/lib/betonara/export-utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<BetonaraProductionRecord | null>(null);
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [recipeFilter, setRecipeFilter] = useState('');
    const itemsPerPage = 150;

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

    const fetchData = async () => {
        setLoading(true);
        try {
            const fromDate = new Date(parseInt(year), parseInt(month) - 1, 1).toISOString();
            const toDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59).toISOString();

            const [recordsData, materialsData] = await Promise.all([
                getUnifiedProductionRecords({ from: fromDate, to: toDate, plant }),
                getActiveMaterials()
            ]);

            // @ts-ignore
            setRecords(recordsData.map(r => ({ ...r, date: r.date ? new Date(r.date) : new Date() })));
            setMaterials(materialsData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [plant, month, year]);

    // Totals calculated from flattened material values
    const totals = useMemo(() => {
        return records.reduce((acc, r) => {
            acc.agg2 = (acc.agg2 || 0) + Number((r as any).agg2_actual || 0); // 01030073
            acc.agg3 = (acc.agg3 || 0) + Number((r as any).agg3_actual || 0); // 01030063
            acc.agg4 = (acc.agg4 || 0) + Number((r as any).agg4_actual || 0); // 01030074
            acc.agg1 = (acc.agg1 || 0) + Number((r as any).agg1_actual || 0); // 01030075
            acc.cem1 = (acc.cem1 || 0) + Number((r as any).cem1_actual || 0); // 01110045 (42.5)
            acc.cem2 = (acc.cem2 || 0) + Number((r as any).cem2_actual || 0); // 01110045 (52.5)
            acc.add1 = (acc.add1 || 0) + Number((r as any).add1_actual || 0); // 01044076
            acc.add2 = (acc.add2 || 0) + Number((r as any).add2_actual || 0); // 01044077
            acc.water = (acc.water || 0) + Number((r as any).water1_actual || 0);
            acc.total = (acc.total || 0) + Number(r.total_quantity || 0);
            return acc;
        }, {
            agg1: 0, agg2: 0, agg3: 0, agg4: 0,
            cem1: 0, cem2: 0, add1: 0, add2: 0,
            water: 0, total: 0
        });
    }, [records]);

    // Aggregate records by date and recipe
    const aggregatedRecords = useMemo(() => {
        // Filter by recipe first
        const filteredRecords = recipeFilter.trim()
            ? records.filter(r => r.recept_naziv?.toLowerCase().includes(recipeFilter.toLowerCase()))
            : records;

        const grouped = filteredRecords.reduce((acc, r) => {
            const dateKey = format(r.date || new Date(), 'yyyy-MM-dd');
            const recipeKey = `${dateKey}_${r.recipe_number}`;

            if (!acc[recipeKey]) {
                acc[recipeKey] = {
                    date: r.date,
                    recipe_number: r.recipe_number,
                    records: [],
                    agg1_actual: 0,
                    agg2_actual: 0,
                    agg3_actual: 0,
                    agg4_actual: 0,
                    cem1_actual: 0,
                    cem2_actual: 0,
                    add1_actual: 0,
                    add2_actual: 0,
                    water1_actual: 0,
                    total_quantity: 0,
                    count: 0
                };
            }

            acc[recipeKey].records.push(r);
            acc[recipeKey].agg1_actual += Number((r as any).agg1_actual || 0);
            acc[recipeKey].agg2_actual += Number((r as any).agg2_actual || 0);
            acc[recipeKey].agg3_actual += Number((r as any).agg3_actual || 0);
            acc[recipeKey].agg4_actual += Number((r as any).agg4_actual || 0);
            acc[recipeKey].cem1_actual += Number((r as any).cem1_actual || 0);
            acc[recipeKey].cem2_actual += Number((r as any).cem2_actual || 0);
            acc[recipeKey].add1_actual += Number((r as any).add1_actual || 0);
            acc[recipeKey].add2_actual += Number((r as any).add2_actual || 0);
            acc[recipeKey].water1_actual += Number((r as any).water1_actual || 0);
            acc[recipeKey].total_quantity += Number(r.total_quantity || 0);
            acc[recipeKey].count += 1;

            return acc;
        }, {} as Record<string, any>);

        return grouped;
    }, [records, recipeFilter]);

    const groupedRecordsArray = Object.values(aggregatedRecords).sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Pagination helper - use grouped records
    const totalPages = Math.ceil(groupedRecordsArray.length / itemsPerPage);
    const paginatedRecords = groupedRecordsArray.slice(
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
        const dayKey = format(r.date || new Date(), 'yyyy-MM-dd');
        acc[dayKey] = (acc[dayKey] || 0) + (r.total_quantity || 0);
        return acc;
    }, {} as Record<string, number>);

    const handleExportExcel = () => {
        exportToExcel(groupedRecordsArray, totals, month, year);
    };

    const handleExportPDF = () => {
        exportToPDF(groupedRecordsArray, totals, month, year, months);
    };

    const handleExportImelExcel = () => {
        exportImelToExcel(records, plant, month, year);
    };

    const handleExportImelPDF = () => {
        exportImelToPDF(records, plant, month, year, months);
    };

    const openEdit = (record: BetonaraProductionRecord) => {
        setSelectedRecord(record);
        setIsDialogOpen(true);
    };

    const openAdd = () => {
        setSelectedRecord(null);
        setIsDialogOpen(true);
    };
    return (
        <div className="space-y-6 w-full max-w-full">
            <ReportsFilters
                month={month}
                year={year}
                plant={plant}
                view={view}
                recipeFilter={recipeFilter}
                onMonthChange={setMonth}
                onYearChange={setYear}
                onPlantChange={setPlant}
                onViewChange={setView}
                onRecipeFilterChange={setRecipeFilter}
                onAddRecord={openAdd}
                onExportExcel={handleExportExcel}
                onExportPDF={handleExportPDF}
                onExportImelExcel={handleExportImelExcel}
                onExportImelPDF={handleExportImelPDF}
            />

            {view === 'table' ? (
                <div className="grid grid-cols-1 min-w-0">
                    <Card className="border-none shadow-premium bg-card/50 backdrop-blur overflow-hidden">
                        <div className="relative w-full overflow-auto scrollbar-thin max-h-[75vh]">
                            <Table className="w-full border-separate border-spacing-0">
                                <TableHeader>
                                    {/* Row 2: Item Codes - 17 columns total */}
                                    <TableRow className="bg-muted hover:bg-muted border-none divide-x divide-muted-foreground/10">
                                        <TableHead className="w-[50px] sticky top-0 z-30 bg-muted border-b" />
                                        <TableHead className="text-[10px] items-center py-1.5 font-bold sticky top-0 z-30 bg-muted border-b">ŠIFRA ARTIKLA:</TableHead>
                                        <TableHead className="sticky top-0 z-30 bg-muted border-b" />
                                        <TableHead className="text-center text-[10px] font-mono font-bold text-muted-foreground sticky top-0 z-30 bg-muted border-b">01030073</TableHead>
                                        <TableHead className="text-center text-[10px] font-mono font-bold text-muted-foreground sticky top-0 z-30 bg-muted border-b">01030063</TableHead>
                                        <TableHead className="text-center text-[10px] font-mono font-bold text-muted-foreground sticky top-0 z-30 bg-muted border-b">01030074</TableHead>
                                        <TableHead className="text-center text-[10px] font-mono font-bold text-muted-foreground sticky top-0 z-30 bg-muted border-b">01030075</TableHead>
                                        <TableHead className="text-center text-[10px] font-mono font-bold text-muted-foreground sticky top-0 z-30 bg-muted border-b">01110045</TableHead>
                                        <TableHead className="text-center text-[10px] font-mono font-bold text-muted-foreground sticky top-0 z-30 bg-muted border-b">01110045</TableHead>
                                        <TableHead className="text-center text-[10px] font-mono font-bold text-muted-foreground sticky top-0 z-30 bg-muted border-b">01044076</TableHead>
                                        <TableHead className="text-center text-[10px] font-mono font-bold text-muted-foreground sticky top-0 z-30 bg-muted border-b">01044077</TableHead>
                                        <TableHead className="sticky top-0 z-30 bg-muted border-b" />
                                        <TableHead className="sticky top-0 z-30 bg-muted border-b" />
                                        <TableHead className="sticky top-0 z-30 bg-muted border-b" />
                                        <TableHead className="sticky top-0 z-30 bg-muted border-b" />
                                        <TableHead className="sticky top-0 z-30 bg-muted border-b" />
                                        <TableHead className="w-[40px] sticky top-0 right-0 z-[40] bg-muted border-b" />
                                    </TableRow>

                                    {/* Row 3: Column Names - exactly 17 columns */}
                                    <TableRow className="hover:bg-transparent bg-background border-none divide-x divide-muted-foreground/10">
                                        <TableHead className="w-[50px] border-b text-center text-[10px] sticky top-[33px] z-30 bg-background">Export</TableHead>
                                        <TableHead className="whitespace-nowrap font-bold text-[10px] border-b py-2 sticky top-[33px] z-30 bg-background">Datum</TableHead>
                                        <TableHead className="whitespace-nowrap font-bold text-[10px] border-b py-2 sticky top-[33px] z-30 bg-background">Naziv recepture</TableHead>
                                        <TableHead className="text-center whitespace-nowrap font-bold text-[10px] border-b px-2 sticky top-[33px] z-30 bg-background">Riječni agregat 0-4 (GEOKOP)</TableHead>
                                        <TableHead className="text-center whitespace-nowrap font-bold text-[10px] border-b px-2 sticky top-[33px] z-30 bg-background">Kameni drobljeni agregat 0-4</TableHead>
                                        <TableHead className="text-center whitespace-nowrap font-bold text-[10px] border-b px-2 sticky top-[33px] z-30 bg-background">Riječni agregat 4-8 (GEOKOP2)</TableHead>
                                        <TableHead className="text-center whitespace-nowrap font-bold text-[10px] border-b px-2 sticky top-[33px] z-30 bg-background">Riječni agregat 8-16 (GEOKOP)</TableHead>
                                        <TableHead className="text-center whitespace-nowrap font-bold text-[10px] border-b px-2 sticky top-[33px] z-30 bg-background">CEM I 42,5 N</TableHead>
                                        <TableHead className="text-center whitespace-nowrap font-bold text-[10px] border-b px-2 sticky top-[33px] z-30 bg-background">CEM I 52,5 N (FILER)</TableHead>
                                        <TableHead className="text-center whitespace-nowrap font-bold text-[10px] border-b px-2 sticky top-[33px] z-30 bg-background">SIKA V</TableHead>
                                        <TableHead className="text-center whitespace-nowrap font-bold text-[10px] border-b px-2 sticky top-[33px] z-30 bg-background">Aditiv FM 500(ŠUPLJE)</TableHead>
                                        <TableHead className="text-center whitespace-nowrap font-bold text-[10px] border-b px-2 sticky top-[33px] z-30 bg-background">Voda 1</TableHead>
                                        <TableHead className="text-center whitespace-nowrap font-bold text-[10px] border-b px-2 sticky top-[33px] z-30 bg-background">Količina (m³)</TableHead>
                                        <TableHead className="whitespace-nowrap font-bold text-[10px] border-b sticky top-[33px] z-30 bg-background">Detalji</TableHead>
                                        <TableHead className="border-b sticky top-[33px] z-30 bg-background" />
                                        <TableHead className="border-b sticky top-[33px] z-30 bg-background" />
                                        <TableHead className="w-[40px] border-b sticky top-[33px] right-0 z-[40] bg-background"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={17} className="h-64 text-center">
                                                <div className="flex flex-col items-center gap-2">
                                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                                    <p className="text-sm text-muted-foreground">Učitavam izvještaje...</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : records.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={17} className="h-64 text-center text-muted-foreground font-medium">
                                                Nema pronađenih zapisa za odabrani period.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        <>
                                            {paginatedRecords.map((r, idx) => {
                                                const rowKey = `${format(r.date, 'yyyy-MM-dd')}_${r.recipe_number}`;
                                                const isExpanded = expandedRows.has(rowKey);

                                                return (
                                                    <React.Fragment key={rowKey}>
                                                        <TableRow
                                                            className={cn(
                                                                "transition-colors group cursor-pointer border-b border-muted/20",
                                                                idx % 2 !== 0 ? "bg-muted/5" : "bg-background",
                                                                "hover:bg-primary/5"
                                                            )}
                                                            onClick={() => {
                                                                const newExpanded = new Set(expandedRows);
                                                                if (isExpanded) {
                                                                    newExpanded.delete(rowKey);
                                                                } else {
                                                                    newExpanded.add(rowKey);
                                                                }
                                                                setExpandedRows(newExpanded);
                                                            }}
                                                        >
                                                            <TableCell className="w-[50px] py-0.5 text-center" onClick={(e) => e.stopPropagation()}>
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button variant="ghost" size="icon" className="h-6 w-6">
                                                                            <Download className="h-3.5 w-3.5 text-primary" />
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="start">
                                                                        <DropdownMenuItem
                                                                            onClick={() => exportImelToExcel(r.records, plant, month, year)}
                                                                            className="cursor-pointer"
                                                                        >
                                                                            <FileSpreadsheet className="mr-2 h-4 w-4 text-blue-600" />
                                                                            <div className="flex flex-col">
                                                                                <span>Excel - Ova receptura</span>
                                                                                <span className="text-[10px] text-muted-foreground">{r.recipe_number}</span>
                                                                            </div>
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem
                                                                            onClick={() => exportImelToPDF(r.records, plant, month, year, months)}
                                                                            className="cursor-pointer"
                                                                        >
                                                                            <FileText className="mr-2 h-4 w-4 text-purple-600" />
                                                                            <div className="flex flex-col">
                                                                                <span>PDF - Ova receptura</span>
                                                                                <span className="text-[10px] text-muted-foreground">{r.recipe_number}</span>
                                                                            </div>
                                                                        </DropdownMenuItem>
                                                                        <div className="h-px bg-muted my-1" />
                                                                        <DropdownMenuItem
                                                                            onClick={() => {
                                                                                const dayRecords = records.filter(rec => isSameDay(rec.date || new Date(), r.date || new Date()));
                                                                                exportImelToExcel(dayRecords, plant, month, year);
                                                                            }}
                                                                            className="cursor-pointer"
                                                                        >
                                                                            <FileSpreadsheet className="mr-2 h-4 w-4 text-emerald-600" />
                                                                            <span>Izvezi cijeli dan (Excel)</span>
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem
                                                                            onClick={() => {
                                                                                const dayRecords = records.filter(rec => isSameDay(rec.date || new Date(), r.date || new Date()));
                                                                                exportImelToPDF(dayRecords, plant, month, year, months);
                                                                            }}
                                                                            className="cursor-pointer"
                                                                        >
                                                                            <FileText className="mr-2 h-4 w-4 text-emerald-600" />
                                                                            <span>Izvezi cijeli dan (PDF)</span>
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </TableCell>
                                                            <TableCell className="whitespace-nowrap text-[10px] py-0.5">{format(r.date, 'dd.MM.yyyy')}</TableCell>
                                                            <TableCell className="whitespace-nowrap text-[10px] py-0.5">
                                                                {r.recipe_number}
                                                                {r.count > 1 && <span className="ml-1 text-[8px] text-muted-foreground">({r.count}x)</span>}
                                                            </TableCell>

                                                            {/* Display flattened material values: Agg1-4, Cem1-2, Add1-2 */}
                                                            <TableCell className="text-right font-mono text-[10px] py-0.5 px-2 border-l border-muted/30">{formatNumber(r.agg2_actual || 0)}</TableCell>
                                                            <TableCell className="text-right font-mono text-[10px] py-0.5 px-2 border-l border-muted/30">{formatNumber(r.agg3_actual || 0)}</TableCell>
                                                            <TableCell className="text-right font-mono text-[10px] py-0.5 px-2 border-l border-muted/30">{formatNumber(r.agg4_actual || 0)}</TableCell>
                                                            <TableCell className="text-right font-mono text-[10px] py-0.5 px-2 border-l border-muted/30">{formatNumber(r.agg1_actual || 0)}</TableCell>
                                                            <TableCell className="text-right font-mono text-[10px] py-0.5 px-2 border-l border-muted/30">{formatNumber(r.cem1_actual || 0)}</TableCell>
                                                            <TableCell className="text-right font-mono text-[10px] py-0.5 px-2 border-l border-muted/30">{formatNumber(r.cem2_actual || 0)}</TableCell>
                                                            <TableCell className="text-right font-mono text-[10px] py-0.5 px-2 border-l border-muted/30">{formatNumber(r.add1_actual || 0)}</TableCell>
                                                            <TableCell className="text-right font-mono text-[10px] py-0.5 px-2 border-l border-muted/30">{formatNumber(r.add2_actual || 0)}</TableCell>

                                                            <TableCell className="text-right font-mono text-[10px] py-0.5 px-2 border-l border-muted/30">{formatNumber(r.water1_actual || 0)}</TableCell>
                                                            <TableCell className="text-right font-bold text-[10px] py-0.5 px-2 border-l border-muted/30 text-emerald-700">{formatNumber(r.total_quantity, { minimumFractionDigits: 1 })}</TableCell>
                                                            <TableCell className="text-center text-[10px] py-0.5 border-l border-muted/30">
                                                                <ChevronRight className={cn("h-3 w-3 inline-block transition-transform", isExpanded && "rotate-90")} />
                                                            </TableCell>
                                                            <TableCell colSpan={2} className="py-0.5" />
                                                            <TableCell className="w-[40px] sticky right-0 z-10 bg-inherit py-0.5" />
                                                        </TableRow>

                                                        {/* Expanded details row */}
                                                        {isExpanded && (
                                                            <TableRow className="bg-muted/10">
                                                                <TableCell colSpan={17} className="p-0">
                                                                    <div className="bg-muted/5 border-t border-b">
                                                                        <Table>
                                                                            <TableHeader>
                                                                                <TableRow className="bg-muted/30">
                                                                                    <TableHead className="text-[9px] py-2 px-2">R. Nalog</TableHead>
                                                                                    <TableHead className="text-[9px] py-2 px-2">Datum</TableHead>
                                                                                    <TableHead className="text-[9px] py-2 px-2">Recept</TableHead>
                                                                                    <TableHead className="text-[9px] py-2 px-1 text-right">0-4</TableHead>
                                                                                    <TableHead className="text-[9px] py-2 px-1 text-right">Drob</TableHead>
                                                                                    <TableHead className="text-[9px] py-2 px-1 text-right">4-8</TableHead>
                                                                                    <TableHead className="text-[9px] py-2 px-1 text-right">8-16</TableHead>
                                                                                    <TableHead className="text-[9px] py-2 px-1 text-right">Cem1</TableHead>
                                                                                    <TableHead className="text-[9px] py-2 px-1 text-right">Cem2</TableHead>
                                                                                    <TableHead className="text-[9px] py-2 px-1 text-right">Sika V</TableHead>
                                                                                    <TableHead className="text-[9px] py-2 px-1 text-right">FM 500</TableHead>
                                                                                    <TableHead className="text-[9px] py-2 px-1 text-right">Voda</TableHead>
                                                                                    <TableHead className="text-[9px] py-2 px-1 text-right">m³</TableHead>
                                                                                    <TableHead className="text-[9px] py-2 px-2">Izdatnica</TableHead>
                                                                                </TableRow>
                                                                            </TableHeader>
                                                                            <TableBody>
                                                                                {r.records.map((record: any, i: number) => (
                                                                                    <TableRow key={i} className="hover:bg-muted/5">
                                                                                        <TableCell className="text-[9px] py-1 px-2 font-mono">{record.work_order_number || '-'}</TableCell>
                                                                                        <TableCell className="text-[9px] py-1 px-2">{format(record.date, 'dd.MM.yyyy')}</TableCell>
                                                                                        <TableCell className="text-[9px] py-1 px-2">{record.recipe_number}</TableCell>
                                                                                        <TableCell className="text-[9px] py-1 px-1 text-right font-mono">{formatNumber(record.agg2_actual || 0)}</TableCell>
                                                                                        <TableCell className="text-[9px] py-1 px-1 text-right font-mono">{formatNumber(record.agg3_actual || 0)}</TableCell>
                                                                                        <TableCell className="text-[9px] py-1 px-1 text-right font-mono">{formatNumber(record.agg4_actual || 0)}</TableCell>
                                                                                        <TableCell className="text-[9px] py-1 px-1 text-right font-mono">{formatNumber(record.agg1_actual || 0)}</TableCell>
                                                                                        <TableCell className="text-[9px] py-1 px-1 text-right font-mono">{formatNumber(record.cem1_actual || 0)}</TableCell>
                                                                                        <TableCell className="text-[9px] py-1 px-1 text-right font-mono">{formatNumber(record.cem2_actual || 0)}</TableCell>
                                                                                        <TableCell className="text-[9px] py-1 px-1 text-right font-mono">{formatNumber(record.add1_actual || 0)}</TableCell>
                                                                                        <TableCell className="text-[9px] py-1 px-1 text-right font-mono">{formatNumber(record.add2_actual || 0)}</TableCell>
                                                                                        <TableCell className="text-[9px] py-1 px-1 text-right font-mono">{formatNumber(record.water1_actual || 0)}</TableCell>
                                                                                        <TableCell className="text-[9px] py-1 px-1 text-right font-mono font-semibold">{formatNumber(record.total_quantity, { minimumFractionDigits: 1 })}</TableCell>
                                                                                        <TableCell className="text-[9px] py-1 px-2">{record.issuance_number || '-'}</TableCell>
                                                                                    </TableRow>
                                                                                ))}
                                                                            </TableBody>
                                                                        </Table>
                                                                    </div>
                                                                </TableCell>
                                                            </TableRow>
                                                        )}
                                                    </React.Fragment>
                                                );
                                            })}
                                            <TableRow className="bg-primary hover:bg-primary font-bold border-t-2 sticky bottom-0 z-30 text-white shadow-[0_-4px_10px_rgba(0,0,0,0.1)]">
                                                <TableCell colSpan={3} className="tracking-wider py-3 px-6 text-sm font-bold text-white uppercase">UKUPNO:</TableCell>

                                                {/* 8 material totals */}
                                                <TableCell className="text-right font-mono font-bold text-white text-sm px-2">{formatNumber(totals.agg2 || 0)}</TableCell>
                                                <TableCell className="text-right font-mono font-bold text-white text-sm px-2">{formatNumber(totals.agg3 || 0)}</TableCell>
                                                <TableCell className="text-right font-mono font-bold text-white text-sm px-2">{formatNumber(totals.agg4 || 0)}</TableCell>
                                                <TableCell className="text-right font-mono font-bold text-white text-sm px-2">{formatNumber(totals.agg1 || 0)}</TableCell>
                                                <TableCell className="text-right font-mono font-bold text-white text-sm px-2">{formatNumber(totals.cem1 || 0)}</TableCell>
                                                <TableCell className="text-right font-mono font-bold text-white text-sm px-2">{formatNumber(totals.cem2 || 0)}</TableCell>
                                                <TableCell className="text-right font-mono font-bold text-white text-sm px-2">{formatNumber(totals.add1 || 0)}</TableCell>
                                                <TableCell className="text-right font-mono font-bold text-white text-sm px-2">{formatNumber(totals.add2 || 0)}</TableCell>

                                                {/* Water total */}
                                                <TableCell className="text-right font-mono font-bold text-white text-sm px-2">{formatNumber(totals.water || 0)}</TableCell>

                                                {/* Total quantity of produced concrete */}
                                                <TableCell className="text-right font-bold text-white text-sm px-2">{formatNumber(totals.total || 0, { minimumFractionDigits: 1 })}</TableCell>

                                                {/* Empty cell for issuance number */}
                                                <TableCell />

                                                {/* 3 empty columns at the end */}
                                                <TableCell />
                                                <TableCell />
                                                <TableCell className="w-[40px] sticky right-0 z-[40] bg-primary" />
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
                                            <div className="flex items-center gap-1">
                                                <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600 text-[10px] h-5">
                                                    {totalOnDay.toFixed(1)} m³
                                                </Badge>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-muted">
                                                            <Download className="h-3 w-3 text-primary" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                const dayRecords = records.filter(rec => isSameDay(rec.date || new Date(), day));
                                                                exportImelToExcel(dayRecords, plant, month, year);
                                                            }}
                                                            className="cursor-pointer"
                                                        >
                                                            <FileSpreadsheet className="mr-2 h-4 w-4 text-blue-600" />
                                                            <span>Excel (.xlsx)</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                const dayRecords = records.filter(rec => isSameDay(rec.date || new Date(), day));
                                                                exportImelToPDF(dayRecords, plant, month, year, months);
                                                            }}
                                                            className="cursor-pointer"
                                                        >
                                                            <FileText className="mr-2 h-4 w-4 text-purple-600" />
                                                            <span>PDF (.pdf)</span>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        {totalOnDay && (
                                            <div className="flex flex-col gap-1">
                                                <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                                                    Broj unosa: {records.filter(r => isSameDay(r.date || new Date(), day)).length}
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

            <BetonaraRecordDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                record={selectedRecord}
                materials={materials}
                onSuccess={fetchData}
            />
        </div>
    );
}
