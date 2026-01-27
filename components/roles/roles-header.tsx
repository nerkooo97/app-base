'use client';

import { Button } from '@/components/ui/button';
import { Plus, ShieldPlus } from 'lucide-react';

interface RolesHeaderProps {
    onNewRole: () => void;
    onNewPermission: () => void;
}

export default function RolesHeader({ onNewRole, onNewPermission }: RolesHeaderProps) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-semibold text-gray-900 dark:text-white font-outfit tracking-tight">Uloge i dozvole</h1>
                <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">
                    Definišite šta različite grupe korisnika mogu raditi u sistemu
                </p>
            </div>
            <div className="flex items-center gap-3">
                <Button
                    variant="outline"
                    onClick={onNewPermission}
                    className="h-10 px-4 text-xs font-bold border-gray-200 hover:bg-gray-50 hover:text-gray-900 shadow-none rounded-xl"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Nova dozvola
                </Button>
                <Button
                    onClick={onNewRole}
                    className="h-10 px-6 text-xs font-bold shadow-sm rounded-xl transition-all active:scale-95"
                >
                    <ShieldPlus className="h-4 w-4 mr-2" />
                    Nova uloga
                </Button>
            </div>
        </div>
    );
}
