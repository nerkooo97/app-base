'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2 } from 'lucide-react';
import { createContact } from '@/app/(app)/companies/actions';
import { useToast } from '@/components/ui/toast-provider';

interface CreateContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    companyId: string;
    onSuccess: () => void;
}

export default function CreateContactModal({ isOpen, onClose, companyId, onSuccess }: CreateContactModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { showToast } = useToast();
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        position: '',
        department: '',
        email: '',
        phone: '',
        mobile: '',
        is_primary: false,
        notes: '',
    });

    const handleChange = (field: string, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const result = await createContact({
                company_id: companyId,
                ...formData,
            });

            if (result.success) {
                showToast('success', 'Kontakt uspješno dodan!');
                setFormData({
                    first_name: '',
                    last_name: '',
                    position: '',
                    department: '',
                    email: '',
                    phone: '',
                    mobile: '',
                    is_primary: false,
                    notes: '',
                });
                onSuccess();
                onClose();
            } else {
                showToast('error', 'Greška: ' + result.error);
            }
        } catch (error) {
            showToast('error', 'Greška pri dodavanju kontakta');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-950 border-gray-100 dark:border-gray-800">
                <DialogHeader>
                    <DialogTitle className="text-lg font-black text-gray-900 dark:text-white font-outfit">
                        Dodaj kontakt osobu
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 ml-1">
                                Ime <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                required
                                value={formData.first_name}
                                onChange={(e) => handleChange('first_name', e.target.value)}
                                className="h-11 rounded-xl border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 font-bold focus:bg-white dark:focus:bg-gray-800 transition-all shadow-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 ml-1">
                                Prezime <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                required
                                value={formData.last_name}
                                onChange={(e) => handleChange('last_name', e.target.value)}
                                className="h-11 rounded-xl border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 font-bold focus:bg-white dark:focus:bg-gray-800 transition-all shadow-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 ml-1">Pozicija</Label>
                            <Input
                                value={formData.position}
                                onChange={(e) => handleChange('position', e.target.value)}
                                className="h-11 rounded-xl border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 font-bold focus:bg-white dark:focus:bg-gray-800 transition-all shadow-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 ml-1">Odjel</Label>
                            <Input
                                value={formData.department}
                                onChange={(e) => handleChange('department', e.target.value)}
                                className="h-11 rounded-xl border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 font-bold focus:bg-white dark:focus:bg-gray-800 transition-all shadow-none"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 ml-1">Email</Label>
                        <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            className="h-11 rounded-xl border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 font-bold focus:bg-white dark:focus:bg-gray-800 transition-all shadow-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 ml-1">Telefon</Label>
                            <Input
                                value={formData.phone}
                                onChange={(e) => handleChange('phone', e.target.value)}
                                className="h-11 rounded-xl border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 font-bold focus:bg-white dark:focus:bg-gray-800 transition-all shadow-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 ml-1">Mobitel</Label>
                            <Input
                                value={formData.mobile}
                                onChange={(e) => handleChange('mobile', e.target.value)}
                                className="h-11 rounded-xl border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 font-bold focus:bg-white dark:focus:bg-gray-800 transition-all shadow-none"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="is_primary"
                            checked={formData.is_primary}
                            onCheckedChange={(checked) => handleChange('is_primary', checked as boolean)}
                        />
                        <Label htmlFor="is_primary" className="text-sm font-bold text-gray-700 dark:text-gray-300 cursor-pointer">
                            Postavi kao primarni kontakt
                        </Label>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 ml-1">Napomene</Label>
                        <Textarea
                            value={formData.notes}
                            onChange={(e) => handleChange('notes', e.target.value)}
                            className="min-h-[80px] rounded-xl border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900 font-bold focus:bg-white dark:focus:bg-gray-800 transition-all shadow-none resize-none"
                        />
                    </div>

                    <div className="flex items-center gap-4 justify-end pt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            className="h-11 px-8 rounded-xl font-bold"
                            disabled={isLoading}
                        >
                            Odustani
                        </Button>
                        <Button
                            type="submit"
                            className="h-11 px-8 rounded-xl font-bold shadow-sm active:scale-95 transition-all"
                            disabled={isLoading}
                        >
                            {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                            Dodaj kontakt
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
