'use client';

import { useState, useEffect } from 'react';
import { BetonaraProductionRecord, BetonaraMaterial, BetonaraRecipe } from '@/types/betonara';
import { upsertManualProizvodnjaBetona, deleteProizvodnjaBetonaRecord, getBetonaraRecipes } from '@/lib/actions/betonara-v2';
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
import { Loader2, Save, Trash2, ChevronDown, ChevronRight, RefreshCw } from 'lucide-react';
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
    const [recipes, setRecipes] = useState<BetonaraRecipe[]>([]);
    const [showAggregates, setShowAggregates] = useState(false);
    const [showCementsAdditives, setShowCementsAdditives] = useState(false);
    const [showLogistics, setShowLogistics] = useState(false);

    useEffect(() => {
        getBetonaraRecipes().then(setRecipes);
    }, []);

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
            const recordId = record?.id;

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

    const hasMaterialData = (data: any) => {
        const fields = [
            'agg1_actual', 'agg2_actual', 'agg3_actual', 'agg4_actual', 'agg5_actual', 'agg6_actual',
            'cem1_actual', 'cem2_actual', 'cem3_actual', 'cem4_actual',
            'add1_actual', 'add2_actual', 'add3_actual', 'add4_actual', 'add5_actual',
            'water1_actual', 'water2_actual'
        ];
        return fields.some(f => (data[f] || 0) > 0);
    };

    const calculateMaterials = (recipeName: string, qty: number) => {
        const recipe = recipes.find(r => r.naziv === recipeName);
        if (!recipe) return {};

        return {
            agg1_actual: (recipe.agg1_kg || 0) * qty,
            agg2_actual: (recipe.agg2_kg || 0) * qty,
            agg3_actual: (recipe.agg3_kg || 0) * qty,
            agg4_actual: (recipe.agg4_kg || 0) * qty,
            agg5_actual: (recipe.agg5_kg || 0) * qty,
            agg6_actual: (recipe.agg6_kg || 0) * qty,
            cem1_actual: (recipe.cem1_kg || 0) * qty,
            cem2_actual: (recipe.cem2_kg || 0) * qty,
            cem3_actual: (recipe.cem3_kg || 0) * qty,
            cem4_actual: (recipe.cem4_kg || 0) * qty,
            add1_actual: (recipe.add1_kg || 0) * qty,
            add2_actual: (recipe.add2_kg || 0) * qty,
            add3_actual: (recipe.add3_kg || 0) * qty,
            add4_actual: (recipe.add4_kg || 0) * qty,
            add5_actual: (recipe.add5_kg || 0) * qty,
            water1_actual: (recipe.wat1_kg || 0) * qty,
            water2_actual: (recipe.wat2_kg || 0) * qty,
        };
    };

    const handleRecalculate = () => {
        if (!formData.recipe_number || !formData.total_quantity) {
            toast.error('Odaberite recepturu i unesite količinu');
            return;
        }

        if (hasMaterialData(formData)) {
            if (!confirm('Ova akcija će pregaziti postojeće unešene količine materijala. Želite li nastaviti?')) {
                return;
            }
        }

        const newMats = calculateMaterials(formData.recipe_number, formData.total_quantity);
        setFormData((prev: any) => ({ ...prev, ...newMats }));
        toast.success('Količine preračunate prema recepturi');
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
                                <Select
                                    value={formData.recipe_number}
                                    onValueChange={(val) => setFormData((prev: any) => ({ ...prev, recipe_number: val }))}
                                >
                                    <SelectTrigger className="h-10 w-full border-primary/20 bg-background">
                                        <SelectValue placeholder="Odaberi recepturu" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {recipes.map(r => (
                                            <SelectItem key={r.id} value={r.naziv}>
                                                {r.naziv}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
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
                        <div className="flex justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleRecalculate}
                                className="text-xs gap-2 border-dashed"
                            >
                                <RefreshCw className="h-3.5 w-3.5" />
                                Preračunaj stavke
                            </Button>
                        </div>
                    </section>

                    {/* Section 2: Aggregates */}
                    <section className="space-y-4 border rounded-lg p-4">
                        <button
                            type="button"
                            className="flex items-center justify-between w-full"
                            onClick={() => setShowAggregates(!showAggregates)}
                        >
                            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Agregati (kg)</h3>
                            {showAggregates ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </button>

                        {showAggregates && (
                            <div className="grid grid-cols-3 gap-4 pt-2">
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
                        )}
                    </section>

                    {/* Section 3: Cements & Additives */}
                    <section className="space-y-4 border rounded-lg p-4">
                        <button
                            type="button"
                            className="flex items-center justify-between w-full"
                            onClick={() => setShowCementsAdditives(!showCementsAdditives)}
                        >
                            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Cementi, Aditivi i Voda</h3>
                            {showCementsAdditives ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </button>

                        {showCementsAdditives && (
                            <div className="grid grid-cols-4 gap-4 pt-2">
                                {[1, 2, 3, 4].map(num => (
                                    <div key={num} className="space-y-1.5">
                                        <Label className="text-[10px]">Cem{num}</Label>
                                        <Input
                                            className="h-8 text-[11px] font-mono" type="number"
                                            value={formData[`cem${num}_actual`] || 0}
                                            onChange={e => setFormData((v: any) => ({ ...v, [`cem${num}_actual`]: parseFloat(e.target.value) || 0 }))}
                                        />
                                    </div>
                                ))}
                                {[1, 2, 3, 4, 5].map(num => (
                                    <div key={num} className="space-y-1.5">
                                        <Label className="text-[10px]">Add{num}</Label>
                                        <Input
                                            className="h-8 text-[11px] font-mono" type="number"
                                            value={formData[`add${num}_actual`] || 0}
                                            onChange={e => setFormData((v: any) => ({ ...v, [`add${num}_actual`]: parseFloat(e.target.value) || 0 }))}
                                        />
                                    </div>
                                ))}
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-bold text-blue-600">Wat1</Label>
                                    <Input
                                        className="h-8 text-[11px] font-mono border-primary/20" type="number"
                                        value={formData.water1_actual || 0}
                                        onChange={e => setFormData((v: any) => ({ ...v, water1_actual: parseFloat(e.target.value) || 0 }))}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-bold text-blue-600">Wat2</Label>
                                    <Input
                                        className="h-8 text-[11px] font-mono border-primary/20" type="number"
                                        value={formData.water2_actual || 0}
                                        onChange={e => setFormData((v: any) => ({ ...v, water2_actual: parseFloat(e.target.value) || 0 }))}
                                    />
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Section 4: Logistics & Extra */}
                    <section className="space-y-4 border rounded-lg p-4">
                        <button
                            type="button"
                            className="flex items-center justify-between w-full"
                            onClick={() => setShowLogistics(!showLogistics)}
                        >
                            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Logistika i ostalo</h3>
                            {showLogistics ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </button>

                        {showLogistics && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
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
                        )}
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
            </DialogContent >
        </Dialog >
    );
}
