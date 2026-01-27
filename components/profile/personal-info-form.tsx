'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, User, Check } from 'lucide-react';
import { updatePersonalInfo } from '@/app/(app)/profile/actions';
import { useToast } from '@/components/ui/toast-provider';

interface PersonalInfoFormProps {
    initialFullName: string;
}

export default function PersonalInfoForm({ initialFullName }: PersonalInfoFormProps) {
    const [fullName, setFullName] = useState(initialFullName);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const { showToast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdating(true);
        setIsSaved(false);
        try {
            await updatePersonalInfo(fullName);
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 3000);
        } catch (error) {
            showToast('error', 'Greška pri ažuriranju podataka');
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <Card className="border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <CardHeader className="bg-gray-50/30 dark:bg-gray-900/30 border-b border-gray-100 dark:border-gray-800 py-6 px-8">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/5 dark:bg-primary/10 flex items-center justify-center border border-primary/10 dark:border-primary/20">
                        <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-lg font-black text-gray-900 dark:text-white font-outfit">Lični podaci</CardTitle>
                        <CardDescription className="text-xs font-bold text-gray-400 dark:text-gray-500">Vaše ime koje će biti vidljivo u sistemu.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 ml-1">Puno ime i prezime</Label>
                        <Input
                            placeholder="npr. Amar Hadžić"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="h-11 rounded-xl border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 font-bold focus:bg-white dark:focus:bg-gray-800 transition-all shadow-none"
                        />
                    </div>
                    <div className="flex items-center gap-4 pt-2">
                        <Button
                            type="submit"
                            disabled={isUpdating || fullName === initialFullName}
                            className="h-11 px-8 rounded-xl font-bold shadow-sm active:scale-95 transition-all"
                        >
                            {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Sačuvaj izmjene
                        </Button>
                        {isSaved && (
                            <div className="flex items-center gap-2 text-emerald-500 dark:text-emerald-400 font-bold text-xs animate-in fade-in slide-in-from-left-2 transition-all">
                                <Check className="h-4 w-4" />
                                Podaci sačuvani
                            </div>
                        )}
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
