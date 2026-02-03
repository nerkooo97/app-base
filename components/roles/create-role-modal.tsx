'use client';

import { useState } from 'react';
import SlideOver from '@/components/ui/slide-over';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface CreateRoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (data: { name: string, description: string, hierarchy: number }) => Promise<void>;
    isUpdating: boolean;
}

export default function CreateRoleModal({ isOpen, onClose, onCreate, isUpdating }: CreateRoleModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [hierarchy, setHierarchy] = useState(0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onCreate({ name, description, hierarchy });
        setName('');
        setDescription('');
        setHierarchy(0);
    };

    return (
        <SlideOver
            isOpen={isOpen}
            onClose={onClose}
            title="Nova uloga"
            description="Definišite osnovne parametre za novu ulogu u sistemu."
            onSubmit={handleSubmit}
            footer={
                <div className="flex flex-col gap-2 w-full">
                    <Button
                        className="w-full h-12 rounded-xl font-semibold shadow-sm active:scale-[0.98] transition-all"
                        type="submit"
                        disabled={isUpdating}
                    >
                        {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        {isUpdating ? 'Kreiranje...' : 'Kreiraj ulogu'}
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
                    <Label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 ml-1">Naziv uloge</Label>
                    <Input
                        placeholder="npr. Menadžer"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="h-11 rounded-xl border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 font-semibold focus:bg-white dark:focus:bg-gray-800 transition-all shadow-none placeholder:font-normal placeholder:text-gray-300 dark:placeholder:text-gray-600"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 ml-1">Opis</Label>
                    <Textarea
                        placeholder="Kratki opis prava ove uloge..."
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="min-h-[120px] rounded-xl border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 font-semibold focus:bg-white dark:focus:bg-gray-800 transition-all shadow-none placeholder:font-normal placeholder:text-gray-300 dark:placeholder:text-gray-600"
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 ml-1">Prioritet (0-100)</Label>
                    <Input
                        type="number"
                        value={hierarchy}
                        onChange={e => setHierarchy(parseInt(e.target.value))}
                        className="h-11 rounded-xl border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 font-semibold focus:bg-white dark:focus:bg-gray-800 transition-all shadow-none"
                    />
                </div>
            </div>
        </SlideOver>
    );
}
