'use client';

import { useState, useEffect } from 'react';
import { BetonaraProductionRecord, BetonaraMaterial } from '@/types/betonara';
import { upsertManualProductionRecord, deleteProductionRecord } from '@/lib/actions/betonara';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
    const [formData, setFormData] = useState<Partial<BetonaraProductionRecord>>({});

    useEffect(() => {
        if (record) {
            setFormData({ ...record });
        } else {
            setFormData({
                date: new Date(),
                plant: 'Betonara 1',
                materials: {},
                target_materials: {},
                total_quantity: 0,
                water: 0,
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
            
            await upsertManualProductionRecord({
                ...formData,
                id: recordId,
            } as BetonaraProductionRecord);

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
            await deleteProductionRecord(record.id);
            toast.success('Zapis obrisan');
            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const updateMaterial = (code: string, value: string) => {
        const num = parseFloat(value) || 0;
        setFormData(prev => ({
            ...prev,
            materials: {
                ...(prev.materials || {}),
                [code]: num
            }
        }));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle>{record ? 'Uredi proizvodni zapis' : 'Novi proizvodni zapis'}</DialogTitle>
                    <DialogDescription>
                        Ručno unesite ili korigujte podatke iz proizvodnje. Sve izmjene se bilježe u historiju.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin space-y-8">
                    {/* Section 1: Basic Info */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b pb-2">Osnovni podaci</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Datum i vrijeme</Label>
                                <Input 
                                    className="h-10 border-primary/20 focus:border-primary"
                                    type="datetime-local" 
                                    value={formData.date ? format(new Date(formData.date), "yyyy-MM-dd'T'HH:mm") : ''}
                                    onChange={(e) => setFormData(v => ({ ...v, date: new Date(e.target.value) }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Naziv recepture</Label>
                                <Input 
                                    className="h-10 border-primary/20 focus:border-primary"
                                    placeholder="npr. MD 60..."
                                    value={formData.recipe_number || ''} 
                                    onChange={(e) => setFormData(v => ({ ...v, recipe_number: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Ukupna količina (m³)</Label>
                                <Input 
                                    className="h-10 border-primary/20 focus:border-primary font-bold text-emerald-600"
                                    type="number" step="0.01"
                                    value={formData.total_quantity || 0} 
                                    onChange={(e) => setFormData(v => ({ ...v, total_quantity: parseFloat(e.target.value) || 0 }))}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Section 2: Aggregates */}
                    <section className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b pb-2">Agregati (kg)</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[11px]">Riječni 0-4 (Agg1)</Label>
                                <Input 
                                    className="h-9 font-mono" type="number"
                                    value={formData.agg1_actual || 0} 
                                    onChange={e => setFormData(v => ({...v, agg1_actual: parseFloat(e.target.value) || 0}))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[11px]">Drobljeni 0-4 (Agg2)</Label>
                                <Input 
                                    className="h-9 font-mono" type="number"
                                    value={formData.agg2_actual || 0} 
                                    onChange={e => setFormData(v => ({...v, agg2_actual: parseFloat(e.target.value) || 0}))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[11px]">Frakcija 4-8 (Agg3)</Label>
                                <Input 
                                    className="h-9 font-mono" type="number"
                                    value={formData.agg3_actual || 0} 
                                    onChange={e => setFormData(v => ({...v, agg3_actual: parseFloat(e.target.value) || 0}))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[11px]">Frakcija 8-16 (Agg4)</Label>
                                <Input 
                                    className="h-9 font-mono" type="number"
                                    value={formData.agg4_actual || 0} 
                                    onChange={e => setFormData(v => ({...v, agg4_actual: parseFloat(e.target.value) || 0}))}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Section 3: Cements & Additives */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between border-b pb-2">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Cementi i Aditivi (kg)</h3>
                            <div className="text-xs text-blue-600 font-semibold">Voda (L)</div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[11px]">Cement 1 (Cem1)</Label>
                                <Input 
                                    className="h-9 font-mono text-blue-700" type="number"
                                    value={formData.cem1_actual || 0} 
                                    onChange={e => setFormData(v => ({...v, cem1_actual: parseFloat(e.target.value) || 0}))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[11px]">Cement 2 (Cem2)</Label>
                                <Input 
                                    className="h-9 font-mono text-blue-700" type="number"
                                    value={formData.cem2_actual || 0} 
                                    onChange={e => setFormData(v => ({...v, cem2_actual: parseFloat(e.target.value) || 0}))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[11px]">Aditiv 1 (Add1)</Label>
                                <Input 
                                    className="h-9 font-mono text-purple-700" type="number"
                                    value={formData.add1_actual || 0} 
                                    onChange={e => setFormData(v => ({...v, add1_actual: parseFloat(e.target.value) || 0}))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[11px]">Aditiv 2 (Add2)</Label>
                                <Input 
                                    className="h-9 font-mono text-purple-700" type="number"
                                    value={formData.add2_actual || 0} 
                                    onChange={e => setFormData(v => ({...v, add2_actual: parseFloat(e.target.value) || 0}))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[11px] font-bold text-blue-600">Voda (L)</Label>
                                <Input 
                                    className="h-9 font-mono border-blue-200 bg-blue-50/30" type="number"
                                    value={formData.water1_actual || 0} 
                                    onChange={e => setFormData(v => ({...v, water1_actual: parseFloat(e.target.value) || 0}))}
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
                                    onChange={(e) => setFormData(v => ({ ...v, customer: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Gradilište</Label>
                                <Input 
                                    className="h-9"
                                    value={formData.jobsite || ''} 
                                    onChange={(e) => setFormData(v => ({ ...v, jobsite: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Vozač</Label>
                                <Input 
                                    className="h-9"
                                    value={formData.driver || ''} 
                                    onChange={(e) => setFormData(v => ({ ...v, driver: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Vozilo</Label>
                                <Input 
                                    className="h-9"
                                    value={formData.vehicle || ''} 
                                    onChange={(e) => setFormData(v => ({ ...v, vehicle: e.target.value }))}
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
