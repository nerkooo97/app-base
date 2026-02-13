'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar as CalendarIcon, Table as TableIcon, Download, Plus, Search } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileSpreadsheet, FileText } from 'lucide-react';

interface ReportsFiltersProps {
    month: string;
    year: string;
    plant: string;
    view: string;
    recipeFilter: string;
    onMonthChange: (value: string) => void;
    onYearChange: (value: string) => void;
    onPlantChange: (value: string) => void;
    onViewChange: (value: string) => void;
    onRecipeFilterChange: (value: string) => void;
    onAddRecord: () => void;
    onExportExcel: () => void;
    onExportPDF: () => void;
    onExportImelExcel: () => void;
    onExportImelPDF: () => void;
}

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

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());

export function ReportsFilters({
    month,
    year,
    plant,
    view,
    recipeFilter,
    onMonthChange,
    onYearChange,
    onPlantChange,
    onViewChange,
    onRecipeFilterChange,
    onAddRecord,
    onExportExcel,
    onExportPDF,
    onExportImelExcel,
    onExportImelPDF,
}: ReportsFiltersProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
                <Select value={month} onValueChange={onMonthChange}>
                    <SelectTrigger className="w-[140px] bg-card">
                        <SelectValue placeholder="Mjesec" />
                    </SelectTrigger>
                    <SelectContent>
                        {months.map(m => (
                            <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={year} onValueChange={onYearChange}>
                    <SelectTrigger className="w-[100px] bg-card">
                        <SelectValue placeholder="Godina" />
                    </SelectTrigger>
                    <SelectContent>
                        {years.map(y => (
                            <SelectItem key={y} value={y}>{y}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={plant} onValueChange={onPlantChange}>
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
                        onClick={() => onViewChange('table')}
                    >
                        <TableIcon className="h-4 w-4 mr-2" />
                        Tabela
                    </Button>
                    <Button
                        variant={view === 'calendar' ? 'secondary' : 'ghost'}
                        size="sm"
                        className="h-8 px-3"
                        onClick={() => onViewChange('calendar')}
                    >
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        Kalendar
                    </Button>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Filtriraj po receptu..."
                        value={recipeFilter}
                        onChange={(e) => onRecipeFilterChange(e.target.value)}
                        className="pl-9 w-[200px] bg-card"
                    />
                </div>
            </div>

            <div className="flex gap-2">
                <Button
                    variant="default"
                    size="sm"
                    onClick={onAddRecord}
                    className="bg-primary"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Dodaj zapis
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="bg-card">
                            <Download className="mr-2 h-4 w-4" />
                            Izvezi
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[200px]">
                        <DropdownMenuItem onClick={onExportExcel} className="cursor-pointer">
                            <FileSpreadsheet className="mr-2 h-4 w-4 text-emerald-600" />
                            <span>Izvezi u Excel (.xlsx)</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onExportPDF} className="cursor-pointer">
                            <FileText className="mr-2 h-4 w-4 text-red-600" />
                            <span>Izvezi u PDF (.pdf)</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onExportImelExcel} className="cursor-pointer">
                            <FileSpreadsheet className="mr-2 h-4 w-4 text-blue-600" />
                            <span>IMEL Excel (.xlsx)</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onExportImelPDF} className="cursor-pointer">
                            <FileText className="mr-2 h-4 w-4 text-purple-600" />
                            <span>IMEL PDF (.pdf)</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
