'use client';

import { Search, Pencil, MoreHorizontal, KeyRound } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface UsersTableProps {
    users: any[];
    onEditUser: (user: any) => void;
    onResetPassword: (user: any) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    statusFilter: string;
    setStatusFilter: (status: string) => void;
}

export default function UsersTable({
    users,
    onEditUser,
    onResetPassword,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter
}: UsersTableProps) {
    return (
        <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-50 dark:border-gray-800 flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <Input
                        placeholder="Pretraži korisnike..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-9 text-xs font-medium bg-gray-50/50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 focus:bg-white dark:focus:bg-gray-800 transition-all shadow-none"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px] h-9 text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-none">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Svi statusi</SelectItem>
                        <SelectItem value="active">Aktivan</SelectItem>
                        <SelectItem value="inactive">Neaktivan</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent bg-gray-50/30 dark:bg-gray-900/30 border-gray-100 dark:border-gray-800">
                            <TableHead className="w-12 px-6">
                                <input type="checkbox" className="rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary" />
                            </TableHead>
                            <TableHead className="px-6 text-[10px] font-bold text-gray-400 dark:text-gray-500 text-left">Korisnik</TableHead>
                            <TableHead className="px-6 text-[10px] font-bold text-gray-400 dark:text-gray-500 text-left">Uloge</TableHead>
                            <TableHead className="px-6 text-[10px] font-bold text-gray-400 dark:text-gray-500 text-left">Status</TableHead>
                            <TableHead className="px-6 text-[10px] font-bold text-gray-400 dark:text-gray-500 text-right">Akcije</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user: any) => (
                            <TableRow key={user.user_id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/50 border-gray-50 dark:border-gray-800 group">
                                <TableCell className="px-6 py-4">
                                    <input type="checkbox" className="rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary" />
                                </TableCell>
                                <TableCell className="px-6 py-4 text-left">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 font-bold border border-gray-200 dark:border-gray-700">
                                            {user.full_name?.[0]}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900 dark:text-white leading-tight text-sm">{user.full_name}</div>
                                            <div className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">#{user.user_id.slice(0, 8)}</div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-4 text-left">
                                    <div className="flex flex-wrap gap-1.5">
                                        {user.user_roles?.map((ur: any) => (
                                            <Badge
                                                key={ur.roles?.name}
                                                variant="secondary"
                                                className="bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-800 font-bold text-[10px] py-0 px-2 shadow-none"
                                            >
                                                {ur.roles?.name}
                                            </Badge>
                                        )) || (
                                                <span className="text-[10px] text-gray-300 dark:text-gray-600 italic font-bold">Bez uloge</span>
                                            )}
                                    </div>
                                </TableCell>
                                <TableCell className="px-6 py-4 text-left">
                                    <Badge className="bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900 hover:bg-emerald-100 dark:hover:bg-emerald-900 shadow-none font-bold text-[10px] gap-1.5 px-2 py-0.5 border-none">
                                        <div className="h-1 w-1 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]"></div>
                                        Aktivan
                                    </Badge>
                                </TableCell>
                                <TableCell className="px-6 py-4 text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-gray-400 dark:text-gray-500 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                                            >
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-48">
                                            <DropdownMenuItem onClick={() => onEditUser(user)} className="gap-2 cursor-pointer">
                                                <Pencil className="h-4 w-4" />
                                                Uredi ulogu
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => onResetPassword(user)} className="gap-2 cursor-pointer">
                                                <KeyRound className="h-4 w-4" />
                                                Resetuj lozinku
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {users.length === 0 && (
                <div className="p-12 text-center">
                    <p className="text-gray-400 dark:text-gray-500 text-xs font-black">Nema pronađenih korisnika.</p>
                </div>
            )}
        </div>
    );
}
