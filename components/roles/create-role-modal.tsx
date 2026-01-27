'use client';

import { useState } from 'react';
import SlideOver from '@/components/ui/slide-over';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

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

    const handleSubmit = async () => {
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
        >
            <div className="space-y-6 text-left">
                <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-gray-400 ml-1">Naziv uloge</Label>
                    <Input
                        placeholder="npr. Menadžer"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="h-11 rounded-xl border-gray-100 bg-gray-50/50 font-semibold focus:bg-white transition-all shadow-none placeholder:font-normal placeholder:text-gray-300"
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-gray-400 ml-1">Opis</Label>
                    <textarea
                        placeholder="Kratki opis prava ove uloge..."
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="flex min-h-[100px] w-full rounded-xl border border-gray-100 bg-gray-50/50 px-3 py-2 text-sm font-semibold ring-offset-background placeholder:text-gray-300 placeholder:font-normal focus:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-none"
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-gray-400 ml-1">Prioritet (0-100)</Label>
                    <Input
                        type="number"
                        value={hierarchy}
                        onChange={e => setHierarchy(parseInt(e.target.value))}
                        className="h-11 rounded-xl border-gray-100 bg-gray-50/50 font-semibold focus:bg-white transition-all shadow-none"
                    />
                </div>
                <div className="pt-6 space-y-3">
                    <Button
                        className="w-full h-12 rounded-xl font-semibold shadow-sm active:scale-[0.98] transition-all"
                        onClick={handleSubmit}
                        disabled={isUpdating}
                    >
                        {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        {isUpdating ? 'Kreiranje...' : 'Kreiraj ulogu'}
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
