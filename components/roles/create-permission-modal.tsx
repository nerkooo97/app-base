'use client';

import { useState } from 'react';
import SlideOver from '@/components/ui/slide-over';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Key } from 'lucide-react';

interface CreatePermissionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (name: string) => Promise<void>;
    isUpdating: boolean;
}

export default function CreatePermissionModal({ isOpen, onClose, onCreate, isUpdating }: CreatePermissionModalProps) {
    const [name, setName] = useState('');

    const handleSubmit = async () => {
        if (!name.trim()) return;
        await onCreate(name);
        setName('');
    };

    return (
        <SlideOver
            isOpen={isOpen}
            onClose={onClose}
            title="Nova dozvola"
            description="Kreirajte specifični ključ za novu sistemsku dozvolu."
        >
            <div className="space-y-6 text-left">
                <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-gray-400 ml-1">Identifikator dozvole</Label>
                    <Input
                        placeholder="npr. invoices.create"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="h-11 rounded-xl border-gray-100 bg-gray-50/50 font-bold focus:bg-white transition-all shadow-none placeholder:text-gray-300 placeholder:font-normal"
                    />
                    <p className="text-[9px] text-gray-400 mt-2 ml-1 italic font-bold opacity-70">
                        Preporuka: koristite format 'modul.akcija' (npr. 'users.edit')
                    </p>
                </div>
                <div className="pt-6 space-y-3">
                    <Button
                        className="w-full h-12 rounded-xl font-bold shadow-sm active:scale-[0.98] transition-all"
                        onClick={handleSubmit}
                        disabled={isUpdating || !name.trim()}
                    >
                        {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Key className="h-4 w-4 mr-2" />}
                        {isUpdating ? 'Čuvanje...' : 'Sačuvaj dozvolu'}
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
