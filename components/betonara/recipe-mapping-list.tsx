'use client';

import { useState } from 'react';
import { RecipeMapping } from '@/types/betonara';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { upsertRecipeMapping, deleteRecipeMapping } from '@/lib/actions/betonara';
import { toast } from 'sonner';

interface RecipeMappingListProps {
    initialMappings: RecipeMapping[];
}

export function RecipeMappingList({ initialMappings }: RecipeMappingListProps) {
    const [mappings, setMappings] = useState<RecipeMapping[]>(initialMappings);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newMapping, setNewMapping] = useState<{ original_name: string; mapped_name: string }>({
        original_name: '',
        mapped_name: '',
    });
    const [editForm, setEditForm] = useState<{ original_name: string; mapped_name: string }>({
        original_name: '',
        mapped_name: '',
    });

    const handleAdd = async () => {
        if (!newMapping.original_name || !newMapping.mapped_name) {
            toast.error('Molim vas popunite oba polja');
            return;
        }

        try {
            await upsertRecipeMapping(newMapping);
            toast.success('Mapping dodat');
            setNewMapping({ original_name: '', mapped_name: '' });
            // Refresh would be better, but for now we trust revalidatePath
            window.location.reload();
        } catch (error) {
            toast.error('Greška pri dodavanju');
        }
    };

    const handleEdit = (mapping: RecipeMapping) => {
        setEditingId(mapping.id);
        setEditForm({
            original_name: mapping.original_name,
            mapped_name: mapping.mapped_name,
        });
    };

    const handleSaveEdit = async (id: string) => {
        try {
            await upsertRecipeMapping({ id, ...editForm });
            toast.success('Mapping ažuriran');
            setEditingId(null);
            window.location.reload();
        } catch (error) {
            toast.error('Greška pri ažuriranju');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Da li ste sigurni?')) return;
        try {
            await deleteRecipeMapping(id);
            toast.success('Mapping obrisan');
            window.location.reload();
        } catch (error) {
            toast.error('Greška pri brisanju');
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-end gap-4 rounded-lg border bg-muted/50 p-4">
                <div className="grid flex-1 gap-2">
                    <label className="text-xs font-semibold uppercase text-muted-foreground">Originalni naziv (iz Excela)</label>
                    <Input
                        placeholder="npr. MB30-S"
                        value={newMapping.original_name}
                        onChange={(e) => setNewMapping(prev => ({ ...prev, original_name: e.target.value }))}
                    />
                </div>
                <div className="grid flex-1 gap-2">
                    <label className="text-xs font-semibold uppercase text-muted-foreground">Mapirani naziv (ERP)</label>
                    <Input
                        placeholder="npr. MB 30"
                        value={newMapping.mapped_name}
                        onChange={(e) => setNewMapping(prev => ({ ...prev, mapped_name: e.target.value }))}
                    />
                </div>
                <Button onClick={handleAdd}>
                    <Plus className="mr-2 h-4 w-4" />
                    Dodaj
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Originalni naziv</TableHead>
                            <TableHead>Mapirani naziv</TableHead>
                            <TableHead className="w-[100px]">Akcije</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mappings.map((mapping) => (
                            <TableRow key={mapping.id}>
                                <TableCell>
                                    {editingId === mapping.id ? (
                                        <Input
                                            value={editForm.original_name}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, original_name: e.target.value }))}
                                        />
                                    ) : (
                                        mapping.original_name
                                    )}
                                </TableCell>
                                <TableCell>
                                    {editingId === mapping.id ? (
                                        <Input
                                            value={editForm.mapped_name}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, mapped_name: e.target.value }))}
                                        />
                                    ) : (
                                        mapping.mapped_name
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        {editingId === mapping.id ? (
                                            <>
                                                <Button size="icon" variant="ghost" onClick={() => handleSaveEdit(mapping.id)}>
                                                    <Check className="h-4 w-4 text-green-600" />
                                                </Button>
                                                <Button size="icon" variant="ghost" onClick={() => setEditingId(null)}>
                                                    <X className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <Button size="icon" variant="ghost" onClick={() => handleEdit(mapping)}>
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" onClick={() => handleDelete(mapping.id)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {mappings.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                                    Nema definisanih mapiranja.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
