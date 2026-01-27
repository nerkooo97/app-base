'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface UsersHeaderProps {
    onAddUser: () => void;
}

export default function UsersHeader({ onAddUser }: UsersHeaderProps) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-semibold text-gray-900 dark:text-white font-outfit tracking-tight">Korisnici</h1>
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">
                    Upravljanje ulogama i pristupom korisnika
                </p>
            </div>
            <div className="flex items-center gap-3">
                <Button
                    onClick={onAddUser}
                    size="lg"
                    className="px-6 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95 font-bold text-xs"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Novi korisnik
                </Button>
            </div>
        </div>
    );
}
