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

                <Tabs defaultValue="general" className="flex-1 flex flex-col min-h-0">
                    <div className="px-6 border-b">
                        <TabsList className="bg-transparent w-full justify-start rounded-none h-12 gap-6 overflow-x-auto scrollbar-none">
                            <TabsTrigger value="general" className="data-[state=active]:border-b-2 border-primary rounded-none bg-transparent px-0 pb-3 pt-2 whitespace-nowrap">Osnovni podaci</TabsTrigger>
                            <TabsTrigger value="materials" className="data-[state=active]:border-b-2 border-primary rounded-none bg-transparent px-0 pb-3 pt-2 whitespace-nowrap">Materijali (Zbirno)</TabsTrigger>
                            <TabsTrigger value="advanced" className="data-[state=active]:border-b-2 border-primary rounded-none bg-transparent px-0 pb-3 pt-2 whitespace-nowrap">Vage (Detaljno)</TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                        <TabsContent value="general" className="mt-0 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Betonara</Label>
                                    <Select 
                                        value={formData.plant} 
                                        onValueChange={(val: any) => setFormData(v => ({ ...v, plant: val }))}
                                    >
                                        <SelectTrigger className="h-9">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Betonara 1">Betonara 1</SelectItem>
                                            <SelectItem value="Betonara 2">Betonara 2</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Datum i vrijeme</Label>
                                    <Input 
                                        className="h-9"
                                        type="datetime-local" 
                                        value={formData.date ? format(new Date(formData.date), "yyyy-MM-dd'T'HH:mm") : ''}
                                        onChange={(e) => setFormData(v => ({ ...v, date: new Date(e.target.value) }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Radni nalog</Label>
                                    <Input 
                                        className="h-9"
                                        value={formData.work_order_number || ''} 
                                        onChange={(e) => setFormData(v => ({ ...v, work_order_number: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Receptura (Ime)</Label>
                                    <Input 
                                        className="h-9"
                                        value={formData.recipe_number || ''} 
                                        onChange={(e) => setFormData(v => ({ ...v, recipe_number: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Recept br.</Label>
                                    <Input 
                                        className="h-9"
                                        value={formData.recipe_no || ''} 
                                        onChange={(e) => setFormData(v => ({ ...v, recipe_no: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Otpremnica / Prijemnica</Label>
                                    <Input 
                                        className="h-9"
                                        value={formData.issuance_number || ''} 
                                        onChange={(e) => setFormData(v => ({ ...v, issuance_number: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Količina m³ (Stvarna)</Label>
                                    <Input 
                                        className="h-9"
                                        type="number" step="0.01"
                                        value={formData.total_quantity || 0} 
                                        onChange={(e) => setFormData(v => ({ ...v, total_quantity: parseFloat(e.target.value) || 0 }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Količina m³ (Ciljna)</Label>
                                    <Input 
                                        className="h-9"
                                        type="number" step="0.01"
                                        value={formData.target_quantity || 0} 
                                        onChange={(e) => setFormData(v => ({ ...v, target_quantity: parseFloat(e.target.value) || 0 }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Voda (L)</Label>
                                    <Input 
                                        className="h-9"
                                        type="number" step="0.1"
                                        value={formData.water || 0} 
                                        onChange={(e) => setFormData(v => ({ ...v, water: parseFloat(e.target.value) || 0 }))}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
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
                        </TabsContent>

                        <TabsContent value="materials" className="mt-0">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                                {materials.map(m => (
                                    <div key={m.code} className="flex items-center gap-3">
                                        <div className="flex-1 min-w-0">
                                            <Label className="text-xs truncate" title={m.name}>{m.name}</Label>
                                            <div className="text-[10px] text-muted-foreground">{m.code}</div>
                                        </div>
                                        <Input 
                                            className="w-32 h-8 text-right font-mono"
                                            type="number" step="0.01"
                                            value={formData.materials?.[m.code] || 0}
                                            onChange={(e) => updateMaterial(m.code, e.target.value)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="advanced" className="mt-0 space-y-8">
                            {/* Aggregates */}
                            <div className="space-y-3">
                                <h3 className="font-semibold text-sm border-b pb-1">Agregati</h3>
                                <div className="grid grid-cols-1 gap-4">
                                    {[1, 2, 3, 4, 5, 6].map(i => (
                                        <div key={`agg${i}`} className="grid grid-cols-5 gap-2 items-end">
                                            <div className="text-xs font-bold pb-2">Vaga {i}</div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px]">Actual</Label>
                                                <Input className="h-7 text-xs" type="number" value={(formData as any)[`agg${i}_actual`] || 0} onChange={e => setFormData(v => ({...v, [`agg${i}_actual`]: parseFloat(e.target.value)}))}/>
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px]">Target</Label>
                                                <Input className="h-7 text-xs" type="number" value={(formData as any)[`agg${i}_target`] || 0} onChange={e => setFormData(v => ({...v, [`agg${i}_target`]: parseFloat(e.target.value)}))}/>
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px]">Hata (Error)</Label>
                                                <Input className="h-7 text-xs" type="number" value={(formData as any)[`agg${i}_error`] || 0} onChange={e => setFormData(v => ({...v, [`agg${i}_error`]: parseFloat(e.target.value)}))}/>
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px]">%</Label>
                                                <Input className="h-7 text-xs" type="number" value={(formData as any)[`agg${i}_pct`] || 0} onChange={e => setFormData(v => ({...v, [`agg${i}_pct`]: parseFloat(e.target.value)}))}/>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Cements */}
                            <div className="space-y-3">
                                <h3 className="font-semibold text-sm border-b pb-1 text-blue-600">Cementi</h3>
                                <div className="grid grid-cols-1 gap-4">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={`cem${i}`} className="grid grid-cols-5 gap-2 items-end">
                                            <div className="text-xs font-bold pb-2">Cem {i}</div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px]">Actual</Label>
                                                <Input className="h-7 text-xs" type="number" value={(formData as any)[`cem${i}_actual`] || 0} onChange={e => setFormData(v => ({...v, [`cem${i}_actual`]: parseFloat(e.target.value)}))}/>
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px]">Target</Label>
                                                <Input className="h-7 text-xs" type="number" value={(formData as any)[`cem${i}_target`] || 0} onChange={e => setFormData(v => ({...v, [`cem${i}_target`]: parseFloat(e.target.value)}))}/>
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px]">Error</Label>
                                                <Input className="h-7 text-xs" type="number" value={(formData as any)[`cem${i}_error`] || 0} onChange={e => setFormData(v => ({...v, [`cem${i}_error`]: parseFloat(e.target.value)}))}/>
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px]">%</Label>
                                                <Input className="h-7 text-xs" type="number" value={(formData as any)[`cem${i}_pct`] || 0} onChange={e => setFormData(v => ({...v, [`cem${i}_pct`]: parseFloat(e.target.value)}))}/>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>

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
