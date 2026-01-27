'use client';

import { Search, Building2 } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface CompaniesTableProps {
    companies: any[];
    searchQuery: string;
    setSearchQuery: (query: string) => void;
}

export default function CompaniesTable({
    companies,
    searchQuery,
    setSearchQuery
}: CompaniesTableProps) {
    return (
        <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50 dark:border-gray-800 flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <Input
                        placeholder="Pretraži firme..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-9 text-xs font-medium bg-gray-50/50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 focus:bg-white dark:focus:bg-gray-800 transition-all shadow-none"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent bg-gray-50/30 dark:bg-gray-900/30 border-gray-100 dark:border-gray-800">
                            <TableHead className="px-6 text-[10px] font-bold text-gray-400 dark:text-gray-500 text-left">Firma</TableHead>
                            <TableHead className="px-6 text-[10px] font-bold text-gray-400 dark:text-gray-500 text-left">ID broj</TableHead>
                            <TableHead className="px-6 text-[10px] font-bold text-gray-400 dark:text-gray-500 text-left">Grad</TableHead>
                            <TableHead className="px-6 text-[10px] font-bold text-gray-400 dark:text-gray-500 text-left">Kontakt</TableHead>
                            <TableHead className="px-6 text-[10px] font-bold text-gray-400 dark:text-gray-500 text-left">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {companies.map((company: any) => (
                            <TableRow key={company.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/50 border-gray-50 dark:border-gray-800 group">
                                <TableCell className="px-6 py-4 text-left">
                                    <Link href={`/companies/${company.id}`} className="flex items-center gap-3 hover:text-primary transition-colors">
                                        <div className="h-9 w-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 font-bold border border-gray-200 dark:border-gray-700">
                                            <Building2 className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900 dark:text-white leading-tight text-sm">{company.name}</div>
                                            <div className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">#{company.id.slice(0, 8)}</div>
                                        </div>
                                    </Link>
                                </TableCell>
                                <TableCell className="px-6 py-4 text-left">
                                    <span className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                                        {company.registration_number || '-'}
                                    </span>
                                </TableCell>
                                <TableCell className="px-6 py-4 text-left">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        {company.city || '-'}
                                    </span>
                                </TableCell>
                                <TableCell className="px-6 py-4 text-left">
                                    <div className="text-sm">
                                        {company.email && (
                                            <div className="text-gray-600 dark:text-gray-400 text-xs">{company.email}</div>
                                        )}
                                        {company.phone && (
                                            <div className="text-gray-500 dark:text-gray-500 text-xs">{company.phone}</div>
                                        )}
                                        {!company.email && !company.phone && '-'}
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-4 text-left">
                                    <Badge className={`font-bold text-[10px] gap-1.5 px-2 py-0.5 border-none ${company.status === 'active'
                                            ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                                            : 'bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-500'
                                        }`}>
                                        {company.status === 'active' && (
                                            <div className="h-1 w-1 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]"></div>
                                        )}
                                        {company.status === 'active' ? 'Aktivna' : 'Neaktivna'}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {companies.length === 0 && (
                <div className="p-12 text-center">
                    <p className="text-gray-400 dark:text-gray-500 text-xs font-black">Nema pronađenih firmi.</p>
                </div>
            )}
        </div>
    );
}
