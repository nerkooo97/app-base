'use client';

import { useState, useEffect } from 'react';
import { BetonaraProductionRecord, BetonaraMaterial } from '@/types/betonara';
import { upsertManualProizvodnjaBetona, deleteProizvodnjaBetonaRecord } from '@/lib/actions/betonara-v2';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { Loader2, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface RecordDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    record?: BetonaraProductionRecord | null;
    materials: BetonaraMaterial[];
    onSuccess: () => void;
}

export function BetonaraRecordDialog({ open, onOpenChange, record, materials, onSuccess }: RecordDialogProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<any>({});

    useEffect(() => {
        if (record) {
            setFormData({ ...record, plant: (record as any).betonara_id || 'Betonara 1' });
        } else {
            setFormData({
                date: new Date(),
                plant: 'Betonara 1',
                total_quantity: 0,
                recipe_number: '',
                agg1_actual: 0,
                agg2_actual: 0,
                agg3_actual: 0,
                agg4_actual: 0,
                cem1_actual: 0,
                cem2_actual: 0,
                add1_actual: 0,
                add2_actual: 0,
                water1_actual: 0,
            });
        }
    }, [record, open]);

    const handleSave = async () => {
        if (!formData.date || !formData.recipe_number) {
            toast.error('Datum i receptura su obavezni');
            return;
        }

        setLoading(true);
        try {
            // Generate ID if it's a new record
            const timestamp = new Date(formData.date).getTime();
            const recordId = record?.id || `manual_${timestamp}_${Math.random().toString(36).substr(2, 5)}`;

            await upsertManualProizvodnjaBetona({
                ...formData,
                id: recordId,
            });

            toast.success(record ? 'Zapis ažuriran' : 'Zapis dodan');
            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!record?.id) return;
        if (!confirm('Jeste li sigurni da želite obrisati ovaj zapis?')) return;

        setLoading(true);
        try {
            await deleteProizvodnjaBetonaRecord(record.id);
            toast.success('Zapis obrisan');
            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[95vw] max-w-[95vw] max-h-[90vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle>{record ? 'Uredi proizvodni zapis' : 'Novi proizvodni zapis'}</DialogTitle>
                    <DialogDescription>
                        Ručno unesite ili korigujte podatke iz proizvodnje. Podaci će biti sačuvani u bazu za izvještaje.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin space-y-6">
                    {/* Section 1: Basic Info */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b pb-2">Osnovni podaci</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2 col-span-2">
                                <Label>Betonara</Label>
                                <Select
                                    value={formData.plant}
                                    onValueChange={(val) => setFormData((v: any) => ({ ...v, plant: val }))}
                                >
                                    <SelectTrigger className="h-10 border-primary/20">
                                        <SelectValue placeholder="Odaberi" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Betonara 1">Betonara 1</SelectItem>
                                        <SelectItem value="Betonara 2">Betonara 2</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Broj naloga</Label>
                                <Input
                                    className="h-10 border-primary/20 focus:border-primary font-mono"
                                    placeholder="npr. 1234..."
                                    value={formData.work_order_number || ''}
                                    onChange={(e) => setFormData((v: any) => ({ ...v, work_order_number: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Datum i vrijeme</Label>
                                <Input
                                    className="h-10 border-primary/20 focus:border-primary"
                                    type="datetime-local"
                                    value={formData.date ? format(new Date(formData.date), "yyyy-MM-dd'T'HH:mm") : ''}
                                    onChange={(e) => setFormData((v: any) => ({ ...v, date: new Date(e.target.value) }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Naziv recepture</Label>
                                <Input
                                    className="h-10 border-primary/20 focus:border-primary"
                                    placeholder="npr. MD 60..."
                                    value={formData.recipe_number || ''}
                                    onChange={(e) => setFormData((v: any) => ({ ...v, recipe_number: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Ukupna količina (m³)</Label>
                                <Input
                                    className="h-10 border-primary/20 focus:border-primary font-bold text-emerald-600"
                                    type="number" step="0.01"
                                    value={formData.total_quantity || 0}
                                    onChange={(e) => setFormData((v: any) => ({ ...v, total_quantity: parseFloat(e.target.value) || 0 }))}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Section 2: Aggregates */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b pb-2">Agregati (kg)</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                            {[1, 2, 3, 4, 5, 6].map(num => (
                                <div key={num} className="space-y-2">
                                    <Label className="text-[11px]">Agg{num}</Label>
                                    <Input
                                        className="h-9 font-mono" type="number"
                                        value={formData[`agg${num}_actual`] || 0}
                                        onChange={e => setFormData((v: any) => ({ ...v, [`agg${num}_actual`]: parseFloat(e.target.value) || 0 }))}
                                    />
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Section 3: Cements & Additives */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between border-b pb-2">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Cementi, Aditivi i Voda</h3>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                            {[1, 2, 3, 4].map(num => (
                                <div key={num} className="space-y-1.5">
                                    <Label className="text-[10px]">Cem{num}</Label>
                                    <Input
                                        className="h-8 text-[11px] font-mono text-blue-700" type="number"
                                        value={formData[`cem${num}_actual`] || 0}
                                        onChange={e => setFormData((v: any) => ({ ...v, [`cem${num}_actual`]: parseFloat(e.target.value) || 0 }))}
                                    />
                                </div>
                            ))}
                            {[1, 2, 3, 4, 5].map(num => (
                                <div key={num} className="space-y-1.5">
                                    <Label className="text-[10px]">Add{num}</Label>
                                    <Input
                                        className="h-8 text-[11px] font-mono text-purple-700" type="number"
                                        value={formData[`add${num}_actual`] || 0}
                                        onChange={e => setFormData((v: any) => ({ ...v, [`add${num}_actual`]: parseFloat(e.target.value) || 0 }))}
                                    />
                                </div>
                            ))}
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold text-blue-600">Wat1</Label>
                                <Input
                                    className="h-8 text-[11px] font-mono border-blue-200 bg-blue-50/20" type="number"
                                    value={formData.water1_actual || 0}
                                    onChange={e => setFormData((v: any) => ({ ...v, water1_actual: parseFloat(e.target.value) || 0 }))}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold text-blue-600">Wat2</Label>
                                <Input
                                    className="h-8 text-[11px] font-mono border-blue-200 bg-blue-50/20" type="number"
                                    value={formData.water2_actual || 0}
                                    onChange={e => setFormData((v: any) => ({ ...v, water2_actual: parseFloat(e.target.value) || 0 }))}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Section 4: Logistics & Extra */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b pb-2">Logistika i ostalo</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <Label>Kupac</Label>
                                <Input
                                    className="h-9"
                                    value={formData.customer || ''}
                                    onChange={(e) => setFormData((v: any) => ({ ...v, customer: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Gradilište</Label>
                                <Input
                                    className="h-9"
                                    value={formData.jobsite || ''}
                                    onChange={(e) => setFormData((v: any) => ({ ...v, jobsite: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Vozač</Label>
                                <Input
                                    className="h-9"
                                    value={formData.driver || ''}
                                    onChange={(e) => setFormData((v: any) => ({ ...v, driver: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Vozilo</Label>
                                <Input
                                    className="h-9"
                                    value={formData.vehicle || ''}
                                    onChange={(e) => setFormData((v: any) => ({ ...v, vehicle: e.target.value }))}
                                />
                            </div>
                        </div>
                    </section>
                </div>
                <DialogFooter className="p-6 pt-2 gap-2 border-t mt-auto">
                    {record && (
                        <Button
                            variant="outline"
                            className="text-red-500 hover:text-red-600 border-red-200 hover:bg-red-50"
                            onClick={handleDelete}
                            disabled={loading}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Obriši
                        </Button>
                    )}
                    <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={loading}>
                        Odustani
                    </Button>
                    <Button onClick={handleSave} disabled={loading} className="min-w-[120px]">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                        Spremi
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
