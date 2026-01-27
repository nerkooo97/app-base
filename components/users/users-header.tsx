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
                <h1 className="text-2xl font-black text-gray-900 font-outfit">Korisnici</h1>
                <p className="text-xs font-bold text-gray-400 mt-1">Upravljanje ulogama i pristupom korisnika.</p>
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
