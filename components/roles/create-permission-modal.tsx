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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
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
            onSubmit={handleSubmit}
            footer={
                <div className="flex flex-col gap-2 w-full">
                    <Button
                        className="w-full h-12 rounded-xl font-bold shadow-sm active:scale-[0.98] transition-all"
                        type="submit"
                        disabled={isUpdating || !name.trim()}
                    >
                        {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Key className="h-4 w-4 mr-2" />}
                        {isUpdating ? 'Čuvanje...' : 'Sačuvaj dozvolu'}
                    </Button>
                    <Button
                        variant="ghost"
                        type="button"
                        className="w-full h-12 rounded-xl font-bold text-gray-400 hover:text-gray-900 hover:bg-gray-50 dark:hover:bg-gray-900 shadow-none transition-all"
                        onClick={onClose}
                    >
                        Odustani
                    </Button>
                </div>
            }
        >
            <div className="space-y-6 text-left">
                <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 ml-1">Identifikator dozvole</Label>
                    <Input
                        placeholder="npr. invoices.create"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="h-11 rounded-xl border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 font-bold focus:bg-white dark:focus:bg-gray-800 transition-all shadow-none placeholder:text-gray-300 dark:placeholder:text-gray-600 placeholder:font-normal"
                        required
                    />
                    <p className="text-[9px] text-gray-400 dark:text-gray-500 mt-2 ml-1 italic font-bold opacity-70">
                        Preporuka: koristite format 'modul.akcija' (npr. 'users.edit')
                    </p>
                </div>
            </div>
        </SlideOver>
    );
}
