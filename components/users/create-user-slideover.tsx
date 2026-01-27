'use client';

import { useState } from 'react';
import SlideOver from '@/components/ui/slide-over';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Loader2, UserPlus } from 'lucide-react';
import { useToast } from '@/components/ui/toast-provider';

interface CreateUserSlideOverProps {
    isOpen: boolean;
    onClose: () => void;
    roles: any[];
    onCreate: (data: { email: string, fullName: string, roleId: number }) => Promise<void>;
    isUpdating: boolean;
}

export default function CreateUserSlideOver({ isOpen, onClose, roles, onCreate, isUpdating }: CreateUserSlideOverProps) {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [roleId, setRoleId] = useState<string>('0');
    const { showToast } = useToast();

    const handleSubmit = async () => {
        if (!email || !fullName) {
            showToast('warning', 'Molimo popunite ime i email');
            return;
        }
        await onCreate({ fullName, email, roleId: parseInt(roleId) });
        setFullName('');
        setEmail('');
        setRoleId('0');
    };

    return (
        <SlideOver
            isOpen={isOpen}
            onClose={onClose}
            title="Novi korisnik"
            description="Dodajte novog člana tima i dodijelite mu početnu ulogu."
        >
            <div className="space-y-6 text-left">
                <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-gray-400 ml-1">Puno ime</Label>
                    <Input
                        placeholder="npr. Amar Hadžić"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        className="h-11 rounded-xl border-gray-100 bg-gray-50/50 font-bold focus:bg-white transition-all shadow-none placeholder:text-gray-300 placeholder:font-normal"
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-gray-400 ml-1">Email adresa</Label>
                    <Input
                        type="email"
                        placeholder="amar@example.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="h-11 rounded-xl border-gray-100 bg-gray-50/50 font-bold focus:bg-white transition-all shadow-none placeholder:text-gray-300 placeholder:font-normal"
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-gray-400 ml-1">Uloga</Label>
                    <Select value={roleId} onValueChange={setRoleId}>
                        <SelectTrigger className="h-11 rounded-xl border-gray-100 bg-gray-50/50 font-bold focus:bg-white transition-all shadow-none">
                            <SelectValue placeholder="Izaberi ulogu..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="0" disabled>Izaberi ulogu...</SelectItem>
                            {roles.map(role => (
                                <SelectItem key={role.id} value={role.id.toString()}>
                                    {role.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="pt-6">
                    <Button
                        className="w-full h-12 rounded-xl font-bold shadow-sm active:scale-[0.98] transition-all"
                        onClick={handleSubmit}
                        disabled={isUpdating}
                    >
                        {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
                        {isUpdating ? 'Slanje pozivnice...' : 'Kreiraj korisnika'}
                    </Button>
                    <Button
                        variant="ghost"
                        className="w-full h-12 rounded-xl font-bold text-gray-400 hover:text-gray-900 hover:bg-gray-50 shadow-none transition-all mt-2"
                        onClick={onClose}
                    >
                        Odustani
                    </Button>
                </div>
            </div>
        </SlideOver>
    );
}
