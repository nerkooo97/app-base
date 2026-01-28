'use client';

import { useState, useEffect } from 'react';
import SlideOver from '@/components/ui/slide-over';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from '@/components/ui/label';
import { Loader2, UserCheck } from 'lucide-react';

interface Role {
    id: number;
    name: string;
}

interface User {
    user_id: string;
    full_name: string;
    user_roles?: {
        role_id: number;
    }[];
}

interface EditRoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    roles: Role[];
    onSave: (userId: string, roleId: number) => Promise<void>;
    isUpdating: boolean;
}

export default function EditRoleModal({ isOpen, onClose, user, roles, onSave, isUpdating }: EditRoleModalProps) {
    const [roleId, setRoleId] = useState<string>('0');

    useEffect(() => {
        if (user) {
            setRoleId(user.user_roles?.[0]?.role_id?.toString() || '0');
        }
    }, [user]);

    const handleSubmit = async () => {
        if (!user) return;
        await onSave(user.user_id, parseInt(roleId));
    };

    return (
        <SlideOver
            isOpen={isOpen}
            onClose={onClose}
            title="Uredi korisnika"
            description="Ažurirajte dozvole i sistemsku ulogu za izabranog korisnika."
        >
            <div className="space-y-6 text-left">
                <div className="p-5 bg-gray-50/50 rounded-2xl border border-gray-100 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center font-semibold text-primary shadow-sm">
                        {user?.full_name?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{user?.full_name}</p>
                        <p className="text-[10px] text-gray-400 font-semibold font-mono uppercase tracking-wider">ID: {user?.user_id}</p>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-gray-400 ml-1">Sistemska uloga</Label>
                    <Select value={roleId} onValueChange={setRoleId}>
                        <SelectTrigger className="h-11 rounded-xl border-gray-100 bg-gray-50/50 font-semibold focus:bg-white transition-all shadow-none">
                            <SelectValue placeholder="Izaberi ulogu..." />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-gray-100 p-1">
                            <SelectItem value="0" className="rounded-lg font-semibold text-xs py-2">Bez uloge</SelectItem>
                            {roles.map(role => (
                                <SelectItem key={role.id} value={role.id.toString()} className="rounded-lg font-semibold text-xs py-2">
                                    {role.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="pt-6 space-y-3">
                    <Button
                        className="w-full h-12 rounded-xl font-semibold shadow-sm active:scale-[0.98] transition-all"
                        onClick={handleSubmit}
                        disabled={isUpdating}
                    >
                        {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserCheck className="h-4 w-4 mr-2" />}
                        {isUpdating ? 'Ažuriranje...' : 'Sačuvaj izmjene'}
                    </Button>
                    <Button
                        variant="ghost"
                        className="w-full h-12 rounded-xl font-bold text-gray-400 hover:text-gray-900 hover:bg-gray-50 shadow-none transition-all"
                        onClick={onClose}
                    >
                        Odustani
                    </Button>
                </div>
            </div>
        </SlideOver>
    );
}
